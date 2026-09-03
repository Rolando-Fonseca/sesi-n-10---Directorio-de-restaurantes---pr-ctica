import { createHmac, timingSafeEqual } from "node:crypto";

export const SIGNATURE_HEADER = "x-foodzinder-signature";
export const EVENT_HEADER = "x-foodzinder-event";
export const DELIVERY_HEADER = "x-foodzinder-delivery";

/** Firma un cuerpo (string exacto que se envía) con HMAC-SHA256. */
export function signPayload(body: string, secret: string): string {
  return "sha256=" + createHmac("sha256", secret).update(body, "utf8").digest("hex");
}

/**
 * Verifica una firma en tiempo constante. Devuelve false ante cualquier
 * formato inesperado en lugar de lanzar.
 */
export function verifySignature(body: string, signature: string | null | undefined, secret: string): boolean {
  if (!signature || !secret) return false;
  const expected = signPayload(body, secret);
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
