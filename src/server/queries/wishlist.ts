import { prisma } from "@/lib/db";
import { dishInclude, toDishDto } from "./dto";

export type WishlistGroup = {
  restaurant: { id: string; slug: string; name: string; coverUrl: string | null };
  items: { id: string; quantity: number; notes: string | null; dish: ReturnType<typeof toDishDto>; subtotal: number }[];
  total: number;
};

/** Lista de deseos agrupada por restaurante con total, estilo carrito. */
export async function getWishlistGrouped(userId: string): Promise<WishlistGroup[]> {
  const rows = await prisma.wishlistItem.findMany({
    where: { userId },
    include: { dish: { include: dishInclude }, restaurant: { select: { id: true, slug: true, name: true, coverUrl: true } } },
    orderBy: { createdAt: "desc" },
  });
  const groups = new Map<string, WishlistGroup>();
  for (const row of rows) {
    const dish = toDishDto(row.dish);
    const subtotal = Math.round(dish.price * row.quantity * 100) / 100;
    const g = groups.get(row.restaurant.id) ?? { restaurant: row.restaurant, items: [], total: 0 };
    g.items.push({ id: row.id, quantity: row.quantity, notes: row.notes, dish, subtotal });
    g.total = Math.round((g.total + subtotal) * 100) / 100;
    groups.set(row.restaurant.id, g);
  }
  return [...groups.values()];
}

export async function getWishlistDishIds(userId: string): Promise<Set<string>> {
  const rows = await prisma.wishlistItem.findMany({ where: { userId }, select: { dishId: true } });
  return new Set(rows.map((r) => r.dishId));
}
