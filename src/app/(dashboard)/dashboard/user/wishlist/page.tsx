import Image from "next/image";
import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import { ActionButton } from "@/components/dashboard/action-button";
import { EmptyState, PageHeader, Panel } from "@/components/dashboard/ui";
import { formatPrice } from "@/lib/format";
import { requireUser } from "@/lib/session";
import { clearWishlistForRestaurantAction, removeFromWishlistAction } from "@/server/actions/wishlist";
import { getWishlistGrouped } from "@/server/queries/wishlist";

export const metadata = { title: "Platos guardados" };

export default async function WishlistPage() {
  const user = await requireUser();
  const groups = await getWishlistGrouped(user.id);
  const total = groups.reduce((s, g) => s + g.total, 0);

  return (
    <>
      <PageHeader title="Platos guardados" description={groups.length ? `Total estimado de todo lo guardado: ${formatPrice(total)}` : "Tu lista de deseos, agrupada por restaurante."} />
      {groups.length === 0 ? (
        <EmptyState icon={Heart} title="Nada guardado todavía" text="Pulsa el corazón en cualquier plato de una carta. Aquí se agrupan por restaurante con el precio total, como un carrito de deseos." action={{ href: "/explore", label: "Explorar restaurantes" }} />
      ) : (
        <div className="space-y-5">
          {groups.map((g) => (
            <Panel
              key={g.restaurant.id}
              title={g.restaurant.name}
              description={`${g.items.length} ${g.items.length === 1 ? "plato" : "platos"} · ${formatPrice(g.total)}`}
              action={
                <div className="flex gap-2">
                  <Link href={`/restaurant/${g.restaurant.slug}`} className="text-sm font-medium text-primary hover:underline">
                    Ver carta
                  </Link>
                  <ActionButton
                    action={clearWishlistForRestaurantAction}
                    payload={{ restaurantId: g.restaurant.id }}
                    variant="ghost"
                    size="sm"
                    successMessage="Lista vaciada"
                    confirm={{ title: `¿Vaciar los platos de ${g.restaurant.name}?`, confirmLabel: "Vaciar" }}
                  >
                    Vaciar
                  </ActionButton>
                </div>
              }
            >
              <ul className="divide-y">
                {g.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-4 py-3">
                    <div className="relative hidden h-14 w-20 shrink-0 overflow-hidden rounded-md bg-muted sm:block">
                      {item.dish.imageUrl && <Image src={item.dish.imageUrl} alt="" fill sizes="80px" className="object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{item.dish.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity > 1 ? `${item.quantity} × ${formatPrice(item.dish.price)}` : formatPrice(item.dish.price)}
                        {item.dish.allergens.length > 0 && ` · ${item.dish.allergens.map((a) => a.name).join(", ")}`}
                      </p>
                    </div>
                    <span className="font-semibold tabular-nums">{formatPrice(item.subtotal)}</span>
                    <ActionButton action={removeFromWishlistAction} payload={{ dishId: item.dish.id }} variant="ghost" size="icon-sm" aria-label={`Quitar ${item.dish.name}`} successMessage="Plato quitado">
                      <Trash2 className="size-4" />
                    </ActionButton>
                  </li>
                ))}
              </ul>
            </Panel>
          ))}
        </div>
      )}
    </>
  );
}
