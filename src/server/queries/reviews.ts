import { prisma } from "@/lib/db";
import { reviewAverage } from "@/server/services/ratings";
import type { ReviewDto } from "./dto";
import type { Paginated } from "./restaurants";

const reviewInclude = {
  ratings: { select: { criterion: true, score: true } },
  user: { select: { id: true, firstName: true, lastName: true, imageUrl: true, level: true } },
  restaurant: { select: { id: true, slug: true, name: true } },
} as const;

type Row = {
  id: string;
  comment: string | null;
  photos: string[];
  createdAt: Date;
  ratings: { criterion: string; score: number }[];
  user: { id: string; firstName: string | null; lastName: string | null; imageUrl: string | null; level: number };
  restaurant: { id: string; slug: string; name: string };
};

export function toReviewDto(r: Row): ReviewDto {
  return {
    id: r.id,
    comment: r.comment,
    photos: r.photos,
    createdAt: r.createdAt.toISOString(),
    average: reviewAverage(r.ratings),
    ratings: Object.fromEntries(r.ratings.map((x) => [x.criterion, x.score])),
    author: { id: r.user.id, name: [r.user.firstName, r.user.lastName].filter(Boolean).join(" ") || "Usuario", imageUrl: r.user.imageUrl, level: r.user.level },
    restaurant: r.restaurant,
  };
}

export async function getReviewsByRestaurant(restaurantId: string, page = 1, limit = 10): Promise<Paginated<ReviewDto>> {
  const where = { restaurantId, isActive: true };
  const [rows, total] = await Promise.all([
    prisma.review.findMany({ where, include: reviewInclude, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
    prisma.review.count({ where }),
  ]);
  return { items: rows.map(toReviewDto), page, limit, total, pages: Math.ceil(total / limit) };
}

export async function getReviewsByUser(userId: string): Promise<ReviewDto[]> {
  const rows = await prisma.review.findMany({ where: { userId }, include: reviewInclude, orderBy: { createdAt: "desc" } });
  return rows.map(toReviewDto);
}

export async function getUserReviewFor(userId: string, restaurantId: string) {
  const row = await prisma.review.findUnique({ where: { restaurantId_userId: { restaurantId, userId } }, include: reviewInclude });
  return row ? toReviewDto(row) : null;
}

/** Reseñas de los restaurantes de un dueño. */
export async function getReviewsForOwner(ownerId: string, limit = 50): Promise<ReviewDto[]> {
  const rows = await prisma.review.findMany({
    where: { isActive: true, restaurant: { ownerId } },
    include: reviewInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(toReviewDto);
}

/** Reseñas desde una fecha (API privada, resúmenes de n8n). */
export async function getReviewsSince(since: Date, limit = 200): Promise<ReviewDto[]> {
  const rows = await prisma.review.findMany({ where: { createdAt: { gte: since } }, include: reviewInclude, orderBy: { createdAt: "desc" }, take: limit });
  return rows.map(toReviewDto);
}

export async function getAllReviews(page = 1, limit = 30): Promise<Paginated<ReviewDto & { isActive: boolean }>> {
  const [rows, total] = await Promise.all([
    prisma.review.findMany({ include: reviewInclude, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
    prisma.review.count(),
  ]);
  return { items: rows.map((r) => ({ ...toReviewDto(r), isActive: r.isActive })), page, limit, total, pages: Math.ceil(total / limit) };
}
