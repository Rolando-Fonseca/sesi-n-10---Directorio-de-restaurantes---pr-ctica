import Link from "next/link";
import type { RestaurantStatus } from "@prisma/client";
import { RestaurantReviewActions } from "@/components/dashboard/admin/restaurant-review-actions";
import { PageHeader, Panel, StatusBadge } from "@/components/dashboard/ui";
import { timeAgo } from "@/lib/format";
import { requireUserWithRole } from "@/lib/session";
import { cn } from "@/lib/utils";
import { countRestaurantsByStatus, getRestaurantsByStatus } from "@/server/queries/restaurants";

export const metadata = { title: "Restaurantes" };

const TABS: { key: RestaurantStatus | "ALL"; label: string }[] = [
  { key: "PENDING", label: "Pendientes" },
  { key: "APPROVED", label: "Publicados" },
  { key: "REJECTED", label: "Rechazados" },
  { key: "ARCHIVED", label: "Archivados" },
  { key: "ALL", label: "Todos" },
];

export default async function AdminRestaurantsPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  await requireUserWithRole("ADMIN");
  const sp = await searchParams;
  const status = (TABS.some((t) => t.key === sp.status) ? sp.status : "PENDING") as RestaurantStatus | "ALL";
  const page = Number(sp.page) || 1;
  const [counts, result] = await Promise.all([countRestaurantsByStatus(), getRestaurantsByStatus(status === "ALL" ? undefined : status, page, 20)]);

  return (
    <>
      <PageHeader title="Restaurantes" description="Aprobar, rechazar con motivo o reasignar dueño." />
      <nav aria-label="Estado" className="mb-4 flex flex-wrap gap-1.5">
        {TABS.map((t) => {
          const n = t.key === "ALL" ? Object.values(counts).reduce((s, x) => s + x, 0) : counts[t.key];
          return (
            <Link key={t.key} href={`/dashboard/admin/restaurants?status=${t.key}`} aria-current={status === t.key ? "page" : undefined} className={cn("rounded-full border px-3 py-1.5 text-sm font-medium", status === t.key ? "border-foreground bg-foreground text-background" : "bg-background hover:border-foreground/40")}>
              {t.label} <span className="opacity-70">{n}</span>
            </Link>
          );
        })}
      </nav>
      <Panel>
        {result.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay restaurantes en este estado.</p>
        ) : (
          <ul className="divide-y">
            {result.items.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <Link href={`/dashboard/admin/restaurants/${r.id}`} className="font-semibold hover:underline">
                    {r.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {r.city ?? "Sin ciudad"} · {r.taxonomies.map((t) => t.taxonomy.name).slice(0, 3).join(", ")} · {r.owner.email} · {timeAgo(r.createdAt)}
                  </p>
                  {r.status === "REJECTED" && r.rejectionReason && <p className="text-xs text-destructive">Motivo: {r.rejectionReason}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={r.status} />
                  <RestaurantReviewActions restaurantId={r.id} name={r.name} status={r.status} ownerId={r.ownerId} />
                </div>
              </li>
            ))}
          </ul>
        )}
        {result.pages > 1 && (
          <p className="mt-4 text-sm text-muted-foreground">
            Página {result.page} de {result.pages}.{" "}
            {result.page < result.pages && (
              <Link href={`/dashboard/admin/restaurants?status=${status}&page=${result.page + 1}`} className="font-medium text-primary hover:underline">
                Siguiente
              </Link>
            )}
          </p>
        )}
      </Panel>
    </>
  );
}
