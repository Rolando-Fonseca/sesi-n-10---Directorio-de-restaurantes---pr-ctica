/**
 * Acceso tipado a las variables de entorno que usa el servidor.
 * Las opcionales devuelven valores vacíos en lugar de lanzar, para que la app
 * arranque sin webhooks ni API key configurados (por ejemplo en local).
 */
/**
 * URL pública de la app. Orden: NEXT_PUBLIC_APP_URL si tiene valor (una
 * variable vacía cuenta como ausente), después la URL que Vercel expone en
 * cada despliegue, y por último localhost.
 */
export function resolveAppUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "")}`;
  return "http://localhost:3000";
}

export const env = {
  appUrl: resolveAppUrl,

  /** URLs destino de los webhooks salientes, separadas por comas. */
  webhookUrls: (): string[] =>
    (process.env.WEBHOOK_URLS ?? "")
      .split(",")
      .map((u) => u.trim())
      .filter((u) => u.length > 0),

  webhookSecret: () => process.env.WEBHOOK_SECRET ?? "",

  /** Clave de los endpoints privados /api/v1/admin/*. Vacía = deshabilitados. */
  apiKey: () => process.env.FOODZINDER_API_KEY ?? "",

  nominatimUrl: () => process.env.NEXT_PUBLIC_NOMINATIM_URL ?? "https://nominatim.openstreetmap.org",
} as const;
