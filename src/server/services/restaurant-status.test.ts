import { describe, expect, it } from "vitest";
import { allowedTransitions, canTransition, isPubliclyVisible } from "./restaurant-status";

describe("máquina de estados del restaurante", () => {
  it("el admin aprueba o rechaza lo pendiente", () => {
    expect(canTransition("PENDING", "APPROVED", "ADMIN")).toBe(true);
    expect(canTransition("PENDING", "REJECTED", "ADMIN")).toBe(true);
  });

  it("el owner no puede aprobarse a sí mismo", () => {
    expect(canTransition("PENDING", "APPROVED", "OWNER")).toBe(false);
    expect(allowedTransitions("PENDING", "OWNER")).toEqual([]);
  });

  it("el owner reenvía un rechazado, archiva un aprobado y restaura un archivado", () => {
    expect(canTransition("REJECTED", "PENDING", "OWNER")).toBe(true);
    expect(canTransition("APPROVED", "ARCHIVED", "OWNER")).toBe(true);
    expect(canTransition("ARCHIVED", "APPROVED", "OWNER")).toBe(true);
  });

  it("no hay saltos directos ni transiciones inventadas", () => {
    expect(canTransition("REJECTED", "APPROVED", "ADMIN")).toBe(false);
    expect(canTransition("ARCHIVED", "PENDING", "OWNER")).toBe(false);
    expect(canTransition("APPROVED", "APPROVED", "ADMIN")).toBe(false);
  });

  it("un usuario normal no transiciona nada", () => {
    for (const from of ["PENDING", "APPROVED", "REJECTED", "ARCHIVED"] as const) {
      expect(allowedTransitions(from, "USER")).toEqual([]);
    }
  });

  it("solo APPROVED y activo es visible en público", () => {
    expect(isPubliclyVisible({ status: "APPROVED", isActive: true })).toBe(true);
    expect(isPubliclyVisible({ status: "APPROVED", isActive: false })).toBe(false);
    expect(isPubliclyVisible({ status: "PENDING", isActive: true })).toBe(false);
  });
});
