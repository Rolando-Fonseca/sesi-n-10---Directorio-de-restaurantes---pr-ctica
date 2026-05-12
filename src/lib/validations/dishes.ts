import { z } from "zod";

export const createDishSchema = z.object({
  menuId: z.string().uuid(),
  categoryId: z.string().uuid().optional(),
  name: z.string().min(2).max(100),
  description: z.string().max(1000).optional(),
  price: z.number().min(0),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  taxonomyIds: z.array(z.string().uuid()).optional(),
});

export const updateDishSchema = createDishSchema.partial().omit({ menuId: true });

export type CreateDishInput = z.infer<typeof createDishSchema>;
export type UpdateDishInput = z.infer<typeof updateDishSchema>;
