import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { DomainError, type DomainErrorCode } from "@/server/services/errors";
import { RateLimitError } from "./guards";
import { rateLimitHeaders } from "./rate-limit";

export type ApiMeta = { page?: number; limit?: number; total?: number; pages?: number } & Record<string, unknown>;

const HEADERS = { "Cache-Control": "no-store" };

export function ok<T>(data: T, meta?: ApiMeta, init?: ResponseInit) {
  return NextResponse.json({ success: true, data, ...(meta ? { meta } : {}) }, { ...init, headers: { ...HEADERS, ...(init?.headers ?? {}) } });
}

const STATUS: Record<string, number> = { VALIDATION_ERROR: 400, UNAUTHORIZED: 401, FORBIDDEN: 403, NOT_FOUND: 404, CONFLICT: 409, LIMIT_REACHED: 409, INVALID_TRANSITION: 409, GEOCODING_FAILED: 422, RATE_LIMITED: 429, INTERNAL: 500 };

export function fail(code: DomainErrorCode | "RATE_LIMITED", error: string, init?: ResponseInit) {
  return NextResponse.json({ success: false, error, code }, { status: STATUS[code] ?? 500, ...init, headers: { ...HEADERS, ...(init?.headers ?? {}) } });
}

/**
 * Envuelve un handler: convierte DomainError y ZodError en la envoltura
 * documentada y nunca deja escapar una excepción sin formato.
 */
export function handle<Ctx>(fn: (req: Request, ctx: Ctx) => Promise<Response>) {
  return async (req: Request, ctx: Ctx): Promise<Response> => {
    try {
      return await fn(req, ctx);
    } catch (e) {
      if (e instanceof RateLimitError) return fail("RATE_LIMITED", e.message, { headers: { ...rateLimitHeaders(e.result), "Retry-After": String(e.result.resetInSeconds) } });
      if (e instanceof DomainError) return fail(e.code, e.message);
      if (e instanceof ZodError) {
        const first = e.issues[0];
        return fail("VALIDATION_ERROR", first ? `${first.path.join(".") || "datos"}: ${first.message}` : "Datos no válidos");
      }
      console.error("[api]", e);
      return fail("INTERNAL", "Error interno");
    }
  };
}

/** Lee el cuerpo JSON; cuerpo vacío o inválido devuelve {} para que Zod decida. */
export async function readJson(req: Request): Promise<unknown> {
  try {
    const text = await req.text();
    return text ? JSON.parse(text) : {};
  } catch {
    throw new DomainError("VALIDATION_ERROR", "El cuerpo no es JSON válido");
  }
}
