import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function getUsersForAdmin(role?: UserRole, page = 1, limit = 30) {
  const where = role ? { role } : {};
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, email: true, firstName: true, lastName: true, imageUrl: true, role: true, points: true, level: true, createdAt: true,
        _count: { select: { restaurants: true, reviews: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);
  return { items, page, limit, total, pages: Math.ceil(total / limit) };
}

/** Perfil completo para el panel del usuario. */
export async function getUserProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      preferences: { include: { taxonomy: { select: { id: true, slug: true, name: true, icon: true } } } },
      userAllergens: { include: { allergen: { select: { id: true, slug: true, name: true, icon: true } } } },
      badges: { include: { badge: true }, orderBy: { earnedAt: "desc" } },
      pointTransactions: { orderBy: { createdAt: "desc" }, take: 20 },
      _count: { select: { reviews: true, wishlistItems: true } },
    },
  });
}

/** Alérgenos del usuario (para filtrar cartas). Vacío si no hay sesión. */
export async function getUserAllergenIds(userId: string | null): Promise<Set<string>> {
  if (!userId) return new Set();
  const rows = await prisma.userAllergen.findMany({ where: { userId }, select: { allergenId: true } });
  return new Set(rows.map((r) => r.allergenId));
}

export async function getOwnerCandidates() {
  return prisma.user.findMany({ where: { role: { in: ["OWNER", "ADMIN"] } }, select: { id: true, email: true, firstName: true, lastName: true }, orderBy: { email: "asc" } });
}
