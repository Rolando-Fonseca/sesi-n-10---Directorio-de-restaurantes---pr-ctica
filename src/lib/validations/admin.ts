import { z } from "zod";

export const rejectRestaurantSchema = z.object({
  restaurantId: z.string().uuid(),
  reason: z.string().min(10, "Explica el motivo con al menos 10 caracteres").max(1000),
});

export const setUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["ADMIN", "OWNER", "USER"]),
});

export const webhookTestSchema = z.object({
  message: z.string().max(200).default("Evento de prueba desde el panel de Foodzinder"),
});

export type RejectRestaurantInput = z.infer<typeof rejectRestaurantSchema>;
export type SetUserRoleInput = z.infer<typeof setUserRoleSchema>;
