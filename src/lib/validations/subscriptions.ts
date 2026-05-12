import { z } from "zod";

export const createSubscriptionSchema = z.object({
  planId: z.string().uuid(),
  provider: z.enum(["STRIPE", "PAYPAL"]),
  interval: z.enum(["monthly", "annual"]),
  couponCode: z.string().optional(),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
