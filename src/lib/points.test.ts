import { describe, expect, it } from "vitest";
import { LEVEL_THRESHOLDS, POINT_RULES, calculateLevel } from "./points";

describe("calculateLevel", () => {
  it("empieza en nivel 1 con cero puntos", () => {
    expect(calculateLevel(0)).toBe(1);
  });

  it("sube de nivel justo al alcanzar el umbral, no antes", () => {
    expect(calculateLevel(99)).toBe(1);
    expect(calculateLevel(100)).toBe(2);
    expect(calculateLevel(299)).toBe(2);
    expect(calculateLevel(300)).toBe(3);
  });

  it("no pasa del último nivel definido", () => {
    expect(calculateLevel(1_000_000)).toBe(LEVEL_THRESHOLDS.length);
  });

  it("los umbrales son estrictamente crecientes", () => {
    for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
      expect(LEVEL_THRESHOLDS[i]).toBeGreaterThan(LEVEL_THRESHOLDS[i - 1]);
    }
  });

  it("una reseña con fotos vale más que una sin fotos", () => {
    expect(POINT_RULES.REVIEW_WITH_PHOTOS).toBeGreaterThan(POINT_RULES.REVIEW_CREATED);
  });
});
