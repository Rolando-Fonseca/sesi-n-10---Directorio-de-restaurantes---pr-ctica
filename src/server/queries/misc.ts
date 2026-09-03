import type { WebhookDeliveryStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { countRestaurantsByStatus } from "./restaurants";

// ---------------- Notificaciones ----------------

export async function getNotifications(userId: string, onlyUnread = false, limit = 30) {
  return prisma.notification.findMany({
    where: { userId, ...(onlyUnread ? { isRead: false } : {}) },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function countUnreadNotifications(userId: string) {
  return prisma.notification.count({ where: { userId, isRead: false } });
}

export async function markNotificationsRead(userId: string, ids?: string[]) {
  await prisma.notification.updateMany({ where: { userId, isRead: false, ...(ids ? { id: { in: ids } } : {}) }, data: { isRead: true } });
}

// ---------------- Planes y suscripción ----------------

export async function getActivePlans() {
  const plans = await prisma.plan.findMany({ where: { isActive: true }, orderBy: { priceMonthly: "asc" } });
  return plans.map((p) => ({ ...p, priceMonthly: Number(p.priceMonthly), priceAnnual: Number(p.priceAnnual), features: p.features as Record<string, boolean | number | string> }));
}

export async function getSubscriptionsForUser(userId: string) {
  const subs = await prisma.subscription.findMany({ where: { userId }, include: { plan: true, invoices: { orderBy: { issuedAt: "desc" } } }, orderBy: { createdAt: "desc" } });
  return subs.map((s) => ({
    ...s,
    amount: Number(s.amount),
    invoices: s.invoices.map((i) => ({ ...i, amountSubtotal: Number(i.amountSubtotal), taxAmount: Number(i.taxAmount), taxRate: Number(i.taxRate), total: Number(i.total) })),
  }));
}

// ---------------- Entregas de webhooks ----------------

export async function getWebhookDeliveries(status?: WebhookDeliveryStatus, page = 1, limit = 30) {
  const where = status ? { status } : {};
  const [items, total] = await Promise.all([
    prisma.webhookDelivery.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
    prisma.webhookDelivery.count({ where }),
  ]);
  return { items, page, limit, total, pages: Math.ceil(total / limit) };
}

// ---------------- Estadísticas (panel admin y API privada) ----------------

export type PeriodStats = {
  period: { from: string; to: string; days: number };
  users: { total: number; new: number; owners: number };
  restaurants: Record<"PENDING" | "APPROVED" | "REJECTED" | "ARCHIVED", number> & { new: number };
  reviews: { total: number; new: number; averageScore: number };
  menus: { total: number; dishes: number };
  webhooks: { delivered: number; failed: number; pending: number };
};

export async function getStats(days = 7): Promise<PeriodStats> {
  const to = new Date();
  const from = new Date(to.getTime() - days * 86_400_000);
  const since = { createdAt: { gte: from } };

  const [users, newUsers, owners, byStatus, newRestaurants, reviews, newReviews, avg, menus, dishes, wh] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: since }),
    prisma.user.count({ where: { role: "OWNER" } }),
    countRestaurantsByStatus(),
    prisma.restaurant.count({ where: since }),
    prisma.review.count({ where: { isActive: true } }),
    prisma.review.count({ where: { isActive: true, ...since } }),
    prisma.reviewRating.aggregate({ _avg: { score: true }, where: { review: { isActive: true, ...since } } }),
    prisma.menu.count({ where: { isActive: true } }),
    prisma.dish.count(),
    prisma.webhookDelivery.groupBy({ by: ["status"], _count: true, where: since }),
  ]);
  const whCount = (s: WebhookDeliveryStatus) => wh.find((w) => w.status === s)?._count ?? 0;

  return {
    period: { from: from.toISOString(), to: to.toISOString(), days },
    users: { total: users, new: newUsers, owners },
    restaurants: { ...byStatus, new: newRestaurants },
    reviews: { total: reviews, new: newReviews, averageScore: Math.round((avg._avg.score ?? 0) * 10) / 10 },
    menus: { total: menus, dishes },
    webhooks: { delivered: whCount("DELIVERED"), failed: whCount("FAILED"), pending: whCount("PENDING") },
  };
}

/** Resumen para el panel del dueño. */
export async function getOwnerStats(ownerId: string) {
  const [restaurants, pending, reviews, avg, wishlist, unread] = await Promise.all([
    prisma.restaurant.count({ where: { ownerId, status: { not: "ARCHIVED" } } }),
    prisma.restaurant.count({ where: { ownerId, status: "PENDING" } }),
    prisma.review.count({ where: { isActive: true, restaurant: { ownerId } } }),
    prisma.reviewRating.aggregate({ _avg: { score: true }, where: { review: { isActive: true, restaurant: { ownerId } } } }),
    prisma.wishlistItem.count({ where: { restaurant: { ownerId } } }),
    countUnreadNotifications(ownerId),
  ]);
  return { restaurants, pending, reviews, averageScore: Math.round((avg._avg.score ?? 0) * 10) / 10, wishlist, unread };
}
