import type { User, UserRole } from "@prisma/client";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import type { UpdateBillingInput, UpdateProfileInput } from "@/lib/validations/profile";
import { emitEvent, notifyAdmins } from "@/server/events/emit";
import { forbidden, notFound } from "./errors";
import { awardPoints } from "./gamification";

/**
 * Escribe el rol en Clerk (publicMetadata, lo lee el middleware) y en Prisma
 * (lo lee el negocio) en la misma operación (ADR-0002). Si Clerk falla, no se
 * toca Prisma, para no dejar los dos sitios desincronizados.
 */
async function writeRole(userId: string, role: UserRole) {
  const isSeedUser = userId.startsWith("user_seed_");
  if (!isSeedUser) {
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, { publicMetadata: { role } });
  }
  return prisma.user.update({ where: { id: userId }, data: { role } });
}

export async function setUserRole(actor: User, userId: string, role: UserRole) {
  if (actor.role !== "ADMIN") throw forbidden();
  if (actor.id === userId && role !== "ADMIN") throw forbidden("No puedes quitarte el rol de administrador a ti mismo");
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) throw notFound("El usuario");
  return writeRole(userId, role);
}

/** Un usuario normal se convierte en dueño para dar de alta su restaurante. */
export async function becomeOwner(user: User) {
  if (user.role !== "USER") return user;
  const updated = await writeRole(user.id, "OWNER");
  await emitEvent(
    "user.became_owner",
    { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
    await notifyAdmins("NEW_OWNER_REGISTRATION", "Nuevo dueño registrado", `${user.email} quiere publicar su restaurante.`, user.id),
  );
  return updated;
}

export async function updateProfile(user: User, input: UpdateProfileInput) {
  const { preferenceIds, allergenIds, ...data } = input;
  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.user.update({ where: { id: user.id }, data: { ...data, phone: data.phone || null } });
    if (preferenceIds) {
      await tx.userPreference.deleteMany({ where: { userId: user.id } });
      await tx.userPreference.createMany({ data: preferenceIds.map((taxonomyId) => ({ userId: user.id, taxonomyId })) });
    }
    if (allergenIds) {
      await tx.userAllergen.deleteMany({ where: { userId: user.id } });
      await tx.userAllergen.createMany({ data: allergenIds.map((allergenId) => ({ userId: user.id, allergenId })) });
    }
    return u;
  });
  const complete = Boolean(updated.firstName && updated.lastName && (preferenceIds?.length || allergenIds?.length));
  if (complete) await awardPoints(user.id, "PROFILE_COMPLETED", user.id);
  return updated;
}

export async function updateBilling(user: User, input: UpdateBillingInput) {
  return prisma.user.update({ where: { id: user.id }, data: input });
}

/** Alta desde el webhook de Clerk. Emite user.created una sola vez. */
export async function registerUserFromClerk(data: { id: string; email: string; firstName?: string | null; lastName?: string | null; imageUrl?: string | null; role?: UserRole }) {
  const existing = await prisma.user.findUnique({ where: { id: data.id } });
  const user = await prisma.user.upsert({
    where: { id: data.id },
    update: { email: data.email, firstName: data.firstName, lastName: data.lastName, imageUrl: data.imageUrl, ...(data.role ? { role: data.role } : {}) },
    create: { id: data.id, email: data.email, firstName: data.firstName, lastName: data.lastName, imageUrl: data.imageUrl, role: data.role ?? "USER" },
  });
  if (!existing) {
    await emitEvent("user.created", { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role });
  }
  return user;
}
