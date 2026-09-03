import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { DELIVERY_HEADER, EVENT_HEADER, SIGNATURE_HEADER, signPayload } from "./signature";

/** Esperas entre intentos en ms: 2 s, 8 s, 30 s (docs/api.md). */
export const RETRY_DELAYS_MS = [2_000, 8_000, 30_000] as const;
export const MAX_ATTEMPTS = RETRY_DELAYS_MS.length;
const TIMEOUT_MS = 5_000;

type DeliveryRow = { id: string; event: string; url: string; payload: unknown; attempts: number };

export type AttemptResult = { ok: boolean; status: number | null; error: string | null };

/** Un único intento HTTP. No toca la base de datos. */
export async function attemptDelivery(delivery: DeliveryRow, secret: string, fetchImpl: typeof fetch = fetch): Promise<AttemptResult> {
  const body = JSON.stringify(delivery.payload);
  try {
    const res = await fetchImpl(delivery.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [EVENT_HEADER]: delivery.event,
        [DELIVERY_HEADER]: delivery.id,
        [SIGNATURE_HEADER]: signPayload(body, secret),
        "User-Agent": "Foodzinder-Webhooks/1.0",
      },
      body,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (res.ok) return { ok: true, status: res.status, error: null };
    return { ok: false, status: res.status, error: `HTTP ${res.status}` };
  } catch (e) {
    return { ok: false, status: null, error: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * Entrega con reintentos y registro en webhook_deliveries. Pensada para
 * ejecutarse fuera del ciclo de la petición (after()).
 */
export async function deliverWithRetries(deliveryId: string, sleep: (ms: number) => Promise<void> = defaultSleep) {
  const secret = env.webhookSecret();
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const delivery = await prisma.webhookDelivery.findUnique({ where: { id: deliveryId } });
    if (!delivery || delivery.status === "DELIVERED") return;

    const result = await attemptDelivery(delivery, secret);
    const attempts = delivery.attempts + 1;
    await prisma.webhookDelivery.update({
      where: { id: deliveryId },
      data: {
        attempts,
        lastStatus: result.status,
        lastError: result.error,
        status: result.ok ? "DELIVERED" : attempts >= MAX_ATTEMPTS ? "FAILED" : "PENDING",
        deliveredAt: result.ok ? new Date() : null,
      },
    });
    if (result.ok) return;
    if (attempt < MAX_ATTEMPTS - 1) await sleep(RETRY_DELAYS_MS[attempt]);
  }
}

/** Reintento manual desde el panel de admin: un intento más, sin esperas. */
export async function retryDelivery(deliveryId: string): Promise<AttemptResult | null> {
  const delivery = await prisma.webhookDelivery.findUnique({ where: { id: deliveryId } });
  if (!delivery) return null;
  const result = await attemptDelivery(delivery, env.webhookSecret());
  await prisma.webhookDelivery.update({
    where: { id: deliveryId },
    data: {
      attempts: delivery.attempts + 1,
      lastStatus: result.status,
      lastError: result.error,
      status: result.ok ? "DELIVERED" : "FAILED",
      deliveredAt: result.ok ? new Date() : delivery.deliveredAt,
    },
  });
  return result;
}

function defaultSleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}
