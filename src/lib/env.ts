/**
 * Acceso tipado a las variables de entorno que usa el servidor.
 * Las opcionales devuelven valores vacíos en lugar de lanzar, para que la app
 * arranque sin webhooks ni API key configurados (por ejemplo en local).
 */
export const env = {
  appUrl: () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",

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
