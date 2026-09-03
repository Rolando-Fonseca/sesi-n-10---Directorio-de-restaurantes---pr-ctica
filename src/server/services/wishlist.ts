import type { User } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { AddToWishlistInput } from "@/lib/validations/wishlist";
import { notFound } from "./errors";
import { awardPoints } from "./gamification";

/** Añade un plato a la lista de deseos. Si ya está, actualiza cantidad y notas. */
export async function addToWishlist(user: User, input: AddToWishlistInput) {
  const dish = await prisma.dish.findUnique({
    where: { id: input.dishId },
    include: { menu: { include: { restaurants: { select: { restaurantId: true }, take: 1 } } } },
  });
  const restaurantId = dish?.menu.restaurants[0]?.restaurantId;
  if (!dish || !restaurantId) throw notFound("El plato");

  const item = await prisma.wishlistItem.upsert({
    where: { userId_dishId: { userId: user.id, dishId: dish.id } },
    update: { quantity: input.quantity, notes: input.notes },
    create: { userId: user.id, dishId: dish.id, restaurantId, quantity: input.quantity, notes: input.notes },
  });
  await awardPoints(user.id, "WISHLIST_CREATED", item.id);
  return item;
}

export async function removeFromWishlist(user: User, dishId: string) {
  await prisma.wishlistItem.deleteMany({ where: { userId: user.id, dishId } });
}

export async function clearWishlistForRestaurant(user: User, restaurantId: string) {
  await prisma.wishlistItem.deleteMany({ where: { userId: user.id, restaurantId } });
}
