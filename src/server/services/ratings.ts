import { REVIEW_CRITERIA } from "@/lib/validations/reviews";

export type Criterion = (typeof REVIEW_CRITERIA)[number];
export type RatingBreakdown = Record<Criterion, number>;

type RatingRow = { reviewId: string; criterion: string; score: number };

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

/**
 * Agrega las puntuaciones de todas las reseñas de un restaurante.
 * La media global es la media de todas las puntuaciones individuales, no la
 * media de medias: así una reseña con cuatro criterios pesa lo mismo que otra.
 */
export function aggregateRatings(rows: RatingRow[]): { averageRating: number; reviewCount: number; breakdown: RatingBreakdown } {
  const reviewCount = new Set(rows.map((r) => r.reviewId)).size;
  const breakdown = Object.fromEntries(REVIEW_CRITERIA.map((c) => [c, 0])) as RatingBreakdown;
  if (rows.length === 0) return { averageRating: 0, reviewCount: 0, breakdown };

  for (const c of REVIEW_CRITERIA) {
    const scores = rows.filter((r) => r.criterion === c).map((r) => r.score);
    breakdown[c] = scores.length ? round1(scores.reduce((s, x) => s + x, 0) / scores.length) : 0;
  }
  const averageRating = round1(rows.reduce((s, r) => s + r.score, 0) / rows.length);
  return { averageRating, reviewCount, breakdown };
}

/** Media de una sola reseña (para el evento review.created). */
export function reviewAverage(ratings: { score: number }[]): number {
  if (!ratings.length) return 0;
  return round1(ratings.reduce((s, r) => s + r.score, 0) / ratings.length);
}
