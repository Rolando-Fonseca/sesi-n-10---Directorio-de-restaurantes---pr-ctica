import { describe, expect, it } from "vitest";
import { applyCoupon, billingPeriod, invoiceNumber, splitVat } from "./billing";

describe("splitVat", () => {
  it("desglosa 29,99 € con IVA incluido al 21 %", () => {
    expect(splitVat(29.99)).toEqual({ subtotal: 24.79, tax: 5.2, total: 29.99, rate: 21 });
  });

  it("base más impuesto cuadra con el total al céntimo", () => {
    for (const total of [14.99, 149.99, 49.99, 499.99]) {
      const { subtotal, tax } = splitVat(total);
      expect(Math.round((subtotal + tax) * 100) / 100).toBe(total);
    }
  });
});

describe("applyCoupon", () => {
  it("porcentaje", () => {
    expect(applyCoupon(100, { type: "PERCENTAGE", value: 25 })).toEqual({ amount: 75, discount: 25 });
  });

  it("fijo, sin bajar de cero", () => {
    expect(applyCoupon(10, { type: "FIXED", value: 15 })).toEqual({ amount: 0, discount: 10 });
  });

  it("sin cupón no descuenta", () => {
    expect(applyCoupon(29.99, null)).toEqual({ amount: 29.99, discount: 0 });
  });
});

describe("billingPeriod", () => {
  it("mensual suma un mes y anual un año", () => {
    const start = new Date("2026-01-31T10:00:00Z");
    expect(billingPeriod(start, "monthly").end.toISOString().slice(0, 10)).toBe("2026-03-03"); // enero+1 desborda febrero
    expect(billingPeriod(start, "annual").end.toISOString().slice(0, 10)).toBe("2027-01-31");
  });
});

describe("invoiceNumber", () => {
  it("formato FZ-AAAA-NNNNNN", () => {
    expect(invoiceNumber(2026, 42)).toBe("FZ-2026-000042");
  });
});
