"use server";

import { z } from "zod";
import { createDishSchema, updateDishSchema } from "@/lib/validations/dishes";
import { createMenuCategorySchema, updateMenuCategorySchema } from "@/lib/validations/menu-categories";
import { createMenuSchema, updateMenuSchema } from "@/lib/validations/menus";
import * as menus from "@/server/services/menus";
import { runAction } from "./_helpers";

const PATHS = ["/dashboard/owner/menus", "/restaurant/[slug]"];
const id = z.object({ id: z.string().uuid() });

export async function createMenuAction(input: unknown) {
  return runAction({ schema: createMenuSchema, input, role: "OWNER", revalidate: PATHS, handler: async (data, { user }) => ({ id: (await menus.createMenu(user, data)).id }) });
}

export async function updateMenuAction(input: unknown) {
  return runAction({
    schema: updateMenuSchema.extend({ id: z.string().uuid() }),
    input,
    role: "OWNER",
    revalidate: PATHS,
    handler: async ({ id, ...data }, { user }) => ({ id: (await menus.updateMenu(user, id, data)).id }),
  });
}

export async function deleteMenuAction(input: unknown) {
  return runAction({ schema: id, input, role: "OWNER", revalidate: PATHS, handler: async ({ id }, { user }) => (await menus.deleteMenu(user, id), { id }) });
}

export async function createMenuCategoryAction(input: unknown) {
  return runAction({ schema: createMenuCategorySchema, input, role: "OWNER", revalidate: PATHS, handler: async (data, { user }) => menus.createMenuCategory(user, data) });
}

export async function updateMenuCategoryAction(input: unknown) {
  return runAction({
    schema: updateMenuCategorySchema.extend({ id: z.string().uuid() }),
    input,
    role: "OWNER",
    revalidate: PATHS,
    handler: async ({ id, ...data }, { user }) => menus.updateMenuCategory(user, id, data),
  });
}

export async function deleteMenuCategoryAction(input: unknown) {
  return runAction({ schema: id, input, role: "OWNER", revalidate: PATHS, handler: async ({ id }, { user }) => (await menus.deleteMenuCategory(user, id), { id }) });
}

export async function createDishAction(input: unknown) {
  return runAction({ schema: createDishSchema, input, role: "OWNER", revalidate: PATHS, handler: async (data, { user }) => ({ id: (await menus.createDish(user, data)).id }) });
}

export async function updateDishAction(input: unknown) {
  return runAction({
    schema: updateDishSchema.extend({ id: z.string().uuid() }),
    input,
    role: "OWNER",
    revalidate: PATHS,
    handler: async ({ id, ...data }, { user }) => ({ id: (await menus.updateDish(user, id, data)).id }),
  });
}

export async function deleteDishAction(input: unknown) {
  return runAction({ schema: id, input, role: "OWNER", revalidate: PATHS, handler: async ({ id }, { user }) => (await menus.deleteDish(user, id), { id }) });
}

export async function reorderDishesAction(input: unknown) {
  return runAction({
    schema: z.object({ menuId: z.string().uuid(), orderedIds: z.array(z.string().uuid()).min(1) }),
    input,
    role: "OWNER",
    revalidate: PATHS,
    handler: async ({ menuId, orderedIds }, { user }) => (await menus.reorderDishes(user, menuId, orderedIds), { menuId }),
  });
}
