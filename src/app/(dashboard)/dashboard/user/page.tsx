import Link from "next/link";
import { Heart, MessageSquare, Sparkles } from "lucide-react";
import { RestaurantCard } from "@/components/features/restaurant/restaurant-card";
import { ReviewList } from "@/components/features/review/review-list";
import { PageHeader, Panel, StatCard } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/session";
import { getFeaturedRestaurants } from "@/server/queries/restaurants";
import { getReviewsByUser } from "@/server/queries/reviews";
import { getUserProfile } from "@/server/queries/users";
import { getWishlistGrouped } from "@/server/queries/wishlist";

export const metadata = { title: "Mi Foodzinder" };

export default async function UserDashboardPage() {
  const session = await requireUser();
  const [profile, reviews, wishlist, suggestions] = await Promise.all([getUserProfile(session.id), getReviewsByUser(session.id), getWishlistGrouped(session.id), getFeaturedRestaurants(3)]);
  const savedDishes = wishlist.reduce((s, g) => s + g.items.length, 0);
  const firstName = profile?.firstName ?? "Hola";

  return (
    <>
      <PageHeader title={`Hola, ${firstName}`} description="Tu actividad en Foodzinder de un vistazo." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Puntos" value={profile?.points ?? 0} hint={`Nivel ${profile?.level ?? 1}`} icon={Sparkles} tone="primary" />
        <StatCard label="Platos guardados" value={savedDishes} hint={`en ${wishlist.length} ${wishlist.length === 1 ? "restaurante" : "restaurantes"}`} icon={Heart} />
        <StatCard label="Reseñas escritas" value={reviews.length} icon={MessageSquare} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel
          title="Tus últimas reseñas"
          action={
            <Button asChild variant="link" size="sm">
              <Link href="/dashboard/user/reviews">Ver todas</Link>
            </Button>
          }
        >
          <ReviewList reviews={reviews.slice(0, 3)} showRestaurant />
        </Panel>
        <Panel
          title="Platos guardados"
          action={
            <Button asChild variant="link" size="sm">
              <Link href="/dashboard/user/wishlist">Ver lista</Link>
            </Button>
          }
        >
          {wishlist.length === 0 ? (
            <p className="text-sm text-muted-foreground">Pulsa el corazón en cualquier plato de una carta y aparecerá aquí, agrupado por restaurante con el total.</p>
          ) : (
            <ul className="divide-y">
              {wishlist.slice(0, 4).map((g) => (
                <li key={g.restaurant.id} className="flex items-center justify-between py-2 text-sm">
                  <Link href={`/restaurant/${g.restaurant.slug}`} className="font-medium hover:underline">
                    {g.restaurant.name}
                  </Link>
                  <span className="text-muted-foreground">
                    {g.items.length} {g.items.length === 1 ? "plato" : "platos"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <section className="mt-8" aria-labelledby="sug">
        <h2 id="sug" className="mb-4 text-lg font-semibold">
          Para tu próxima salida
        </h2>
        <ul className="grid gap-5 sm:grid-cols-3">
          {suggestions.map((r) => (
            <li key={r.id}>
              <RestaurantCard restaurant={r} />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
