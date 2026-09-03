import { randomUUID } from "node:crypto";
import type { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { deliverWithRetries } from "./deliver";
import { EVENT_VERSION, type DomainEventEnvelope, type DomainEventMap, type DomainEventName } from "./types";

type NotificationSpec = { userId: string | null; type: NotificationType; title: string; message: string; referenceId?: string };

/**
 * Construye el sobre del evento. Pura: testeable sin base de datos.
 */
export function buildEnvelope<E extends DomainEventName>(event: E, data: DomainEventMap[E], now = new Date()): DomainEventEnvelope<E> {
  return { id: randomUUID(), event, version: EVENT_VERSION, occurredAt: now.toISOString(), data };
}

/**
 * Emite un evento de dominio:
 *  1. Crea las notificaciones internas indicadas (si las hay).
 *  2. Registra una entrega pendiente por cada URL de WEBHOOK_URLS.
 *  3. Programa la entrega fuera del ciclo de la petición. Si no hay contexto de
 *     petición (seed, scripts, tests), entrega en segundo plano sin esperar.
 *
 * Nunca lanza: un fallo aquí no debe romper la operación de negocio que lo originó.
 */
export async function emitEvent<E extends DomainEventName>(
  event: E,
  data: DomainEventMap[E],
  notifications: NotificationSpec[] = [],
): Promise<DomainEventEnvelope<E> | null> {
  try {
    const envelope = buildEnvelope(event, data);

    if (notifications.length) {
      await prisma.notification.createMany({
        data: notifications.map((n) => ({ userId: n.userId, type: n.type, title: n.title, message: n.message, referenceId: n.referenceId })),
      });
    }

    const urls = env.webhookUrls();
    if (urls.length) {
      const rows = urls.map((url) => ({ id: randomUUID(), event, url, payload: envelope as object }));
      await prisma.webhookDelivery.createMany({ data: rows });
      schedule(() => Promise.all(rows.map((r) => deliverWithRetries(r.id))).then(() => undefined));
    }

    return envelope;
  } catch (e) {
    console.error(`[events] no se pudo emitir ${event}:`, e);
    return null;
  }
}

/** Notificación estándar para todos los administradores. */
export async function notifyAdmins(type: NotificationType, title: string, message: string, referenceId?: string): Promise<NotificationSpec[]> {
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  return admins.map((a) => ({ userId: a.id, type, title, message, referenceId }));
}

function schedule(task: () => Promise<void>) {
  // `after` solo existe dentro de una petición de Next. Fuera de ella (seed,
  // scripts, tests) ejecutamos la tarea sin bloquear al llamador.
  import("next/server")
    .then(({ after }) => {
      try {
        after(task);
      } catch {
        void task();
      }
    })
    .catch(() => void task());
}
