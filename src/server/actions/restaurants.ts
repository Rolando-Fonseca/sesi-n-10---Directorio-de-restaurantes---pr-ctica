"use server";

import { z } from "zod";
import { createRestaurantSchema, updateRestaurantSchema } from "@/lib/validations/restaurants";
import { createRestaurant, deleteRestaurant, transitionRestaurant, updateRestaurant } from "@/server/services/restaurants";
import { becomeOwner } from "@/server/services/users";
import { runAction } from "./_helpers";

const OWNER_PATHS = ["/dashboard/owner", "/dashboard/owner/restaurants", "/explore", "/"];

export async function createRestaurantAction(input: unknown) {
  return runAction({
    schema: createRestaurantSchema,
    input,
    revalidate: [...OWNER_PATHS, "/dashboard/admin/restaurants"],
    handler: async (data, { user }) => {
      // Un usuario que da de alta su primer restaurante se convierte en dueño.
      const actor = user.role === "USER" ? await becomeOwner(user) : user;
      const r = await createRestaurant(actor, data);
      return { id: r.id, slug: r.slug };
    },
  });
}

export async function updateRestaurantAction(input: unknown) {
  return runAction({
    schema: updateRestaurantSchema.extend({ id: z.string().uuid() }),
    input,
    role: "OWNER",
    revalidate: [...OWNER_PATHS, "/restaurant/[slug]"],
    handler: async ({ id, ...data }, { user }) => {
      const r = await updateRestaurant(user, id, data);
      return { id: r.id, slug: r.slug };
    },
  });
}

/** Archivar, restaurar o reenviar tras un rechazo. */
export async function ownerTransitionAction(input: unknown) {
  return runAction({
    schema: z.object({ id: z.string().uuid(), to: z.enum(["ARCHIVED", "APPROVED", "PENDING"]) }),
    input,
    role: "OWNER",
    revalidate: [...OWNER_PATHS, "/dashboard/admin/restaurants"],
    handler: async ({ id, to }, { user }) => {
      const r = await transitionRestaurant(user, id, to);
      return { id: r.id, status: r.status };
    },
  });
}

export async function deleteRestaurantAction(input: unknown) {
  return runAction({
    schema: z.object({ id: z.string().uuid() }),
    input,
    role: "OWNER",
    revalidate: OWNER_PATHS,
    handler: async ({ id }, { user }) => {
      await deleteRestaurant(user, id);
      return { id };
    },
  });
}
