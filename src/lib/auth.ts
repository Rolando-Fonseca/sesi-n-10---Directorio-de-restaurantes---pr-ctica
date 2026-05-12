import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./db";
import type { UserRole } from "@prisma/client";

export async function getAuthenticatedUser() {
  const { userId } = await auth();
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId } });
}

export async function requireRole(role: UserRole) {
  const user = await getAuthenticatedUser();
  if (!user || (user.role !== role && user.role !== "ADMIN")) {
    throw new Error(`Unauthorized: Required role ${role}`);
  }
  return user;
}

export async function requireAuth() {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function syncClerkUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  return prisma.user.upsert({
    where: { id: clerkUser.id },
    update: {
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
    },
    create: {
      id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
      role: (clerkUser.publicMetadata?.role as UserRole) ?? "USER",
    },
  });
}
