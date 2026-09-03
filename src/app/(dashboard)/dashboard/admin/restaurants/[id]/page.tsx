import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { RestaurantReviewActions } from "@/components/dashboard/admin/restaurant-review-actions";
import { RestaurantMap } from "@/components/features/map/restaurant-map";
import { PageHeader, Panel, StatusBadge } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { formatDate, formatPrice, PRICE_RANGE } from "@/lib/format";
import { requireUserWithRole } from "@/lib/session";
import { getRestaurantBySlug } from "@/server/queries/restaurants";
import { getOwnerCandidates } from "@/server/queries/users";

export const metadata = { title: "Revisar restaurante" };

export default async function AdminRestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUserWithRole("ADMIN");
  const { id } = await params;
  const row = await prisma.restaurant.findUnique({ where: { id }, include: { owner: true } });
  if (!row) notFound();
  const [r, owners] = await Promise.all([getRestaurantBySlug(row.slug, { includeUnpublished: true }), getOwnerCandidates()]);
  if (!r) notFound();
  const ownerName = [row.owner.firstName, row.owner.lastName].filter(Boolean).join(" ") || row.owner.email;

  return (
    <>
      <PageHeader
        title={r.name}
        description={`Alta ${formatDate(row.createdAt)} · dueño ${ownerName} (${row.owner.email})`}
        back={{ href: "/dashboard/admin/restaurants", label: "Restaurantes" }}
        action={
          r.status === "APPROVED" && (
            <Button asChild variant="outline">
              <Link href={`/restaurant/${r.slug}`} target="_blank">
                Ver ficha pública <ExternalLink data-icon="inline-end" />
              </Link>
            </Button>
          )
        }
      />
      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl bg-background p-4 ring-1 ring-border">
        <StatusBadge status={row.status} />
        <RestaurantReviewActions restaurantId={r.id} name={r.name} status={row.status} ownerId={row.ownerId} owners={owners.map((o) => ({ id: o.id, email: o.email, name: [o.firstName, o.lastName].filter(Boolean).join(" ") || o.email }))} size="default" />
        {row.rejectionReason && <p className="text-sm text-destructive">Último motivo de rechazo: {row.rejectionReason}</p>}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Panel title="Ficha tal como la verán los usuarios">
            <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded-xl bg-muted">{r.coverUrl && <Image src={r.coverUrl} alt="" fill sizes="60vw" className="object-cover" />}</div>
            <p className="text-sm font-medium text-primary">{r.cuisines.map((c) => c.name).join(" · ") || "Sin cocina asignada"}</p>
            <p className="mt-2 text-muted-foreground">{r.description ?? "Sin descripción."}</p>
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Dirección</dt>
                <dd>
                  {r.address}, {[r.postalCode, r.city].filter(Boolean).join(" ")}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Contacto</dt>
                <dd>
                  {r.phone ?? "—"} · {r.website ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Precio</dt>
                <dd>{r.priceRange ? `${PRICE_RANGE[r.priceRange].symbol} ${PRICE_RANGE[r.priceRange].label}` : "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Etiquetas</dt>
                <dd>{[...r.establishment, ...r.features, ...r.preferences].map((t) => t.name).join(", ") || "—"}</dd>
              </div>
            </dl>
          </Panel>
          <Panel title={`Cartas (${r.menus.length})`}>
            {r.menus.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin carta todavía. Se puede aprobar igualmente; la carta se añade después.</p>
            ) : (
              r.menus.map((m) => (
                <div key={m.id} className="mb-4 last:mb-0">
                  <p className="font-semibold">
                    {m.title} {m.price != null && <span className="text-sm font-normal text-muted-foreground">· {formatPrice(m.price)}</span>}
                  </p>
                  <ul className="mt-1 space-y-0.5 text-sm">
                    {m.categories.flatMap((c) => c.dishes).map((d) => (
                      <li key={d.id} className="flex justify-between gap-3">
                        <span>
                          {d.name} <span className="text-xs text-muted-foreground">{d.allergens.map((a) => a.name).join(", ")}</span>
                        </span>
                        <span className="tabular-nums">{formatPrice(d.price)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </Panel>
        </div>
        <Panel title="Ubicación declarada">
          <div className="h-64 overflow-hidden rounded-xl ring-1 ring-border">
            <RestaurantMap points={[{ id: r.id, slug: r.slug, name: r.name, latitude: r.latitude, longitude: r.longitude }]} interactive />
          </div>
          <p className="mt-2 text-xs text-muted-foreground tabular-nums">
            {r.latitude.toFixed(5)}, {r.longitude.toFixed(5)}. Comprueba que el marcador cae donde dice la dirección.
          </p>
        </Panel>
      </div>
    </>
  );
}
