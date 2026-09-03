"use server";

import { z } from "zod";
import { addToWishlistSchema } from "@/lib/validations/wishlist";
import { addToWishlist, clearWishlistForRestaurant, removeFromWishlist } from "@/server/services/wishlist";
import { runAction } from "./_helpers";

const PATHS = ["/dashboard/user/wishlist", "/restaurant/[slug]"];

export async function addToWishlistAction(input: unknown) {
  return runAction({ schema: addToWishlistSchema, input, revalidate: PATHS, handler: async (data, { user }) => ({ id: (await addToWishlist(user, data)).id }) });
}

export async function removeFromWishlistAction(input: unknown) {
  return runAction({
    schema: z.object({ dishId: z.string().uuid() }),
    input,
    revalidate: PATHS,
    handler: async ({ dishId }, { user }) => (await removeFromWishlist(user, dishId), { dishId }),
  });
}

export async function clearWishlistForRestaurantAction(input: unknown) {
  return runAction({
    schema: z.object({ restaurantId: z.string().uuid() }),
    input,
    revalidate: PATHS,
    handler: async ({ restaurantId }, { user }) => (await clearWishlistForRestaurant(user, restaurantId), { restaurantId }),
  });
}
