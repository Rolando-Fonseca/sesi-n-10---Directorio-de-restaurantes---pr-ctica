"use server";

import { z } from "zod";
import { createReviewSchema } from "@/lib/validations/reviews";
import { deleteReview, upsertReview } from "@/server/services/reviews";
import { runAction } from "./_helpers";

export async function submitReviewAction(input: unknown) {
  return runAction({
    schema: createReviewSchema.extend({ photos: z.array(z.string().url()).max(5).default([]) }),
    input,
    revalidate: ["/restaurant/[slug]", "/dashboard/user/reviews", "/explore", "/"],
    handler: async ({ photos, ...data }, { user }) => ({ id: (await upsertReview(user, data, photos)).id }),
  });
}

export async function deleteReviewAction(input: unknown) {
  return runAction({
    schema: z.object({ id: z.string().uuid() }),
    input,
    revalidate: ["/restaurant/[slug]", "/dashboard/user/reviews", "/dashboard/admin/reviews"],
    handler: async ({ id }, { user }) => (await deleteReview(user, id), { id }),
  });
}
