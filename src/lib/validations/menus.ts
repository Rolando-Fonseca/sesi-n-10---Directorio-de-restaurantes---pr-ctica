import { z } from "zod";

export const createMenuSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().max(2000).optional(),
  price: z.number().min(0).optional(),
  restaurantIds: z.array(z.string().uuid()).min(1),
});

export const updateMenuSchema = createMenuSchema.partial();

export type CreateMenuInput = z.infer<typeof createMenuSchema>;
export type UpdateMenuInput = z.infer<typeof updateMenuSchema>;
