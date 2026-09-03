import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { getAuthenticatedUser, syncClerkUser } from "./auth";

/**
 * Usuario de la sesión para páginas del panel. Si Clerk tiene sesión pero la
 * fila aún no existe (primera visita sin webhook), la crea. Sin sesión, redirige.
 */
export async function requireUser() {
  const user = (await getAuthenticatedUser()) ?? (await syncClerkUser());
  if (!user) redirect("/sign-in");
  return user;
}

/** Como requireUser, pero exige un rol (el admin siempre pasa). */
export async function requireUserWithRole(role: UserRole) {
  const user = await requireUser();
  if (user.role !== role && user.role !== "ADMIN") redirect("/dashboard");
  return user;
}
