import { describe, expect, it } from "vitest";
import { REVIEW_CRITERIA, createReviewSchema } from "./reviews";

const restaurantId = "6f1a2b3c-4d5e-4f60-8a9b-0c1d2e3f4a5b";
const fullRatings = REVIEW_CRITERIA.map((criterion) => ({ criterion, score: 4 }));

describe("createReviewSchema", () => {
  it("acepta una reseña con los cuatro criterios puntuados", () => {
    const result = createReviewSchema.safeParse({
      restaurantId,
      comment: "Buen ambiente, servicio lento.",
      ratings: fullRatings,
    });
    expect(result.success).toBe(true);
  });

  it("rechaza si falta algún criterio", () => {
    const result = createReviewSchema.safeParse({
      restaurantId,
      ratings: fullRatings.slice(0, 3),
    });
    expect(result.success).toBe(false);
  });

  it("rechaza puntuaciones fuera de 1 a 5", () => {
    const tooHigh = createReviewSchema.safeParse({
      restaurantId,
      ratings: [...fullRatings.slice(0, 3), { criterion: "VALUE", score: 6 }],
    });
    const zero = createReviewSchema.safeParse({
      restaurantId,
      ratings: [...fullRatings.slice(0, 3), { criterion: "VALUE", score: 0 }],
    });
    expect(tooHigh.success).toBe(false);
    expect(zero.success).toBe(false);
  });

  it("rechaza un id de restaurante que no sea UUID", () => {
    const result = createReviewSchema.safeParse({ restaurantId: "abc", ratings: fullRatings });
    expect(result.success).toBe(false);
  });

  it("el comentario es opcional pero limitado a 2000 caracteres", () => {
    const ok = createReviewSchema.safeParse({ restaurantId, ratings: fullRatings });
    const tooLong = createReviewSchema.safeParse({
      restaurantId,
      ratings: fullRatings,
      comment: "a".repeat(2001),
    });
    expect(ok.success).toBe(true);
    expect(tooLong.success).toBe(false);
  });
});
