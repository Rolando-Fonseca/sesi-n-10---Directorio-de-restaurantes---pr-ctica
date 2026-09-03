import type { User } from "@prisma/client";
import { prisma } from "@/lib/db";
import { generateSlug } from "@/lib/slug";
import type { CreateTaxonomyInput, UpdateTaxonomyInput } from "@/lib/validations/taxonomies";
import { DomainError, forbidden, notFound } from "./errors";

function assertAdmin(actor: User) {
  if (actor.role !== "ADMIN") throw forbidden("Solo el administrador gestiona las taxonomías");
}

export async function createTaxonomy(actor: User, input: CreateTaxonomyInput) {
  assertAdmin(actor);
  const slug = input.slug ? generateSlug(input.slug) : generateSlug(input.name);
  const dup = await prisma.taxonomy.findUnique({ where: { scope_slug: { scope: input.scope, slug } } });
  if (dup) throw new DomainError("CONFLICT", `Ya existe "${slug}" en ${input.scope}`);
  return prisma.taxonomy.create({ data: { ...input, slug } });
}

export async function updateTaxonomy(actor: User, id: string, input: UpdateTaxonomyInput) {
  assertAdmin(actor);
  const existing = await prisma.taxonomy.findUnique({ where: { id } });
  if (!existing) throw notFound("La taxonomía");
  return prisma.taxonomy.update({ where: { id }, data: { ...input, ...(input.slug ? { slug: generateSlug(input.slug) } : {}) } });
}

/**
 * Borra si nadie la usa; si está en uso la desactiva, para no romper fichas
 * ni cartas existentes.
 */
export async function deleteTaxonomy(actor: User, id: string) {
  assertAdmin(actor);
  const existing = await prisma.taxonomy.findUnique({
    where: { id },
    include: { _count: { select: { restaurants: true, dishTaxonomies: true, menuCategories: true, userPreferences: true, userAllergens: true } } },
  });
  if (!existing) throw notFound("La taxonomía");
  const uses = Object.values(existing._count).reduce((s, n) => s + n, 0);
  if (uses > 0) {
    await prisma.taxonomy.update({ where: { id }, data: { isActive: false } });
    return { deleted: false, deactivated: true, uses };
  }
  await prisma.taxonomy.delete({ where: { id } });
  return { deleted: true, deactivated: false, uses: 0 };
}
