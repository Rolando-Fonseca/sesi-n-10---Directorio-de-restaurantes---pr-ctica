import { z } from "zod";

export const createRestaurantSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(2000).optional(),
  address: z.string().min(5).max(300),
  city: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().default("ES"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  phone: z.string().max(30).optional(),
  website: z.string().url().optional().or(z.literal("")),
  priceRange: z.enum(["CHEAP", "MODERATE", "EXPENSIVE", "LUXURY"]).optional(),
  taxonomyIds: z.array(z.string().uuid()).optional(),
});

export const updateRestaurantSchema = createRestaurantSchema.partial();

export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>;
export type UpdateRestaurantInput = z.infer<typeof updateRestaurantSchema>;
