import type { Prisma } from "@prisma/client";

/**
 * DTOs de lectura. Coinciden con los tipos públicos de docs/api.md, de modo
 * que páginas y route handlers devuelven la misma forma.
 */

export type TaxonomyRef = { id: string; slug: string; name: string; icon: string | null };

export type RestaurantSummary = {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  priceRange: "CHEAP" | "MODERATE" | "EXPENSIVE" | "LUXURY" | null;
  averageRating: number;
  reviewCount: number;
  coverUrl: string | null;
  latitude: number;
  longitude: number;
  cuisines: TaxonomyRef[];
  distanceKm?: number;
};

export type DishDto = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  presentation: TaxonomyRef | null;
  allergens: TaxonomyRef[];
};

export type MenuDto = {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  categories: { id: string; slug: string; name: string; dishes: DishDto[] }[];
};

export type RestaurantDetail = RestaurantSummary & {
  description: string | null;
  address: string;
  postalCode: string | null;
  phone: string | null;
  website: string | null;
  logoUrl: string | null;
  gallery: string[];
  status: string;
  features: TaxonomyRef[];
  establishment: TaxonomyRef[];
  preferences: TaxonomyRef[];
  ratingBreakdown: Record<"AMBIANCE" | "SERVICE" | "FOOD" | "VALUE", number>;
  menus: MenuDto[];
  owner: { id: string; name: string };
};

export type ReviewDto = {
  id: string;
  comment: string | null;
  photos: string[];
  createdAt: string;
  average: number;
  ratings: Record<string, number>;
  author: { id: string; name: string; imageUrl: string | null; level: number };
  restaurant?: { id: string; slug: string; name: string };
};

// ---- selects reutilizables ----

export const taxonomyRefSelect = { id: true, slug: true, name: true, icon: true } satisfies Prisma.TaxonomySelect;

export const restaurantSummaryInclude = {
  taxonomies: { include: { taxonomy: { select: { ...taxonomyRefSelect, order: true } } } },
} satisfies Prisma.RestaurantInclude;

type RestaurantWithTaxonomies = Prisma.RestaurantGetPayload<{ include: typeof restaurantSummaryInclude }>;

/** Las cocinas son las taxonomías RESTAURANT con order < 20 (ver seed). */
const isCuisine = (t: { order: number }) => t.order < 20;
const isEstablishment = (t: { order: number }) => t.order >= 20 && t.order < 30;
const isFeature = (t: { order: number }) => t.order >= 30 && t.order < 40;
const isPreference = (t: { order: number }) => t.order >= 40;

const ref = (t: { id: string; slug: string; name: string; icon: string | null }): TaxonomyRef => ({ id: t.id, slug: t.slug, name: t.name, icon: t.icon });

export function toRestaurantSummary(r: RestaurantWithTaxonomies): RestaurantSummary {
  const tax = r.taxonomies.map((x) => x.taxonomy);
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
    cuisines: tax.filter(isCuisine).map(ref),
  };
}

export function splitTaxonomies(tax: { id: string; slug: string; name: string; icon: string | null; order: number }[]) {
  return {
    cuisines: tax.filter(isCuisine).map(ref),
    establishment: tax.filter(isEstablishment).map(ref),
    features: tax.filter(isFeature).map(ref),
    preferences: tax.filter(isPreference).map(ref),
  };
}

export const dishInclude = {
  taxonomies: { include: { taxonomy: { select: { ...taxonomyRefSelect, scope: true } } } },
} satisfies Prisma.DishInclude;

export function toDishDto(d: Prisma.DishGetPayload<{ include: typeof dishInclude }>): DishDto {
  const tax = d.taxonomies.map((x) => x.taxonomy);
  return {
    id: d.id,
    slug: d.slug,
    name: d.name,
    description: d.description,
    price: Number(d.price),
    imageUrl: d.imageUrl,
    isAvailable: d.isAvailable,
    isFeatured: d.isFeatured,
    presentation: tax.filter((t) => t.scope === "MENU_PRESENTATION").map(ref)[0] ?? null,
    allergens: tax.filter((t) => t.scope === "MENU_ALLERGEN").map(ref),
  };
}
