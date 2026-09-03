import type { User } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { CreateReviewInput } from "@/lib/validations/reviews";
import { emitEvent } from "@/server/events/emit";
import { forbidden, notFound } from "./errors";
import { awardPoints } from "./gamification";
import { aggregateRatings, reviewAverage } from "./ratings";

/** Recalcula media y número de reseñas de un restaurante. */
export async function recalculateRestaurantRating(restaurantId: string) {
  const rows = await prisma.reviewRating.findMany({
    where: { review: { restaurantId, isActive: true } },
    select: { reviewId: true, criterion: true, score: true },
  });
  const { averageRating, reviewCount } = aggregateRatings(rows);
  await prisma.restaurant.update({ where: { id: restaurantId }, data: { averageRating, reviewCount } });
  return { averageRating, reviewCount };
}

/**
 * Crea la reseña del usuario para un restaurante, o la actualiza si ya existe
 * (una por usuario y restaurante). Solo la creación emite evento y da puntos.
 */
export async function upsertReview(user: User, input: CreateReviewInput, photos: string[] = []) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: input.restaurantId },
    include: { owner: { select: { email: true } } },
  });
  if (!restaurant || restaurant.status !== "APPROVED") throw notFound("El restaurante");
  if (restaurant.ownerId === user.id) throw forbidden("No puedes reseñar tu propio restaurante");

  const existing = await prisma.review.findUnique({ where: { restaurantId_userId: { restaurantId: restaurant.id, userId: user.id } } });

  const review = await prisma.$transaction(async (tx) => {
    const saved = existing
      ? await tx.review.update({ where: { id: existing.id }, data: { comment: input.comment, photos, isActive: true } })
      : await tx.review.create({ data: { restaurantId: restaurant.id, userId: user.id, comment: input.comment, photos } });
    await tx.reviewRating.deleteMany({ where: { reviewId: saved.id } });
    await tx.reviewRating.createMany({ data: input.ratings.map((r) => ({ reviewId: saved.id, criterion: r.criterion, score: r.score })) });
    return saved;
  });

  const { averageRating } = await recalculateRestaurantRating(restaurant.id);

  if (!existing) {
    const firstReview = (await prisma.review.count({ where: { userId: user.id } })) === 1;
    await awardPoints(user.id, photos.length ? "REVIEW_WITH_PHOTOS" : "REVIEW_CREATED", review.id);
    if (firstReview) await awardPoints(user.id, "FIRST_REVIEW", review.id);

    await emitEvent(
      "review.created",
      {
        id: review.id,
        restaurant: { id: restaurant.id, slug: restaurant.slug, name: restaurant.name, ownerEmail: restaurant.owner.email },
        author: { id: user.id, name: [user.firstName, user.lastName].filter(Boolean).join(" ") || "Usuario" },
        ratings: Object.fromEntries(input.ratings.map((r) => [r.criterion, r.score])),
        comment: input.comment ?? null,
        average: reviewAverage(input.ratings),
      },
      [
        {
          userId: restaurant.ownerId,
          type: "REVIEW_RECEIVED",
          title: `Nueva reseña en ${restaurant.name}`,
          message: `Media ${reviewAverage(input.ratings)} sobre 5. Media del restaurante: ${averageRating}.`,
          referenceId: review.id,
        },
      ],
    );
  }
  return review;
}

export async function deleteReview(actor: User, reviewId: string) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw notFound("La reseña");
  if (review.userId !== actor.id && actor.role !== "ADMIN") throw forbidden();
  // El admin desactiva (moderación, queda rastro); el autor borra de verdad.
  if (actor.role === "ADMIN" && review.userId !== actor.id) {
    await prisma.review.update({ where: { id: reviewId }, data: { isActive: false } });
  } else {
    await prisma.review.delete({ where: { id: reviewId } });
  }
  await recalculateRestaurantRating(review.restaurantId);
}
