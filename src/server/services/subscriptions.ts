import type { User } from "@prisma/client";
import { prisma } from "@/lib/db";
import { emitEvent } from "@/server/events/emit";
import { applyCoupon, billingPeriod, invoiceNumber, splitVat, type BillingInterval } from "./billing";
import { DomainError, notFound } from "./errors";

/** Límites sin suscripción activa: lo justo para probar el producto. */
export const FREE_LIMITS = { maxRestaurants: 1, maxMenus: 1, maxDishesPerMenu: 20, planName: "Gratuito" } as const;

export type OwnerLimits = { maxRestaurants: number; maxMenus: number; maxDishesPerMenu: number; planName: string; subscriptionId: string | null };

/** Límites vigentes de un owner según su suscripción activa. Los admins no tienen límite. */
export async function getOwnerLimits(user: Pick<User, "id" | "role">): Promise<OwnerLimits> {
  if (user.role === "ADMIN") {
    return { maxRestaurants: Infinity, maxMenus: Infinity, maxDishesPerMenu: Infinity, planName: "Administración", subscriptionId: null };
  }
  const sub = await prisma.subscription.findFirst({
    where: { userId: user.id, status: { in: ["ACTIVE", "TRIALING"] }, endDate: { gt: new Date() } },
    include: { plan: true },
    orderBy: { endDate: "desc" },
  });
  if (!sub) return { ...FREE_LIMITS, subscriptionId: null };
  return {
    maxRestaurants: sub.plan.maxRestaurants,
    maxMenus: sub.plan.maxMenus,
    maxDishesPerMenu: sub.plan.maxDishesPerMenu,
    planName: sub.plan.name,
    subscriptionId: sub.id,
  };
}

/**
 * Activa un plan de forma simulada (ADR-0003): sin pasarela, pero con
 * suscripción, factura con IVA desglosado y canje de cupón reales.
 */
export async function activateSubscription(user: User, planId: string, interval: BillingInterval, couponCode?: string) {
  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan || !plan.isActive) throw notFound("El plan");

  const listPrice = Number(interval === "monthly" ? plan.priceMonthly : plan.priceAnnual);

  let coupon = null;
  if (couponCode) {
    coupon = await prisma.coupon.findUnique({ where: { code: couponCode.trim().toUpperCase() } });
    const now = new Date();
    const valid =
      coupon &&
      coupon.status === "ACTIVE" &&
      coupon.validFrom <= now &&
      (!coupon.validUntil || coupon.validUntil > now) &&
      (coupon.maxUses == null || coupon.usedCount < coupon.maxUses) &&
      (coupon.applicablePlanIds.length === 0 || coupon.applicablePlanIds.includes(plan.id));
    if (!valid) throw new DomainError("VALIDATION_ERROR", "El cupón no es válido para este plan");
    const used = await prisma.couponRedemption.count({ where: { couponId: coupon!.id, userId: user.id } });
    if (used >= coupon!.maxUsesPerUser) throw new DomainError("CONFLICT", "Ya has usado este cupón");
  }

  const { amount, discount } = applyCoupon(listPrice, coupon ? { type: coupon.type, value: Number(coupon.value) } : null);
  const { start, end } = billingPeriod(new Date(), interval);
  const vat = splitVat(amount);

  const subscription = await prisma.$transaction(async (tx) => {
    // Solo una suscripción activa por usuario: la anterior se cancela al activar la nueva.
    await tx.subscription.updateMany({ where: { userId: user.id, status: "ACTIVE" }, data: { status: "CANCELED", cancelAtPeriodEnd: true } });

    const sub = await tx.subscription.create({
      data: {
        userId: user.id,
        planId: plan.id,
        provider: "STRIPE", // simulado; el esquema exige proveedor
        providerSubscriptionId: null,
        startDate: start,
        endDate: end,
        currentPeriodStart: start,
        currentPeriodEnd: end,
        amount,
        interval,
        status: "ACTIVE",
      },
    });

    const year = start.getFullYear();
    const sequence = (await tx.invoice.count({ where: { issuedAt: { gte: new Date(year, 0, 1) } } })) + 1;
    await tx.invoice.create({
      data: {
        subscriptionId: sub.id,
        userId: user.id,
        number: invoiceNumber(year, sequence),
        amountSubtotal: vat.subtotal,
        taxAmount: vat.tax,
        taxRate: vat.rate,
        total: vat.total,
        provider: "STRIPE",
        status: "PAID",
      },
    });

    if (coupon) {
      await tx.couponRedemption.create({ data: { couponId: coupon.id, userId: user.id, subscriptionId: sub.id, discountAmount: discount } });
      await tx.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
    }
    return sub;
  });

  await emitEvent("subscription.activated", {
    id: subscription.id,
    userId: user.id,
    plan: plan.slug,
    interval,
    amount,
    currentPeriodEnd: end.toISOString(),
  });

  return subscription;
}

export async function cancelSubscription(user: User, subscriptionId: string) {
  const sub = await prisma.subscription.findUnique({ where: { id: subscriptionId } });
  if (!sub || (sub.userId !== user.id && user.role !== "ADMIN")) throw notFound("La suscripción");
  return prisma.subscription.update({ where: { id: sub.id }, data: { cancelAtPeriodEnd: true, status: "CANCELED" } });
}
