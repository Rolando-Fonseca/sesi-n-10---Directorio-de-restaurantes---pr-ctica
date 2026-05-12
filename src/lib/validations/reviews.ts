import { z } from "zod";

export const REVIEW_CRITERIA = ["AMBIANCE", "SERVICE", "FOOD", "VALUE"] as const;

export const createReviewSchema = z.object({
  restaurantId: z.string().uuid(),
  comment: z.string().max(2000).optional(),
  ratings: z.array(
    z.object({
      criterion: z.enum(REVIEW_CRITERIA),
      score: z.number().int().min(1).max(5),
    })
  ).min(4).max(4),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
