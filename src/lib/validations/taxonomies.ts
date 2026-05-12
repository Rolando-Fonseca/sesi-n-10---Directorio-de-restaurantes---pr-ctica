import { z } from "zod";

export const createTaxonomySchema = z.object({
  scope: z.enum(["RESTAURANT", "MENU_PRESENTATION", "MENU_ALLERGEN", "MENU_CATEGORY"]),
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100),
  icon: z.string().optional(),
  description: z.string().max(500).optional(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updateTaxonomySchema = createTaxonomySchema.partial().omit({ scope: true });

export type CreateTaxonomyInput = z.infer<typeof createTaxonomySchema>;
export type UpdateTaxonomyInput = z.infer<typeof updateTaxonomySchema>;
