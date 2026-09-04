import { env } from "@/lib/env";
import { handle, ok } from "@/server/api/respond";

/** Índice de la API: qué hay y dónde está el contrato. */
export const GET = handle(async () =>
  ok({
    name: "Foodzinder API",
    version: 1,
    docs: "https://github.com/Rolando-Fonseca/sesi-n-10---Directorio-de-restaurantes---pr-ctica/blob/rolando/docs/api.md",
    base: `${env.appUrl()}/api/v1`,
    public: ["GET /restaurants", "GET /restaurants/{slug}", "GET /restaurants/{slug}/reviews", "GET /taxonomies?scope=", "GET /plans"],
    private: ["GET /admin/restaurants?status=", "POST /admin/restaurants/{id}/approve", "POST /admin/restaurants/{id}/reject", "GET /admin/reviews?since=", "GET /admin/stats?period=", "GET /admin/webhook-deliveries?status=", "POST /admin/webhook-deliveries/{id}/retry", "POST /admin/webhooks/test"],
    auth: { private: "cabecera X-Api-Key" },
    webhooks: { signature: "X-Foodzinder-Signature: sha256=<HMAC-SHA256 del cuerpo>", events: ["user.created", "user.became_owner", "restaurant.created", "restaurant.resubmitted", "restaurant.approved", "restaurant.rejected", "menu.created", "review.created", "subscription.activated", "webhook.test"] },
  }),
);
