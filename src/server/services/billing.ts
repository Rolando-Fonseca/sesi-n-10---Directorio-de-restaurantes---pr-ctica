/**
 * Cálculo de suscripción y factura simulada (ADR-0003: sin pasarela real).
 * IVA español general del 21 %. Importes en euros con dos decimales.
 */
export const VAT_RATE = 21;
export type BillingInterval = "monthly" | "annual";

export function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/** Desglosa un precio con IVA incluido en base, impuesto y total. */
export function splitVat(totalWithVat: number, rate = VAT_RATE) {
  const subtotal = round2(totalWithVat / (1 + rate / 100));
  const tax = round2(totalWithVat - subtotal);
  return { subtotal, tax, total: round2(totalWithVat), rate };
}

/** Aplica un cupón (porcentaje o fijo) sin dejar el importe por debajo de 0. */
export function applyCoupon(amount: number, coupon: { type: "PERCENTAGE" | "FIXED"; value: number } | null) {
  if (!coupon) return { amount: round2(amount), discount: 0 };
  const discount = coupon.type === "PERCENTAGE" ? amount * (coupon.value / 100) : coupon.value;
  const capped = Math.min(round2(discount), round2(amount));
  return { amount: round2(amount - capped), discount: capped };
}

/** Periodo de facturación a partir de una fecha de inicio. */
export function billingPeriod(start: Date, interval: BillingInterval) {
  const end = new Date(start);
  if (interval === "monthly") end.setMonth(end.getMonth() + 1);
  else end.setFullYear(end.getFullYear() + 1);
  return { start, end };
}

/** Número de factura secuencial por año: FZ-2026-000042. */
export function invoiceNumber(year: number, sequence: number) {
  return `FZ-${year}-${String(sequence).padStart(6, "0")}`;
}
