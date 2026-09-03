import Link from "next/link";
import { AlertCircle, Heart, MessageSquare, Store } from "lucide-react";
import { ReviewList } from "@/components/features/review/review-list";
import { EmptyState, PageHeader, Panel, StatCard, StatusBadge } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/session";
import { getOwnerStats } from "@/server/queries/misc";
import { getRestaurantsByOwner } from "@/server/queries/restaurants";
import { getReviewsForOwner } from "@/server/queries/reviews";
import { getOwnerLimits } from "@/server/services/subscriptions";

export const metadata = { title: "Mi negocio" };

export default async function OwnerDashboardPage() {
  const user = await requireUser();
  const [stats, restaurants, reviews, limits] = await Promise.all([getOwnerStats(user.id), getRestaurantsByOwner(user.id), getReviewsForOwner(user.id, 5), getOwnerLimits(user)]);
  const rejected = restaurants.filter((r) => r.status === "REJECTED");

  if (restaurants.length === 0) {
    return (
      <>
        <PageHeader title="Mi negocio" description="Publica tu primer restaurante en cinco minutos." />
        <EmptyState icon={Store} title="Todavía no tienes ningún restaurante" text="Rellena la ficha, sitúalo en el mapa y envíalo a revisión. En cuanto un administrador lo apruebe, aparecerá en el directorio." action={{ href: "/dashboard/owner/restaurants/new", label: "Dar de alta un restaurante" }} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Mi negocio"
        description={`Plan ${limits.planName}: hasta ${limits.maxRestaurants === Infinity ? "∞" : limits.maxRestaurants} restaurantes y ${limits.maxMenus === Infinity ? "∞" : limits.maxMenus} cartas.`}
        action={
          <Button asChild>
            <Link href="/dashboard/owner/restaurants/new">Nuevo restaurante</Link>
          </Button>
        }
      />
      {rejected.length > 0 && (
        <div role="alert" className="mb-6 flex gap-3 rounded-xl bg-destructive/10 p-4 text-sm ring-1 ring-destructive/30">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div>
            <p className="font-semibold">{rejected.length === 1 ? "Un restaurante fue rechazado" : `${rejected.length} restaurantes fueron rechazados`}</p>
            <ul className="mt-1 space-y-1">
              {rejected.map((r) => (
                <li key={r.id}>
                  <Link href={`/dashboard/owner/restaurants/${r.id}`} className="font-medium underline underline-offset-2">
                    {r.name}
                  </Link>
                  : {r.rejectionReason}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Restaurantes" value={stats.restaurants} hint={stats.pending ? `${stats.pending} en revisión` : "todos revisados"} icon={Store} tone={stats.pending ? "warning" : "default"} />
        <StatCard label="Reseñas recibidas" value={stats.reviews} hint={stats.averageScore ? `media ${stats.averageScore.toFixed(1).replace(".", ",")}` : undefined} icon={MessageSquare} />
        <StatCard label="Platos guardados por usuarios" value={stats.wishlist} icon={Heart} />
        <StatCard label="Avisos sin leer" value={stats.unread} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Panel
          title="Tus restaurantes"
          action={
            <Button asChild variant="link" size="sm">
              <Link href="/dashboard/owner/restaurants">Gestionar</Link>
            </Button>
          }
        >
          <ul className="divide-y">
            {restaurants.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <Link href={`/dashboard/owner/restaurants/${r.id}`} className="font-medium hover:underline">
                  {r.name}
                </Link>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span>
                    {r._count.menus} {r._count.menus === 1 ? "carta" : "cartas"}
                  </span>
                  <StatusBadge status={r.status} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel
          title="Últimas reseñas"
          action={
            <Button asChild variant="link" size="sm">
              <Link href="/dashboard/owner/reviews">Ver todas</Link>
            </Button>
          }
        >
          <ReviewList reviews={reviews} showRestaurant />
        </Panel>
      </div>
    </>
  );
}
