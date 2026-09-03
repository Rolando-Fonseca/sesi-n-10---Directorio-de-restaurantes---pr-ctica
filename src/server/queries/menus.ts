import { prisma } from "@/lib/db";
import { dishInclude, toDishDto } from "./dto";

export async function getMenusByOwner(ownerId: string) {
  return prisma.menu.findMany({
    where: { ownerId },
    include: {
      restaurants: { include: { restaurant: { select: { id: true, name: true, slug: true, status: true } } } },
      _count: { select: { dishes: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

/** Carta completa para el editor del dueño. */
export async function getMenuForEditor(menuId: string, ownerId: string, isAdmin = false) {
  const menu = await prisma.menu.findFirst({
    where: { id: menuId, ...(isAdmin ? {} : { ownerId }) },
    include: {
      restaurants: { include: { restaurant: { select: { id: true, name: true, slug: true, menuCategories: { orderBy: { order: "asc" } } } } } },
      dishes: { include: { ...dishInclude, category: { select: { id: true, name: true } } }, orderBy: { order: "asc" } },
    },
  });
  if (!menu) return null;
  return {
    ...menu,
    price: menu.price == null ? null : Number(menu.price),
    dishes: menu.dishes.map((d) => ({ ...toDishDto(d), categoryId: d.categoryId, category: d.category, taxonomyIds: d.taxonomies.map((t) => t.taxonomyId) })),
  };
}

export async function getAllMenusForAdmin(page = 1, limit = 30) {
  const [items, total] = await Promise.all([
    prisma.menu.findMany({
      include: { owner: { select: { id: true, email: true } }, restaurants: { include: { restaurant: { select: { name: true, slug: true } } } }, _count: { select: { dishes: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.menu.count(),
  ]);
  return { items, page, limit, total, pages: Math.ceil(total / limit) };
}
