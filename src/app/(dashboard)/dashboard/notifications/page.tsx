import { Bell } from "lucide-react";
import { ActionButton } from "@/components/dashboard/action-button";
import { EmptyState, PageHeader, Panel } from "@/components/dashboard/ui";
import { timeAgo } from "@/lib/format";
import { requireUser } from "@/lib/session";
import { cn } from "@/lib/utils";
import { markNotificationsReadAction } from "@/server/actions/account";
import { getNotifications } from "@/server/queries/misc";

export const metadata = { title: "Notificaciones" };

export default async function NotificationsPage() {
  const user = await requireUser();
  const items = await getNotifications(user.id, false, 50);
  const unread = items.filter((n) => !n.isRead).length;

  return (
    <>
      <PageHeader
        title="Notificaciones"
        description={unread ? `${unread} sin leer` : "Todo leído"}
        action={
          unread > 0 && (
            <ActionButton action={markNotificationsReadAction} payload={{}} variant="outline" successMessage="Marcadas como leídas">
              Marcar todas como leídas
            </ActionButton>
          )
        }
      />
      {items.length === 0 ? (
        <EmptyState icon={Bell} title="Sin notificaciones" text="Aquí verás las reseñas recibidas, los cambios de estado de tus restaurantes y los avisos del sistema." />
      ) : (
        <Panel>
          <ul className="divide-y">
            {items.map((n) => (
              <li key={n.id} className={cn("flex gap-3 py-3", !n.isRead && "font-medium")}>
                <span className={cn("mt-2 size-2 shrink-0 rounded-full", n.isRead ? "bg-transparent" : "bg-primary")} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p>{n.title}</p>
                  <p className="text-sm font-normal text-muted-foreground">{n.message}</p>
                </div>
                <time dateTime={n.createdAt.toISOString()} className="shrink-0 text-xs font-normal text-muted-foreground">
                  {timeAgo(n.createdAt)}
                </time>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </>
  );
}
