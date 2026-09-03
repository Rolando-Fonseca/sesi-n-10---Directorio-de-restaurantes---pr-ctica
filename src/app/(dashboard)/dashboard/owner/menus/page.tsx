import Link from "next/link";
import { ChefHat } from "lucide-react";
import { EmptyState, PageHeader, Panel } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { requireUser } from "@/lib/session";
import { getMenusByOwner } from "@/server/queries/menus";
import { getRestaurantsByOwner } from "@/server/queries/restaurants";

export const metadata = { title: "Cartas y platos" };

export default async function OwnerMenusPage() {
  const user = await requireUser();
  const [menus, restaurants] = await Promise.all([getMenusByOwner(user.id), getRestaurantsByOwner(user.id)]);
  return (
    <>
      <PageHeader
        title="Cartas y platos"
        description="Una carta puede servirse en varios de tus restaurantes."
        action={
          <Button asChild disabled={restaurants.length === 0}>
            <Link href="/dashboard/owner/menus/new">Nueva carta</Link>
          </Button>
        }
      />
      {restaurants.length === 0 ? (
        <EmptyState icon={ChefHat} title="Primero necesitas un restaurante" text="Las cartas se asignan a restaurantes. Da de alta el tuyo y vuelve aquí." action={{ href: "/dashboard/owner/restaurants/new", label: "Dar de alta un restaurante" }} />
      ) : menus.length === 0 ? (
        <EmptyState icon={ChefHat} title="Sin cartas" text="Crea la primera y añade platos con precio y alérgenos." action={{ href: "/dashboard/owner/menus/new", label: "Crear carta" }} />
      ) : (
        <Panel>
          <ul className="divide-y">
            {menus.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <Link href={`/dashboard/owner/menus/${m.id}`} className="font-semibold hover:underline">
                    {m.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {m._count.dishes} {m._count.dishes === 1 ? "plato" : "platos"}
                    {m.price != null && ` · menú ${formatPrice(Number(m.price))}`}
                    {" · "}
                    {m.restaurants.map((r) => r.restaurant.name).join(", ") || "sin restaurante"}
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/dashboard/owner/menus/${m.id}`}>Editar</Link>
                </Button>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </>
  );
}
