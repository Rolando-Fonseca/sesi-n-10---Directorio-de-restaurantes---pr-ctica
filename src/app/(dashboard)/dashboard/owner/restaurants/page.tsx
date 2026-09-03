import Image from "next/image";
import Link from "next/link";
import { Store } from "lucide-react";
import { EmptyState, PageHeader, StatusBadge } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/session";
import { getRestaurantsByOwner } from "@/server/queries/restaurants";

export const metadata = { title: "Restaurantes" };

export default async function OwnerRestaurantsPage() {
  const user = await requireUser();
  const restaurants = await getRestaurantsByOwner(user.id);
  return (
    <>
      <PageHeader
        title="Restaurantes"
        description="Cada ficha pasa por revisión antes de publicarse."
        action={
          <Button asChild>
            <Link href="/dashboard/owner/restaurants/new">Nuevo restaurante</Link>
          </Button>
        }
      />
      {restaurants.length === 0 ? (
        <EmptyState icon={Store} title="Sin restaurantes" text="Da de alta el primero." action={{ href: "/dashboard/owner/restaurants/new", label: "Dar de alta" }} />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {restaurants.map((r) => (
            <li key={r.id} className="overflow-hidden rounded-2xl bg-background ring-1 ring-border">
              <Link href={`/dashboard/owner/restaurants/${r.id}`} className="block">
                <div className="relative aspect-[16/9] bg-muted">{r.coverUrl && <Image src={r.coverUrl} alt="" fill sizes="33vw" className="object-cover" />}</div>
              </Link>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/dashboard/owner/restaurants/${r.id}`} className="font-semibold hover:underline">
                    {r.name}
                  </Link>
                  <StatusBadge status={r.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {r.city ?? "Sin ciudad"} · {r._count.menus} {r._count.menus === 1 ? "carta" : "cartas"} · {r._count.reviews} {r._count.reviews === 1 ? "reseña" : "reseñas"}
                </p>
                {r.status === "REJECTED" && r.rejectionReason && <p className="mt-2 text-xs text-destructive">Motivo: {r.rejectionReason}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
