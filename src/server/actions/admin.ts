"use server";

import { z } from "zod";
import { rejectRestaurantSchema, setUserRoleSchema, webhookTestSchema } from "@/lib/validations/admin";
import { createTaxonomySchema, updateTaxonomySchema } from "@/lib/validations/taxonomies";
import { retryDelivery } from "@/server/events/deliver";
import { emitEvent } from "@/server/events/emit";
import { reassignRestaurant, transitionRestaurant } from "@/server/services/restaurants";
import * as taxonomies from "@/server/services/taxonomies";
import { setUserRole } from "@/server/services/users";
import { runAction } from "./_helpers";

const ADMIN_PATHS = ["/dashboard/admin", "/dashboard/admin/restaurants", "/explore", "/"];

export async function approveRestaurantAction(input: unknown) {
  return runAction({
    schema: z.object({ restaurantId: z.string().uuid() }),
    input,
    role: "ADMIN",
    revalidate: [...ADMIN_PATHS, "/dashboard/owner", "/restaurant/[slug]"],
    handler: async ({ restaurantId }, { user }) => {
      const r = await transitionRestaurant(user, restaurantId, "APPROVED");
      return { id: r.id, status: r.status };
    },
  });
}

export async function rejectRestaurantAction(input: unknown) {
  return runAction({
    schema: rejectRestaurantSchema,
    input,
    role: "ADMIN",
    revalidate: [...ADMIN_PATHS, "/dashboard/owner"],
    handler: async ({ restaurantId, reason }, { user }) => {
      const r = await transitionRestaurant(user, restaurantId, "REJECTED", reason);
      return { id: r.id, status: r.status };
    },
  });
}

export async function reassignRestaurantAction(input: unknown) {
  return runAction({
    schema: z.object({ restaurantId: z.string().uuid(), ownerId: z.string().min(1) }),
    input,
    role: "ADMIN",
    revalidate: [...ADMIN_PATHS, "/dashboard/owner"],
    handler: async ({ restaurantId, ownerId }, { user }) => ({ id: (await reassignRestaurant(user, restaurantId, ownerId)).id }),
  });
}

export async function setUserRoleAction(input: unknown) {
  return runAction({
    schema: setUserRoleSchema,
    input,
    role: "ADMIN",
    revalidate: ["/dashboard/admin/users"],
    handler: async ({ userId, role }, { user }) => ({ id: (await setUserRole(user, userId, role)).id, role }),
  });
}

const TAX_PATHS = ["/dashboard/admin/taxonomies", "/explore", "/categories"];

export async function createTaxonomyAction(input: unknown) {
  return runAction({ schema: createTaxonomySchema, input, role: "ADMIN", revalidate: TAX_PATHS, handler: async (data, { user }) => taxonomies.createTaxonomy(user, data) });
}

export async function updateTaxonomyAction(input: unknown) {
  return runAction({
    schema: updateTaxonomySchema.extend({ id: z.string().uuid() }),
    input,
    role: "ADMIN",
    revalidate: TAX_PATHS,
    handler: async ({ id, ...data }, { user }) => taxonomies.updateTaxonomy(user, id, data),
  });
}

export async function deleteTaxonomyAction(input: unknown) {
  return runAction({ schema: z.object({ id: z.string().uuid() }), input, role: "ADMIN", revalidate: TAX_PATHS, handler: async ({ id }, { user }) => taxonomies.deleteTaxonomy(user, id) });
}

/** Envía un evento de prueba a las URLs configuradas (para probar n8n). */
export async function sendTestWebhookAction(input: unknown) {
  return runAction({
    schema: webhookTestSchema,
    input,
    role: "ADMIN",
    revalidate: ["/dashboard/admin/webhooks"],
    handler: async ({ message }, { user }) => {
      const envelope = await emitEvent("webhook.test", { message, sentBy: user.email });
      return { deliveryId: envelope?.id ?? null };
    },
  });
}

export async function retryWebhookDeliveryAction(input: unknown) {
  return runAction({
    schema: z.object({ id: z.string().uuid() }),
    input,
    role: "ADMIN",
    revalidate: ["/dashboard/admin/webhooks"],
    handler: async ({ id }) => retryDelivery(id),
  });
}
