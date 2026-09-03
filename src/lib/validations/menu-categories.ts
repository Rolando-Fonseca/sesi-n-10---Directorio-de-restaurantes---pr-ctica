import { z } from "zod";

export const createMenuCategorySchema = z.object({
  restaurantId: z.string().uuid(),
  name: z.string().min(2).max(60),
  description: z.string().max(300).optional(),
  taxonomyId: z.string().uuid().optional(),
  order: z.number().int().min(0).default(0),
});

export const updateMenuCategorySchema = createMenuCategorySchema.partial().omit({ restaurantId: true });

export type CreateMenuCategoryInput = z.infer<typeof createMenuCategorySchema>;
export type UpdateMenuCategoryInput = z.infer<typeof updateMenuCategorySchema>;
