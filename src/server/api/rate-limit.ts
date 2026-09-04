/**
 * Límite de peticiones en memoria por clave (IP + grupo) con ventana
 * deslizante. Se reinicia con cada instancia serverless (ADR-0003): suficiente
 * para frenar scripts torpes, no para un ataque. Sin dependencias externas.
 */
const WINDOW_MS = 60_000;
const buckets = new Map<string, number[]>();
let lastSweep = Date.now();

export type RateLimitResult = { allowed: boolean; limit: number; remaining: number; resetInSeconds: number };

export function rateLimit(key: string, limit: number, now = Date.now()): RateLimitResult {
  if (now - lastSweep > WINDOW_MS) {
    for (const [k, times] of buckets) {
      const alive = times.filter((t) => now - t < WINDOW_MS);
      if (alive.length) buckets.set(k, alive);
      else buckets.delete(k);
    }
    lastSweep = now;
  }
  const times = (buckets.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  const oldest = times[0];
  const resetInSeconds = oldest ? Math.max(1, Math.ceil((WINDOW_MS - (now - oldest)) / 1000)) : Math.ceil(WINDOW_MS / 1000);
  if (times.length >= limit) {
    buckets.set(key, times);
    return { allowed: false, limit, remaining: 0, resetInSeconds };
  }
  times.push(now);
  buckets.set(key, times);
  return { allowed: true, limit, remaining: limit - times.length, resetInSeconds };
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0] : req.headers.get("x-real-ip"))?.trim() || "local";
}

export function rateLimitHeaders(r: RateLimitResult): Record<string, string> {
  return { "X-RateLimit-Limit": String(r.limit), "X-RateLimit-Remaining": String(r.remaining), "X-RateLimit-Reset": String(r.resetInSeconds) };
}

/** Solo para tests. */
export function _resetRateLimit() {
  buckets.clear();
}
