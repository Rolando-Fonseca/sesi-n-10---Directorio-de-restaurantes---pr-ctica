import Link from "next/link";
import { ClipboardCheck, MessageSquare, Store, Users, Webhook } from "lucide-react";
import { RestaurantReviewActions } from "@/components/dashboard/admin/restaurant-review-actions";
import { PageHeader, Panel, StatCard, StatusBadge } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/format";
import { requireUserWithRole } from "@/lib/session";
import { getStats } from "@/server/queries/misc";
import { getRestaurantsByStatus } from "@/server/queries/restaurants";

export const metadata = { title: "Administración" };

export default async function AdminDashboardPage() {
  await requireUserWithRole("ADMIN");
  const [stats, pending] = await Promise.all([getStats(7), getRestaurantsByStatus("PENDING", 1, 10)]);

  return (
    <>
      <PageHeader title="Administración" description="Últimos 7 días. Lo mismo que devuelve GET /api/v1/admin/stats para n8n." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pendientes de revisión" value={stats.restaurants.PENDING} icon={ClipboardCheck} tone={stats.restaurants.PENDING ? "warning" : "default"} hint={`${stats.restaurants.APPROVED} publicados · ${stats.restaurants.REJECTED} rechazados`} />
        <StatCard label="Usuarios" value={stats.users.total} icon={Users} hint={`${stats.users.new} nuevos · ${stats.users.owners} dueños`} />
        <StatCard label="Reseñas" value={stats.reviews.total} icon={MessageSquare} hint={`${stats.reviews.new} nuevas · media ${stats.reviews.averageScore.toFixed(1).replace(".", ",")}`} />
        <StatCard label="Webhooks (7 días)" value={stats.webhooks.delivered} icon={Webhook} hint={`${stats.webhooks.failed} fallidos · ${stats.webhooks.pending} pendientes`} tone={stats.webhooks.failed ? "warning" : "default"} />
      </div>

      <Panel
        className="mt-6"
        title="Cola de aprobación"
        description={pending.total ? `${pending.total} restaurantes esperan revisión` : "Nada pendiente"}
        action={
          <Button asChild variant="link" size="sm">
            <Link href="/dashboard/admin/restaurants?status=PENDING">Ver todos</Link>
          </Button>
        }
      >
        {pending.items.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Store className="size-4" /> Todo revisado. Cuando un dueño dé de alta un restaurante aparecerá aquí y llegará un evento <code className="rounded bg-muted px-1">restaurant.created</code>.
          </p>
        ) : (
          <ul className="divide-y">
            {pending.items.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <Link href={`/dashboard/admin/restaurants/${r.id}`} className="font-semibold hover:underline">
                    {r.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {r.city ?? "Sin ciudad"} · {r.owner.email} · {timeAgo(r.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={r.status} />
                  <RestaurantReviewActions restaurantId={r.id} name={r.name} status={r.status} ownerId={r.ownerId} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
