import type { User } from "@prisma/client";
import { prisma } from "@/lib/db";
import { generateSlug } from "@/lib/slug";
import type { CreateDishInput, UpdateDishInput } from "@/lib/validations/dishes";
import type { CreateMenuCategoryInput, UpdateMenuCategoryInput } from "@/lib/validations/menu-categories";
import type { CreateMenuInput, UpdateMenuInput } from "@/lib/validations/menus";
import { emitEvent, notifyAdmins } from "@/server/events/emit";
import { DomainError, forbidden, notFound } from "./errors";
import { getOwnerLimits } from "./subscriptions";

const isAdmin = (u: User) => u.role === "ADMIN";

/** Comprueba que todos los restaurantes pertenecen al actor (o que es admin). */
async function assertOwnsRestaurants(actor: User, restaurantIds: string[]) {
  if (isAdmin(actor) || restaurantIds.length === 0) return;
  const owned = await prisma.restaurant.count({ where: { id: { in: restaurantIds }, ownerId: actor.id } });
  if (owned !== new Set(restaurantIds).size) throw forbidden("Solo puedes asignar cartas a tus propios restaurantes");
}

async function getOwnedMenu(actor: User, menuId: string) {
  const menu = await prisma.menu.findUnique({ where: { id: menuId } });
  if (!menu) throw notFound("La carta");
  if (menu.ownerId !== actor.id && !isAdmin(actor)) throw forbidden();
  return menu;
}

// ---------------- Cartas ----------------

export async function createMenu(actor: User, input: CreateMenuInput) {
  if (actor.role === "USER") throw forbidden("Solo los dueños pueden crear cartas");
  await assertOwnsRestaurants(actor, input.restaurantIds);

  const limits = await getOwnerLimits(actor);
  const current = await prisma.menu.count({ where: { ownerId: actor.id, isActive: true } });
  if (current >= limits.maxMenus) throw new DomainError("LIMIT_REACHED", `Tu plan (${limits.planName}) permite ${limits.maxMenus} carta(s).`);

  const menu = await prisma.menu.create({
    data: {
      ownerId: actor.id,
      title: input.title,
      description: input.description,
      price: input.price,
      restaurants: { create: input.restaurantIds.map((restaurantId) => ({ restaurantId })) },
    },
  });
  await emitEvent(
    "menu.created",
    { id: menu.id, title: menu.title, ownerId: actor.id, restaurantIds: input.restaurantIds },
    await notifyAdmins("NEW_MENU_CREATED", "Nueva carta", `${actor.email} ha creado la carta "${menu.title}".`, menu.id),
  );
  return menu;
}

export async function updateMenu(actor: User, menuId: string, input: UpdateMenuInput) {
  const menu = await getOwnedMenu(actor, menuId);
  const { restaurantIds, ...data } = input;
  if (restaurantIds) await assertOwnsRestaurants(actor, restaurantIds);
  return prisma.menu.update({
    where: { id: menu.id },
    data: {
      ...data,
      ...(restaurantIds ? { restaurants: { deleteMany: {}, create: restaurantIds.map((restaurantId) => ({ restaurantId })) } } : {}),
    },
  });
}

export async function deleteMenu(actor: User, menuId: string) {
  const menu = await getOwnedMenu(actor, menuId);
  await prisma.menu.delete({ where: { id: menu.id } });
}

// ---------------- Categorías locales ----------------

export async function createMenuCategory(actor: User, input: CreateMenuCategoryInput) {
  await assertOwnsRestaurants(actor, [input.restaurantId]);
  const base = generateSlug(input.name) || "categoria";
  let slug = base;
  for (let i = 2; await prisma.menuCategory.findUnique({ where: { restaurantId_slug: { restaurantId: input.restaurantId, slug } } }); i++) slug = `${base}-${i}`;
  return prisma.menuCategory.create({ data: { ...input, slug } });
}

export async function updateMenuCategory(actor: User, categoryId: string, input: UpdateMenuCategoryInput) {
  const category = await prisma.menuCategory.findUnique({ where: { id: categoryId } });
  if (!category) throw notFound("La categoría");
  await assertOwnsRestaurants(actor, [category.restaurantId]);
  return prisma.menuCategory.update({ where: { id: categoryId }, data: input });
}

export async function deleteMenuCategory(actor: User, categoryId: string) {
  const category = await prisma.menuCategory.findUnique({ where: { id: categoryId } });
  if (!category) throw notFound("La categoría");
  await assertOwnsRestaurants(actor, [category.restaurantId]);
  await prisma.menuCategory.delete({ where: { id: categoryId } }); // los platos quedan sin categoría (SetNull)
}

// ---------------- Platos ----------------

export async function createDish(actor: User, input: CreateDishInput) {
  const menu = await getOwnedMenu(actor, input.menuId);
  const limits = await getOwnerLimits(actor);
  const count = await prisma.dish.count({ where: { menuId: menu.id } });
  if (count >= limits.maxDishesPerMenu) throw new DomainError("LIMIT_REACHED", `Tu plan (${limits.planName}) permite ${limits.maxDishesPerMenu} platos por carta.`);

  const { taxonomyIds = [], ...data } = input;
  const base = generateSlug(input.name) || "plato";
  let slug = base;
  for (let i = 2; await prisma.dish.findUnique({ where: { menuId_slug: { menuId: menu.id, slug } } }); i++) slug = `${base}-${i}`;

  return prisma.dish.create({
    data: { ...data, slug, order: count, taxonomies: { create: taxonomyIds.map((taxonomyId) => ({ taxonomyId })) } },
  });
}

export async function updateDish(actor: User, dishId: string, input: UpdateDishInput) {
  const dish = await prisma.dish.findUnique({ where: { id: dishId } });
  if (!dish) throw notFound("El plato");
  await getOwnedMenu(actor, dish.menuId);
  const { taxonomyIds, ...data } = input;
  return prisma.dish.update({
    where: { id: dishId },
    data: { ...data, ...(taxonomyIds ? { taxonomies: { deleteMany: {}, create: taxonomyIds.map((taxonomyId) => ({ taxonomyId })) } } : {}) },
  });
}

export async function deleteDish(actor: User, dishId: string) {
  const dish = await prisma.dish.findUnique({ where: { id: dishId } });
  if (!dish) throw notFound("El plato");
  await getOwnedMenu(actor, dish.menuId);
  await prisma.dish.delete({ where: { id: dishId } });
}

export async function reorderDishes(actor: User, menuId: string, orderedIds: string[]) {
  await getOwnedMenu(actor, menuId);
  await prisma.$transaction(orderedIds.map((id, order) => prisma.dish.update({ where: { id, menuId }, data: { order } })));
}
