import { timingSafeEqual } from "node:crypto";
import type { User } from "@prisma/client";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { DomainError } from "@/server/services/errors";
import { clientIp, rateLimit, rateLimitHeaders, type RateLimitResult } from "./rate-limit";

export const PUBLIC_LIMIT = 60;
export const PRIVATE_LIMIT = 120;

/** Aplica el límite público (60/min por IP). Devuelve las cabeceras a añadir. */
export function guardPublic(req: Request): Record<string, string> {
  const r = rateLimit(`public:${clientIp(req)}`, PUBLIC_LIMIT);
  if (!r.allowed) throw new RateLimitError(r);
  return rateLimitHeaders(r);
}

/**
 * Endpoints privados: cabecera X-Api-Key igual a FOODZINDER_API_KEY, comparada
 * en tiempo constante, y límite de 120/min por IP.
 */
export function guardPrivate(req: Request): Record<string, string> {
  const expected = env.apiKey();
  if (!expected) throw new DomainError("FORBIDDEN", "La API privada está deshabilitada: falta FOODZINDER_API_KEY");
  const given = req.headers.get("x-api-key") ?? "";
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw new DomainError("UNAUTHORIZED", "Clave de API ausente o incorrecta");
  const r = rateLimit(`private:${clientIp(req)}`, PRIVATE_LIMIT);
  if (!r.allowed) throw new RateLimitError(r);
  return rateLimitHeaders(r);
}

export class RateLimitError extends Error {
  constructor(public readonly result: RateLimitResult) {
    super("Demasiadas peticiones. Espera un momento.");
    this.name = "RateLimitError";
  }
}

/**
 * Actor para las operaciones administrativas hechas con clave de API: el
 * primer administrador de la base de datos. Así las transiciones quedan
 * atribuidas a una persona real, no a un usuario fantasma.
 */
export async function apiActor(): Promise<User> {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" }, orderBy: { createdAt: "asc" } });
  if (!admin) throw new DomainError("INTERNAL", "No hay ningún administrador en la base de datos");
  return admin;
}
