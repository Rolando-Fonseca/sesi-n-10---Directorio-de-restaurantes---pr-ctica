import type { RestaurantStatus, User } from "@prisma/client";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { geocodeAddress } from "@/lib/geolocation";
import { generateSlug } from "@/lib/slug";
import type { CreateRestaurantInput, UpdateRestaurantInput } from "@/lib/validations/restaurants";
import { emitEvent, notifyAdmins } from "@/server/events/emit";
import type { RestaurantEventData } from "@/server/events/types";
import { DomainError, forbidden, notFound } from "./errors";
import { canTransition } from "./restaurant-status";
import { getOwnerLimits } from "./subscriptions";

async function uniqueSlug(name: string) {
  const base = generateSlug(name) || "restaurante";
  let slug = base;
  for (let i = 2; await prisma.restaurant.findUnique({ where: { slug }, select: { id: true } }); i++) slug = `${base}-${i}`;
  return slug;
}

async function eventData(id: string, extra: Partial<RestaurantEventData> = {}): Promise<RestaurantEventData> {
  const r = await prisma.restaurant.findUniqueOrThrow({ where: { id }, include: { owner: { select: { id: true, email: true, firstName: true, lastName: true } } } });
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    city: r.city,
    status: r.status,
    priceRange: r.priceRange,
    owner: { id: r.owner.id, email: r.owner.email, name: [r.owner.firstName, r.owner.lastName].filter(Boolean).join(" ") || r.owner.email },
    ...extra,
  };
}

/** Resuelve coordenadas: las del formulario si vienen, si no geocodifica la dirección. */
async function resolveCoordinates(input: { address: string; city?: string | null; latitude?: number; longitude?: number }) {
  if (input.latitude != null && input.longitude != null) return { latitude: input.latitude, longitude: input.longitude, city: input.city ?? null, postalCode: null as string | null };
  const geo = await geocodeAddress(input.address, input.city);
  if (!geo) throw new DomainError("GEOCODING_FAILED", "No se ha podido localizar la dirección. Revísala o ajusta el marcador en el mapa.");
  return { latitude: geo.latitude, longitude: geo.longitude, city: input.city ?? geo.city, postalCode: geo.postalCode };
}

export async function createRestaurant(owner: User, input: CreateRestaurantInput) {
  if (owner.role === "USER") throw forbidden("Solo los dueños pueden dar de alta restaurantes");

  const limits = await getOwnerLimits(owner);
  const current = await prisma.restaurant.count({ where: { ownerId: owner.id, status: { not: "ARCHIVED" } } });
  if (current >= limits.maxRestaurants) {
    throw new DomainError("LIMIT_REACHED", `Tu plan (${limits.planName}) permite ${limits.maxRestaurants} restaurante(s). Amplía el plan para añadir más.`);
  }

  const coords = await resolveCoordinates(input);
  const { taxonomyIds = [], ...data } = input;
  const restaurant = await prisma.restaurant.create({
    data: {
      ...data,
      website: data.website || null,
      city: coords.city,
      postalCode: data.postalCode ?? coords.postalCode,
      latitude: coords.latitude,
      longitude: coords.longitude,
      ownerId: owner.id,
      slug: await uniqueSlug(input.name),
      status: "PENDING",
      taxonomies: { create: taxonomyIds.map((taxonomyId) => ({ taxonomyId })) },
    },
  });

  await emitEvent(
    "restaurant.created",
    await eventData(restaurant.id),
    await notifyAdmins("NEW_RESTAURANT_CREATED", "Nuevo restaurante pendiente", `${restaurant.name} espera revisión.`, restaurant.id),
  );
  return restaurant;
}

export async function updateRestaurant(actor: User, id: string, input: UpdateRestaurantInput) {
  const existing = await prisma.restaurant.findUnique({ where: { id } });
  if (!existing) throw notFound("El restaurante");
  if (existing.ownerId !== actor.id && actor.role !== "ADMIN") throw forbidden();

  const { taxonomyIds, ...data } = input;
  const addressChanged = (data.address && data.address !== existing.address) || (data.city && data.city !== existing.city);
  const coords =
    data.latitude != null && data.longitude != null
      ? { latitude: data.latitude, longitude: data.longitude }
      : addressChanged
        ? await resolveCoordinates({ address: data.address ?? existing.address, city: data.city ?? existing.city })
        : {};

  return prisma.restaurant.update({
    where: { id },
    data: {
      ...data,
      ...coords,
      website: data.website === "" ? null : data.website,
      ...(taxonomyIds ? { taxonomies: { deleteMany: {}, create: taxonomyIds.map((taxonomyId) => ({ taxonomyId })) } } : {}),
    },
  });
}

/** Cambio de estado con la máquina de estados y los eventos que le corresponden. */
export async function transitionRestaurant(actor: User, id: string, to: RestaurantStatus, reason?: string) {
  const existing = await prisma.restaurant.findUnique({ where: { id } });
  if (!existing) throw notFound("El restaurante");
  const role = actor.role === "ADMIN" ? "ADMIN" : existing.ownerId === actor.id ? actor.role : "USER";
  if (!canTransition(existing.status, to, role)) {
    throw new DomainError("INVALID_TRANSITION", `No se puede pasar de ${existing.status} a ${to} con tu rol`);
  }
  if (to === "REJECTED" && !reason) throw new DomainError("VALIDATION_ERROR", "Indica el motivo del rechazo");

  const updated = await prisma.restaurant.update({
    where: { id },
    data: { status: to, rejectionReason: to === "REJECTED" ? reason : to === "PENDING" ? null : existing.rejectionReason },
  });

  const ownerNotification = (type: "RESTAURANT_APPROVED" | "RESTAURANT_REJECTED", title: string, message: string) => [
    { userId: existing.ownerId, type, title, message, referenceId: id },
  ];

  if (to === "APPROVED" && existing.status === "PENDING") {
    await emitEvent(
      "restaurant.approved",
      await eventData(id, { publicUrl: `${env.appUrl()}/restaurant/${updated.slug}` }),
      ownerNotification("RESTAURANT_APPROVED", "Restaurante aprobado", `${updated.name} ya es visible en el directorio.`),
    );
  } else if (to === "REJECTED") {
    await emitEvent(
      "restaurant.rejected",
      await eventData(id, { reason }),
      ownerNotification("RESTAURANT_REJECTED", "Restaurante rechazado", `${updated.name}: ${reason}`),
    );
  } else if (to === "PENDING") {
    await emitEvent(
      "restaurant.resubmitted",
      await eventData(id),
      await notifyAdmins("NEW_RESTAURANT_CREATED", "Restaurante reenviado", `${updated.name} se ha corregido y espera revisión.`, id),
    );
  }
  return updated;
}

export async function deleteRestaurant(actor: User, id: string) {
  const existing = await prisma.restaurant.findUnique({ where: { id } });
  if (!existing) throw notFound("El restaurante");
  if (existing.ownerId !== actor.id && actor.role !== "ADMIN") throw forbidden();
  await prisma.restaurant.delete({ where: { id } });
}

/** Reasigna un restaurante a otro owner (admin). Útil para adoptar los de demo. */
export async function reassignRestaurant(actor: User, id: string, newOwnerId: string) {
  if (actor.role !== "ADMIN") throw forbidden();
  const owner = await prisma.user.findUnique({ where: { id: newOwnerId } });
  if (!owner || owner.role === "USER") throw new DomainError("VALIDATION_ERROR", "El destinatario debe ser dueño o administrador");
  return prisma.restaurant.update({ where: { id }, data: { ownerId: newOwnerId } });
}
