"use server";

import { z } from "zod";
import { updateBillingSchema, updateProfileSchema } from "@/lib/validations/profile";
import { createSubscriptionSchema } from "@/lib/validations/subscriptions";
import { markNotificationsRead } from "@/server/queries/misc";
import { activateSubscription, cancelSubscription } from "@/server/services/subscriptions";
import { becomeOwner, updateBilling, updateProfile } from "@/server/services/users";
import { runAction } from "./_helpers";

export async function updateProfileAction(input: unknown) {
  return runAction({
    schema: updateProfileSchema,
    input,
    revalidate: ["/dashboard/profile", "/dashboard/user", "/restaurant/[slug]"],
    handler: async (data, { user }) => ({ id: (await updateProfile(user, data)).id }),
  });
}

export async function updateBillingAction(input: unknown) {
  return runAction({ schema: updateBillingSchema, input, role: "OWNER", revalidate: ["/dashboard/owner/subscription"], handler: async (data, { user }) => ({ id: (await updateBilling(user, data)).id }) });
}

export async function becomeOwnerAction() {
  return runAction({ schema: z.object({}), input: {}, revalidate: ["/dashboard", "/dashboard/owner"], handler: async (_, { user }) => ({ role: (await becomeOwner(user)).role }) });
}

/** Activación simulada de un plan (ADR-0003). */
export async function activateSubscriptionAction(input: unknown) {
  return runAction({
    schema: createSubscriptionSchema.omit({ provider: true }),
    input,
    role: "OWNER",
    revalidate: ["/dashboard/owner", "/dashboard/owner/subscription", "/dashboard/owner/invoices"],
    handler: async ({ planId, interval, couponCode }, { user }) => ({ id: (await activateSubscription(user, planId, interval, couponCode)).id }),
  });
}

export async function cancelSubscriptionAction(input: unknown) {
  return runAction({
    schema: z.object({ id: z.string().uuid() }),
    input,
    role: "OWNER",
    revalidate: ["/dashboard/owner/subscription"],
    handler: async ({ id }, { user }) => ({ id: (await cancelSubscription(user, id)).id }),
  });
}

export async function markNotificationsReadAction(input: unknown) {
  return runAction({
    schema: z.object({ ids: z.array(z.string().uuid()).optional() }),
    input,
    revalidate: ["/dashboard"],
    handler: async ({ ids }, { user }) => (await markNotificationsRead(user.id, ids), { ok: true }),
  });
}
