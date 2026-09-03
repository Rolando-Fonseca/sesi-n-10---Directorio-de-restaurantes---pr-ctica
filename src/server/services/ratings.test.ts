import { describe, expect, it } from "vitest";
import { aggregateRatings, reviewAverage } from "./ratings";

const review = (id: string, scores: [number, number, number, number]) =>
  (["AMBIANCE", "SERVICE", "FOOD", "VALUE"] as const).map((criterion, i) => ({ reviewId: id, criterion, score: scores[i] }));

describe("aggregateRatings", () => {
  it("sin reseñas devuelve ceros y no divide por cero", () => {
    expect(aggregateRatings([])).toEqual({
      averageRating: 0,
      reviewCount: 0,
      breakdown: { AMBIANCE: 0, SERVICE: 0, FOOD: 0, VALUE: 0 },
    });
  });

  it("cuenta reseñas distintas, no filas", () => {
    const rows = [...review("a", [5, 5, 5, 5]), ...review("b", [3, 3, 3, 3])];
    expect(aggregateRatings(rows).reviewCount).toBe(2);
  });

  it("la media global es la media de todas las puntuaciones, redondeada a un decimal", () => {
    const rows = [...review("a", [5, 4, 5, 4]), ...review("b", [3, 2, 4, 3])];
    // (5+4+5+4+3+2+4+3) / 8 = 3.75 -> 3.8
    expect(aggregateRatings(rows).averageRating).toBe(3.8);
  });

  it("desglosa por criterio", () => {
    const rows = [...review("a", [5, 4, 5, 4]), ...review("b", [3, 2, 4, 3])];
    expect(aggregateRatings(rows).breakdown).toEqual({ AMBIANCE: 4, SERVICE: 3, FOOD: 4.5, VALUE: 3.5 });
  });
});

describe("reviewAverage", () => {
  it("media de una reseña con un decimal", () => {
    expect(reviewAverage([{ score: 4 }, { score: 3 }, { score: 5 }, { score: 3 }])).toBe(3.8);
    expect(reviewAverage([])).toBe(0);
  });
});
