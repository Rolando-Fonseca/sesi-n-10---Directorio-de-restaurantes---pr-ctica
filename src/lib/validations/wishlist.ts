import { z } from "zod";

export const addToWishlistSchema = z.object({
  dishId: z.string().uuid(),
  quantity: z.number().int().min(1).max(20).default(1),
  notes: z.string().max(200).optional(),
});

export type AddToWishlistInput = z.infer<typeof addToWishlistSchema>;
