import type { TaxonomyScope } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function getTaxonomies(scope: TaxonomyScope, onlyActive = true) {
  return prisma.taxonomy.findMany({ where: { scope, ...(onlyActive ? { isActive: true } : {}) }, orderBy: [{ order: "asc" }, { name: "asc" }] });
}

/** Taxonomías de restaurante agrupadas por familia (mismo criterio que dto.ts). */
export async function getRestaurantTaxonomyGroups() {
  const all = await getTaxonomies("RESTAURANT");
  return {
    cuisines: all.filter((t) => t.order < 20),
    establishment: all.filter((t) => t.order >= 20 && t.order < 30),
    features: all.filter((t) => t.order >= 30 && t.order < 40),
    preferences: all.filter((t) => t.order >= 40),
  };
}

/** Cocinas con número de restaurantes publicados, para la home y /categories. */
export async function getCuisinesWithCounts() {
  const rows = await prisma.taxonomy.findMany({
    where: { scope: "RESTAURANT", isActive: true, order: { lt: 20 } },
    include: { _count: { select: { restaurants: { where: { restaurant: { status: "APPROVED", isActive: true } } } } } },
    orderBy: { order: "asc" },
  });
  return rows.map((t) => ({ id: t.id, slug: t.slug, name: t.name, icon: t.icon, count: t._count.restaurants }));
}

export async function getAllTaxonomiesForAdmin() {
  return prisma.taxonomy.findMany({
    include: { _count: { select: { restaurants: true, dishTaxonomies: true, menuCategories: true } } },
    orderBy: [{ scope: "asc" }, { order: "asc" }],
  });
}
