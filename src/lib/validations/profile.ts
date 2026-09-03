import { z } from "zod";

export const updateProfileSchema = z.object({
  phone: z.string().max(30).optional().or(z.literal("")),
  locale: z.enum(["es", "en"]).optional(),
  preferenceIds: z.array(z.string().uuid()).max(20).optional(),
  allergenIds: z.array(z.string().uuid()).max(14).optional(),
});

export const updateBillingSchema = z.object({
  billingName: z.string().min(2).max(120),
  taxId: z.string().min(8).max(20),
  billingAddress: z.string().min(5).max(300),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateBillingInput = z.infer<typeof updateBillingSchema>;
