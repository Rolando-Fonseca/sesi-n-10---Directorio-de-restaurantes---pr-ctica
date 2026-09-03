import { prisma } from "@/lib/db";
import { POINT_RULES, calculateLevel } from "@/lib/points";

export type PointReason = keyof typeof POINT_RULES;

/**
 * Suma puntos, recalcula el nivel y comprueba insignias. Idempotente por
 * (reason, referenceId): repetir la misma acción no duplica puntos.
 */
export async function awardPoints(userId: string, reason: PointReason, referenceId?: string) {
  if (referenceId) {
    const dup = await prisma.pointTransaction.findFirst({ where: { userId, reason, referenceId } });
    if (dup) return null;
  }
  const points = POINT_RULES[reason];
  const [, user] = await prisma.$transaction([
    prisma.pointTransaction.create({ data: { userId, points, reason, referenceId } }),
    prisma.user.update({ where: { id: userId }, data: { points: { increment: points } } }),
  ]);
  const level = calculateLevel(user.points);
  if (level !== user.level) await prisma.user.update({ where: { id: userId }, data: { level } });
  await checkBadges(userId);
  return { points, total: user.points, level };
}

/** Concede las insignias cuyo umbral se haya alcanzado. */
export async function checkBadges(userId: string) {
  const [reviews, reviewsWithPhotos, wishlist, badges, owned] = await Promise.all([
    prisma.review.count({ where: { userId, isActive: true } }),
    prisma.review.count({ where: { userId, isActive: true, photos: { isEmpty: false } } }),
    prisma.wishlistItem.count({ where: { userId } }),
    prisma.badge.findMany(),
    prisma.userBadge.findMany({ where: { userId }, select: { badgeId: true } }),
  ]);
  const ownedIds = new Set(owned.map((b) => b.badgeId));
  const progress: Record<string, number> = {
    "first-review": reviews,
    "reviewer-5": reviews,
    "reviewer-25": reviews,
    photographer: reviewsWithPhotos,
    "explorer-10": wishlist,
    "explorer-50": wishlist,
  };
  const earned = badges.filter((b) => !ownedIds.has(b.id) && (progress[b.slug] ?? 0) >= b.threshold);
  if (earned.length) {
    await prisma.userBadge.createMany({ data: earned.map((b) => ({ userId, badgeId: b.id })), skipDuplicates: true });
  }
  return earned;
}
