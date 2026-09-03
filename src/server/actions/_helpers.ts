import type { User, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import type { ZodTypeAny, z } from "zod";
import { getAuthenticatedUser, syncClerkUser } from "@/lib/auth";
import type { ActionResponse } from "@/types/api";
import { DomainError } from "@/server/services/errors";

type Ctx = { user: User };

/**
 * Patrón único de toda Server Action (CLAUDE.md):
 *   validar con Zod -> usuario autenticado -> rol -> servicio -> revalidar rutas.
 * Nunca lanza al cliente: devuelve ActionResponse con código estable.
 */
export async function runAction<S extends ZodTypeAny, T>(opts: {
  schema: S;
  input: unknown;
  role?: UserRole;
  revalidate?: string[];
  handler: (input: z.infer<S>, ctx: Ctx) => Promise<T>;
}): Promise<ActionResponse<T>> {
  const parsed = opts.schema.safeParse(opts.input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { success: false, error: first ? `${first.path.join(".") || "datos"}: ${first.message}` : "Datos no válidos", code: "VALIDATION_ERROR" };
  }

  // Primera visita autenticada sin webhook aún (local): sincroniza perezosamente.
  const user = (await getAuthenticatedUser()) ?? (await syncClerkUser());
  if (!user) return { success: false, error: "Inicia sesión para continuar", code: "UNAUTHORIZED" };
  if (opts.role && user.role !== opts.role && user.role !== "ADMIN") {
    return { success: false, error: "No tienes permiso para esta acción", code: "FORBIDDEN" };
  }

  try {
    const data = await opts.handler(parsed.data, { user });
    for (const path of opts.revalidate ?? []) revalidatePath(path);
    return { success: true, data };
  } catch (e) {
    if (e instanceof DomainError) return { success: false, error: e.message, code: e.code };
    console.error("[action]", e);
    return { success: false, error: "Algo ha fallado. Inténtalo de nuevo.", code: "INTERNAL" };
  }
}
