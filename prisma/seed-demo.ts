import type { PrismaClient } from "@prisma/client";
import { restaurants, reviews, users } from "./seed-data";

const CRITERIA = ["AMBIANCE", "SERVICE", "FOOD", "VALUE"] as const;
const CATEGORY_NAMES: Record<string, string> = {
  entrantes: "Entrantes",
  principales: "Principales",
  postres: "Postres",
  bebidas: "Bebidas",
  tapas: "Tapas",
};

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(13 + (days % 8), (days * 7) % 60, 0, 0);
  return d;
}

/**
 * Inserta los datos de demostración de forma idempotente: cada ejecución
 * deja el mismo resultado (upsert por slug, id o clave única).
 */
export async function seedDemo(prisma: PrismaClient) {
  // -------- Usuarios --------
  for (const u of users) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: { email: u.email, firstName: u.firstName, lastName: u.lastName, role: u.role, points: u.points ?? 0 },
      create: { id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName, role: u.role, points: u.points ?? 0 },
    });
  }
  console.log(`Usuarios de demo: ${users.length}`);

  // -------- Taxonomías (mapa slug → id) --------
  const taxonomies = await prisma.taxonomy.findMany({ select: { id: true, slug: true, scope: true } });
  const taxBySlug = new Map(taxonomies.map((t) => [`${t.scope}:${t.slug}`, t.id]));
  const tax = (scope: string, slug: string) => {
    const id = taxBySlug.get(`${scope}:${slug}`);
    if (!id) throw new Error(`Taxonomía no encontrada: ${scope}:${slug} (ejecuta primero el seed base)`);
    return id;
  };

  // -------- Restaurantes, cartas y platos --------
  let dishCount = 0;
  for (const r of restaurants) {
    const coverUrl = `/images/restaurants/${r.slug}.jpg`;
    const restaurant = await prisma.restaurant.upsert({
      where: { slug: r.slug },
      update: {
        name: r.name,
        ownerId: r.ownerId,
        description: r.description,
        address: r.address,
        city: r.city,
        postalCode: r.postalCode,
        latitude: r.latitude,
        longitude: r.longitude,
        phone: r.phone,
        website: r.website,
        priceRange: r.priceRange,
        status: r.status,
        rejectionReason: r.rejectionReason,
        coverUrl,
      },
      create: {
        slug: r.slug,
        name: r.name,
        ownerId: r.ownerId,
        description: r.description,
        address: r.address,
        city: r.city,
        postalCode: r.postalCode,
        latitude: r.latitude,
        longitude: r.longitude,
        phone: r.phone,
        website: r.website,
        priceRange: r.priceRange,
        status: r.status,
        rejectionReason: r.rejectionReason,
        coverUrl,
      },
    });

    // Taxonomías del restaurante: se reemplazan para que el seed sea idempotente
    await prisma.restaurantTaxonomy.deleteMany({ where: { restaurantId: restaurant.id } });
    await prisma.restaurantTaxonomy.createMany({
      data: r.taxonomies.map((slug) => ({ restaurantId: restaurant.id, taxonomyId: tax("RESTAURANT", slug) })),
    });

    // Carta: una por restaurante en la demo, identificada por owner + título
    let menu = await prisma.menu.findFirst({ where: { ownerId: r.ownerId, title: r.menu.title, restaurants: { some: { restaurantId: restaurant.id } } } });
    if (!menu) {
      menu = await prisma.menu.create({
        data: {
          ownerId: r.ownerId,
          title: r.menu.title,
          description: r.menu.description,
          price: r.menu.price,
          restaurants: { create: { restaurantId: restaurant.id } },
        },
      });
    } else {
      await prisma.menu.update({ where: { id: menu.id }, data: { description: r.menu.description, price: r.menu.price } });
    }

    // Categorías locales del restaurante, enlazadas a la taxonomía global si existe
    const usedCategories = [...new Set(r.menu.dishes.map((d) => d.category))];
    const categoryIds = new Map<string, string>();
    for (const [order, slug] of usedCategories.entries()) {
      const category = await prisma.menuCategory.upsert({
        where: { restaurantId_slug: { restaurantId: restaurant.id, slug } },
        update: { name: CATEGORY_NAMES[slug], order },
        create: {
          restaurantId: restaurant.id,
          slug,
          name: CATEGORY_NAMES[slug],
          order,
          taxonomyId: taxBySlug.get(`MENU_CATEGORY:${slug}`) ?? null,
        },
      });
      categoryIds.set(slug, category.id);
    }

    // Platos
    for (const [order, d] of r.menu.dishes.entries()) {
      const dishSlug = d.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const imageUrl = d.image ? `/images/dishes/${d.image}.jpg` : null;
      const dish = await prisma.dish.upsert({
        where: { menuId_slug: { menuId: menu.id, slug: dishSlug } },
        update: { name: d.name, price: d.price, description: d.description, categoryId: categoryIds.get(d.category), order, isFeatured: d.featured ?? false, imageUrl },
        create: {
          menuId: menu.id,
          slug: dishSlug,
          name: d.name,
          price: d.price,
          description: d.description,
          categoryId: categoryIds.get(d.category),
          order,
          isFeatured: d.featured ?? false,
          imageUrl,
        },
      });
      const dishTaxonomyIds = [
        ...(d.allergens ?? []).map((slug) => tax("MENU_ALLERGEN", slug)),
        ...(d.presentation ? [tax("MENU_PRESENTATION", d.presentation)] : []),
      ];
      await prisma.dishTaxonomy.deleteMany({ where: { dishId: dish.id } });
      if (dishTaxonomyIds.length) {
        await prisma.dishTaxonomy.createMany({ data: dishTaxonomyIds.map((taxonomyId) => ({ dishId: dish.id, taxonomyId })) });
      }
      dishCount++;
    }
  }
  console.log(`Restaurantes de demo: ${restaurants.length}, platos: ${dishCount}`);

  // -------- Reseñas --------
  const restaurantIds = new Map((await prisma.restaurant.findMany({ select: { id: true, slug: true } })).map((r) => [r.slug, r.id]));
  for (const rv of reviews) {
    const restaurantId = restaurantIds.get(rv.restaurant)!;
    const review = await prisma.review.upsert({
      where: { restaurantId_userId: { restaurantId, userId: rv.user } },
      update: { comment: rv.comment, createdAt: daysAgo(rv.daysAgo) },
      create: { restaurantId, userId: rv.user, comment: rv.comment, isVerified: true, createdAt: daysAgo(rv.daysAgo) },
    });
    await prisma.reviewRating.deleteMany({ where: { reviewId: review.id } });
    await prisma.reviewRating.createMany({
      data: CRITERIA.map((criterion, i) => ({ reviewId: review.id, criterion, score: rv.ratings[i] })),
    });
  }

  // Medias por restaurante (misma regla que usará el servicio de reseñas)
  for (const [, restaurantId] of restaurantIds) {
    const ratings = await prisma.reviewRating.findMany({ where: { review: { restaurantId, isActive: true } }, select: { score: true, reviewId: true } });
    const reviewCount = new Set(ratings.map((r) => r.reviewId)).size;
    const averageRating = ratings.length ? Math.round((ratings.reduce((s, r) => s + r.score, 0) / ratings.length) * 10) / 10 : 0;
    await prisma.restaurant.update({ where: { id: restaurantId }, data: { averageRating, reviewCount } });
  }
  console.log(`Reseñas de demo: ${reviews.length}`);

  // -------- Notificaciones de admin para lo que está pendiente --------
  const pending = await prisma.restaurant.findMany({ where: { status: "PENDING" }, select: { id: true, name: true } });
  for (const p of pending) {
    const exists = await prisma.notification.findFirst({ where: { type: "NEW_RESTAURANT_CREATED", referenceId: p.id } });
    if (!exists) {
      await prisma.notification.create({
        data: {
          userId: "user_seed_admin",
          type: "NEW_RESTAURANT_CREATED",
          title: "Nuevo restaurante pendiente de aprobación",
          message: `${p.name} se ha dado de alta y espera revisión.`,
          referenceId: p.id,
        },
      });
    }
  }
  console.log(`Notificaciones pendientes: ${pending.length}`);
}
