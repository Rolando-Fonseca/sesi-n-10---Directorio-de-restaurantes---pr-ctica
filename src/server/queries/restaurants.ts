import type { Prisma, RestaurantStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { boundingBox } from "@/lib/geolocation";
import { annotateAndFilterByDistance } from "@/server/services/geo";
import { aggregateRatings } from "@/server/services/ratings";
import { dishInclude, restaurantSummaryInclude, splitTaxonomies, toDishDto, toRestaurantSummary, type RestaurantDetail, type RestaurantSummary } from "./dto";

export type RestaurantSearchParams = {
  query?: string;
  city?: string;
  cuisine?: string[];
  feature?: string[];
  price?: ("CHEAP" | "MODERATE" | "EXPENSIVE" | "LUXURY")[];
  lat?: number;
  lng?: number;
  radius?: number;
  sort?: "rating" | "distance" | "recent" | "name";
  page?: number;
  limit?: number;
};

export type Paginated<T> = { items: T[]; page: number; limit: number; total: number; pages: number };

const PUBLIC_WHERE: Prisma.RestaurantWhereInput = { status: "APPROVED", isActive: true };

function buildWhere(p: RestaurantSearchParams): Prisma.RestaurantWhereInput {
  const and: Prisma.RestaurantWhereInput[] = [PUBLIC_WHERE];
  if (p.query) {
    and.push({
      OR: [
        { name: { contains: p.query, mode: "insensitive" } },
        { description: { contains: p.query, mode: "insensitive" } },
        { city: { contains: p.query, mode: "insensitive" } },
        { menus: { some: { menu: { dishes: { some: { name: { contains: p.query, mode: "insensitive" } } } } } } },
      ],
    });
  }
  if (p.city) and.push({ city: { equals: p.city, mode: "insensitive" } });
  if (p.price?.length) and.push({ priceRange: { in: p.price } });
  for (const slug of p.cuisine ?? []) and.push({ taxonomies: { some: { taxonomy: { slug, scope: "RESTAURANT" } } } });
  for (const slug of p.feature ?? []) and.push({ taxonomies: { some: { taxonomy: { slug, scope: "RESTAURANT" } } } });
  if (p.lat != null && p.lng != null) {
    const box = boundingBox(p.lat, p.lng, p.radius ?? 10);
    and.push({ latitude: { gte: box.minLat, lte: box.maxLat }, longitude: { gte: box.minLon, lte: box.maxLon } });
  }
  return { AND: and };
}

/** Directorio público con filtros, radio y paginación. */
export async function searchRestaurants(p: RestaurantSearchParams): Promise<Paginated<RestaurantSummary>> {
  const page = Math.max(1, p.page ?? 1);
  const limit = Math.min(50, Math.max(1, p.limit ?? 20));
  const where = buildWhere(p);
  const geo = p.lat != null && p.lng != null;
  const orderBy: Prisma.RestaurantOrderByWithRelationInput[] =
    p.sort === "recent" ? [{ createdAt: "desc" }] : p.sort === "name" ? [{ name: "asc" }] : [{ averageRating: "desc" }, { reviewCount: "desc" }];

  if (geo) {
    // Con geolocalización: se filtra por caja en SQL y se afina y ordena por distancia en memoria.
    const rows = await prisma.restaurant.findMany({ where, include: restaurantSummaryInclude, orderBy });
    const located = annotateAndFilterByDistance(rows.map(toRestaurantSummary), { latitude: p.lat!, longitude: p.lng! }, p.radius ?? 10);
    const sorted = p.sort && p.sort !== "distance" ? located.sort(compareBy(p.sort)) : located;
    const total = sorted.length;
    return { items: sorted.slice((page - 1) * limit, page * limit), page, limit, total, pages: Math.ceil(total / limit) };
  }

  const [rows, total] = await Promise.all([
    prisma.restaurant.findMany({ where, include: restaurantSummaryInclude, orderBy, skip: (page - 1) * limit, take: limit }),
    prisma.restaurant.count({ where }),
  ]);
  return { items: rows.map(toRestaurantSummary), page, limit, total, pages: Math.ceil(total / limit) };
}

function compareBy(sort: "rating" | "recent" | "name") {
  return (a: RestaurantSummary, b: RestaurantSummary) =>
    sort === "name" ? a.name.localeCompare(b.name, "es") : sort === "rating" ? b.averageRating - a.averageRating || b.reviewCount - a.reviewCount : 0;
}

export async function getFeaturedRestaurants(limit = 6): Promise<RestaurantSummary[]> {
  const rows = await prisma.restaurant.findMany({
    where: { ...PUBLIC_WHERE, reviewCount: { gt: 0 } },
    include: restaurantSummaryInclude,
    orderBy: [{ averageRating: "desc" }, { reviewCount: "desc" }],
    take: limit,
  });
  return rows.map(toRestaurantSummary);
}

/** Ciudades con restaurantes publicados y cuántos hay en cada una. */
export async function getCities(): Promise<{ city: string; count: number }[]> {
  const rows = await prisma.restaurant.groupBy({ by: ["city"], where: PUBLIC_WHERE, _count: true, orderBy: { _count: { city: "desc" } } });
  return rows.filter((r) => r.city).map((r) => ({ city: r.city!, count: r._count }));
}

export async function getRestaurantBySlug(slug: string, opts: { includeUnpublished?: boolean } = {}): Promise<RestaurantDetail | null> {
  const r = await prisma.restaurant.findUnique({
    where: { slug },
    include: {
      taxonomies: { include: { taxonomy: { select: { id: true, slug: true, name: true, icon: true, order: true } } } },
      owner: { select: { id: true, firstName: true, lastName: true } },
      menuCategories: { orderBy: { order: "asc" } },
      menus: {
        include: {
          menu: { include: { dishes: { where: { isAvailable: true }, include: dishInclude, orderBy: { order: "asc" } } } },
        },
      },
      reviews: { where: { isActive: true }, select: { ratings: { select: { reviewId: true, criterion: true, score: true } } } },
    },
  });
  if (!r) return null;
  if (!opts.includeUnpublished && !(r.status === "APPROVED" && r.isActive)) return null;

  const tax = splitTaxonomies(r.taxonomies.map((t) => t.taxonomy));
  const { breakdown } = aggregateRatings(r.reviews.flatMap((rv) => rv.ratings));
  const categories = r.menuCategories;

  const menus = r.menus
    .filter((m) => m.menu.isActive)
    .map(({ menu }) => {
      const byCategory = new Map<string | null, ReturnType<typeof toDishDto>[]>();
      for (const d of menu.dishes) {
        const key = d.categoryId ?? null;
        byCategory.set(key, [...(byCategory.get(key) ?? []), toDishDto(d)]);
      }
      const ordered = [
        ...categories.filter((c) => byCategory.has(c.id)).map((c) => ({ id: c.id, slug: c.slug, name: c.name, dishes: byCategory.get(c.id)! })),
        ...(byCategory.has(null) ? [{ id: "sin-categoria", slug: "otros", name: "Otros", dishes: byCategory.get(null)! }] : []),
      ];
      return { id: menu.id, title: menu.title, description: menu.description, price: menu.price == null ? null : Number(menu.price), categories: ordered };
    });

  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    city: r.city,
    priceRange: r.priceRange,
    averageRating: r.averageRating ?? 0,
    reviewCount: r.reviewCount,
    coverUrl: r.coverUrl,
    latitude: r.latitude,
    longitude: r.longitude,
    description: r.description,
    address: r.address,
    postalCode: r.postalCode,
    phone: r.phone,
    website: r.website,
    logoUrl: r.logoUrl,
    gallery: r.gallery,
    status: r.status,
    cuisines: tax.cuisines,
    establishment: tax.establishment,
    features: tax.features,
    preferences: tax.preferences,
    ratingBreakdown: breakdown,
    menus,
    owner: { id: r.owner.id, name: [r.owner.firstName, r.owner.lastName].filter(Boolean).join(" ") || "Propietario" },
  };
}

