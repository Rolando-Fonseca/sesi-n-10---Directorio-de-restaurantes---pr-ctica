import { z } from "zod";
import { env } from "@/lib/env";
import { apiActor, guardPrivate } from "@/server/api/guards";
import { handle, ok, readJson } from "@/server/api/respond";
import { emitEvent } from "@/server/events/emit";

const body = z.object({ message: z.string().max(200).default("Evento de prueba desde la API de Foodzinder") });

/** Emite webhook.test a todas las URLs configuradas. Útil para probar el flujo de n8n. */
export const POST = handle(async (req) => {
  const headers = guardPrivate(req);
  const { message } = body.parse(await readJson(req));
  const actor = await apiActor();
  const envelope = await emitEvent("webhook.test", { message, sentBy: `api-key (${actor.email})` });
  return ok({ deliveryId: envelope?.id ?? null, targets: env.webhookUrls() }, undefined, { headers });
});
