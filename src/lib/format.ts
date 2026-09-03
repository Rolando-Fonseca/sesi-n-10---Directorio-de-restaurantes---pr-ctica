const eur = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 2 });

export function formatPrice(n: number | null | undefined): string {
  if (n == null) return "";
  return eur.format(n);
}

export const PRICE_RANGE: Record<"CHEAP" | "MODERATE" | "EXPENSIVE" | "LUXURY", { symbol: string; label: string; hint: string }> = {
  CHEAP: { symbol: "€", label: "Económico", hint: "menos de 15 € por persona" },
  MODERATE: { symbol: "€€", label: "Moderado", hint: "15 a 30 € por persona" },
  EXPENSIVE: { symbol: "€€€", label: "Alto", hint: "30 a 60 € por persona" },
  LUXURY: { symbol: "€€€€", label: "Lujo", hint: "más de 60 € por persona" },
};

export function priceSymbol(range: string | null | undefined): string {
  return range && range in PRICE_RANGE ? PRICE_RANGE[range as keyof typeof PRICE_RANGE].symbol : "";
}

const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

/** "hace 3 días", "ayer", "hace 2 meses". */
export function timeAgo(iso: string | Date): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  const diff = (date.getTime() - Date.now()) / 1000;
  const abs = Math.abs(diff);
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour");
  if (abs < 86400 * 30) return rtf.format(Math.round(diff / 86400), "day");
  if (abs < 86400 * 365) return rtf.format(Math.round(diff / (86400 * 30)), "month");
  return rtf.format(Math.round(diff / (86400 * 365)), "year");
}

export function formatDate(iso: string | Date): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

export function formatDistance(km: number | undefined): string {
  if (km == null) return "";
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1).replace(".", ",")} km`;
}

export function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}
