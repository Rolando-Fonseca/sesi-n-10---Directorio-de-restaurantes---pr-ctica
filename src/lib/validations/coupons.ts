import { z } from "zod";

export const createCouponSchema = z.object({
  code: z.string().min(3).max(30),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.number().min(0),
  description: z.string().max(500).optional(),
  maxUses: z.number().int().positive().optional(),
  maxUsesPerUser: z.number().int().positive().default(1),
  minPurchase: z.number().min(0).optional(),
  validFrom: z.date().default(new Date()),
  validUntil: z.date().optional(),
  applicablePlanIds: z.array(z.string().uuid()).optional(),
});

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