/** Slugs publicados, para sitemap y generateStaticParams. */
export async function getPublishedSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  return prisma.restaurant.findMany({ where: PUBLIC_WHERE, select: { slug: true, updatedAt: true } });
}

// ---------------- Panel de dueño ----------------

export async function getRestaurantsByOwner(ownerId: string) {
  return prisma.restaurant.findMany({
    where: { ownerId },
    include: { ...restaurantSummaryInclude, _count: { select: { menus: true, reviews: true, wishlistItems: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOwnedRestaurant(ownerId: string, id: string, isAdmin = false) {
  return prisma.restaurant.findFirst({
    where: { id, ...(isAdmin ? {} : { ownerId }) },
    include: {
      taxonomies: { select: { taxonomyId: true } },
      menuCategories: { orderBy: { order: "asc" } },
      menus: { include: { menu: { include: { _count: { select: { dishes: true } } } } } },
    },
  });
}

// ---------------- Panel de admin ----------------

export async function getRestaurantsByStatus(status?: RestaurantStatus, page = 1, limit = 20) {
  const where = status ? { status } : {};
  const [items, total] = await Promise.all([
    prisma.restaurant.findMany({
      where,
      include: { owner: { select: { id: true, email: true, firstName: true, lastName: true } }, ...restaurantSummaryInclude },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.restaurant.count({ where }),
  ]);
  return { items, page, limit, total, pages: Math.ceil(total / limit) };
}

export async function countRestaurantsByStatus(): Promise<Record<RestaurantStatus, number>> {
  const rows = await prisma.restaurant.groupBy({ by: ["status"], _count: true });
  const base: Record<RestaurantStatus, number> = { PENDING: 0, APPROVED: 0, REJECTED: 0, ARCHIVED: 0 };
  for (const r of rows) base[r.status] = r._count;
  return base;
}
