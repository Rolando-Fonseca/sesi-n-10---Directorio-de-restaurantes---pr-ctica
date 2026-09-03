import type { RestaurantStatus, UserRole } from "@prisma/client";

/**
 * Máquina de estados de un restaurante (docs/architecture.md):
 *   PENDING  -> APPROVED | REJECTED   (admin)
 *   REJECTED -> PENDING               (owner reenvía)
 *   APPROVED -> ARCHIVED              (owner)
 *   ARCHIVED -> APPROVED              (owner restaura)
 */
const TRANSITIONS: Record<RestaurantStatus, Partial<Record<RestaurantStatus, UserRole[]>>> = {
  PENDING: { APPROVED: ["ADMIN"], REJECTED: ["ADMIN"] },
  REJECTED: { PENDING: ["OWNER", "ADMIN"] },
  APPROVED: { ARCHIVED: ["OWNER", "ADMIN"] },
  ARCHIVED: { APPROVED: ["OWNER", "ADMIN"] },
};

export function canTransition(from: RestaurantStatus, to: RestaurantStatus, role: UserRole): boolean {
  return TRANSITIONS[from]?.[to]?.includes(role) ?? false;
}

export function allowedTransitions(from: RestaurantStatus, role: UserRole): RestaurantStatus[] {
  return (Object.keys(TRANSITIONS[from]) as RestaurantStatus[]).filter((to) => canTransition(from, to, role));
}

/** Solo los aprobados y activos se muestran en el directorio público. */
export function isPubliclyVisible(r: { status: RestaurantStatus; isActive: boolean }): boolean {
  return r.status === "APPROVED" && r.isActive;
}
