import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ExternalLink, MapPin, Phone } from "lucide-react";
import { RestaurantMap } from "@/components/features/map/restaurant-map";
import { MenuSection } from "@/components/features/menu/menu-section";
import { RatingStars } from "@/components/features/restaurant/rating-stars";
import { RatingBreakdown } from "@/components/features/review/rating-breakdown";
import { ReviewForm } from "@/components/features/review/review-form";
import { ReviewList } from "@/components/features/review/review-list";
import { env } from "@/lib/env";
import { PRICE_RANGE } from "@/lib/format";
import { getRestaurantBySlug } from "@/server/queries/restaurants";
import { getReviewsByRestaurant, getUserReviewFor } from "@/server/queries/reviews";
import { getTaxonomies } from "@/server/queries/taxonomies";
import { getUserAllergenIds } from "@/server/queries/users";
import { getWishlistDishIds } from "@/server/queries/wishlist";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const r = await getRestaurantBySlug(slug);
  if (!r) return { title: "Restaurante no encontrado" };
  const cuisines = r.cuisines.map((c) => c.name).join(", ");
  return {
    title: `${r.name}${r.city ? `, ${r.city}` : ""}`,
    description: r.description?.slice(0, 155) ?? `${r.name}: ${cuisines}. Carta con alérgenos, mapa y reseñas.`,
    alternates: { canonical: `/restaurant/${r.slug}` },
    openGraph: { title: r.name, description: cuisines, images: r.coverUrl ? [{ url: r.coverUrl, width: 1600, height: 900, alt: r.name }] : [] },
  };
}

export default async function RestaurantPage({ params }: Params) {
  const { slug } = await params;
  const { userId } = await auth();
  const r = await getRestaurantBySlug(slug);
  if (!r) notFound();

  const [reviews, allergens, userAllergens, wishlist, myReview] = await Promise.all([
    getReviewsByRestaurant(r.id, 1, 20),
    getTaxonomies("MENU_ALLERGEN"),
    getUserAllergenIds(userId),
    userId ? getWishlistDishIds(userId) : Promise.resolve(new Set<string>()),
    userId ? getUserReviewFor(userId, r.id) : Promise.resolve(null),
  ]);
  const signedIn = Boolean(userId);
  const isOwner = userId === r.owner.id;
  const price = r.priceRange ? PRICE_RANGE[r.priceRange] : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: r.name,
    url: `${env.appUrl()}/restaurant/${r.slug}`,
    image: r.coverUrl ? `${env.appUrl()}${r.coverUrl}` : undefined,
    description: r.description ?? undefined,
    servesCuisine: r.cuisines.map((c) => c.name),
    priceRange: price?.symbol,
    telephone: r.phone ?? undefined,
    address: { "@type": "PostalAddress", streetAddress: r.address, addressLocality: r.city ?? undefined, postalCode: r.postalCode ?? undefined, addressCountry: "ES" },
    geo: { "@type": "GeoCoordinates", latitude: r.latitude, longitude: r.longitude },
    ...(r.reviewCount > 0 ? { aggregateRating: { "@type": "AggregateRating", ratingValue: r.averageRating, reviewCount: r.reviewCount, bestRating: 5, worstRating: 1 } } : {}),
    hasMenu: r.menus.map((m) => ({
      "@type": "Menu",
      name: m.title,
      hasMenuSection: m.categories.map((c) => ({
        "@type": "MenuSection",
        name: c.name,
        hasMenuItem: c.dishes.map((d) => ({ "@type": "MenuItem", name: d.name, description: d.description ?? undefined, offers: { "@type": "Offer", price: d.price, priceCurrency: "EUR" } })),
      })),
    })),
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Cabecera: foto grande + tarjeta de datos */}
      <header className="container-page pt-6 lg:pt-10">
        <nav aria-label="Migas" className="text-sm text-muted-foreground">
          <Link href="/explore" className="hover:text-foreground">
            Explorar
          </Link>
          {r.city && (
            <>
              <span aria-hidden="true"> / </span>
              <Link href={`/explore?city=${encodeURIComponent(r.city)}`} className="hover:text-foreground">
                {r.city}
              </Link>
            </>
          )}
        </nav>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="animate-fade-in relative aspect-[16/10] overflow-hidden rounded-3xl bg-muted lg:aspect-[16/9]">
            {r.coverUrl && <Image src={r.coverUrl} alt={`Interior de ${r.name}`} fill priority sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />}
          </div>
          <div className="animate-fade-up flex flex-col rounded-3xl bg-cream p-6 ring-1 ring-border lg:p-8">
            <p className="text-sm font-medium text-primary">{r.cuisines.map((c) => c.name).join(" · ")}</p>
            <h1 className="mt-1 font-display text-h1">{r.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
              <RatingStars value={r.averageRating} count={r.reviewCount} size="md" />
              {price && (
                <span className="text-sm text-muted-foreground" title={price.hint}>
                  <span className="font-semibold text-foreground">{price.symbol}</span> {price.label}
                </span>
              )}
            </div>
            {r.description && <p className="mt-4 leading-relaxed text-muted-foreground">{r.description}</p>}
            <dl className="mt-5 space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="sr-only">Dirección</dt>
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <dd>
                  {r.address}
                  {r.postalCode || r.city ? `, ${[r.postalCode, r.city].filter(Boolean).join(" ")}` : ""}
                </dd>
              </div>
              {r.phone && (
                <div className="flex gap-2">
                  <dt className="sr-only">Teléfono</dt>
                  <Phone className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  <dd>
                    <a href={`tel:${r.phone.replace(/\s/g, "")}`} className="hover:underline">
                      {r.phone}
                    </a>
                  </dd>
                </div>
              )}
              {r.website && (
                <div className="flex gap-2">
                  <dt className="sr-only">Web</dt>
                  <ExternalLink className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  <dd>
                    <a href={r.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {r.website.replace(/^https?:\/\//, "")}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
            {(r.features.length > 0 || r.establishment.length > 0 || r.preferences.length > 0) && (
              <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Características">
                {[...r.establishment, ...r.features, ...r.preferences].map((t) => (
                  <li key={t.id} className="rounded-full bg-background px-2.5 py-1 text-xs font-medium ring-1 ring-border">
                    {t.name}
                  </li>
                ))}
              </ul>
            )}
            <nav aria-label="Secciones" className="mt-auto flex gap-4 border-t pt-4 text-sm font-medium">
              <a href="#carta" className="hover:text-primary">
                Carta
              </a>
              <a href="#resenas" className="hover:text-primary">
                Reseñas
              </a>
              <a href="#ubicacion" className="hover:text-primary">
                Cómo llegar
              </a>
            </nav>
          </div>
        </div>
      </header>

      <div className="container-page mt-12 grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-16">
        <div className="space-y-16">
          <section id="carta" aria-labelledby="carta-h" className="scroll-mt-24">
            <h2 id="carta-h" className="font-display text-h2">
              Carta
            </h2>
            <div className="mt-6">
              <MenuSection menus={r.menus} allergens={allergens} userAllergenIds={[...userAllergens]} wishlistDishIds={[...wishlist]} signedIn={signedIn} />
            </div>
          </section>

          <section id="resenas" aria-labelledby="resenas-h" className="scroll-mt-24">
            <h2 id="resenas-h" className="font-display text-h2">
              Reseñas
            </h2>
            <div className="mt-6 rounded-2xl p-5 ring-1 ring-border">
              <RatingBreakdown average={r.averageRating} count={r.reviewCount} breakdown={r.ratingBreakdown} />
            </div>
            <div className="mt-6">
              <ReviewForm restaurantId={r.id} signedIn={signedIn} isOwner={isOwner} existing={myReview ? { ratings: myReview.ratings, comment: myReview.comment } : null} />
            </div>
            <div className="mt-8">
              <ReviewList reviews={reviews.items} />
            </div>
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section id="ubicacion" aria-labelledby="ubicacion-h" className="scroll-mt-24">
            <h2 id="ubicacion-h" className="text-lg font-semibold">
              Cómo llegar
            </h2>
            <div className="mt-3 h-64 overflow-hidden rounded-xl ring-1 ring-border">
              <RestaurantMap points={[{ id: r.id, slug: r.slug, name: r.name, latitude: r.latitude, longitude: r.longitude }]} interactive={false} />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {r.address}
              {r.city ? `, ${r.city}` : ""}
            </p>
            <a
              href={`https://www.openstreetmap.org/directions?to=${r.latitude}%2C${r.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Abrir indicaciones <ExternalLink className="size-3.5" />
            </a>
          </section>
          <section className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
            <p>
              Los alérgenos los declara el restaurante. Si tienes una alergia grave, confírmalo con ellos antes de pedir.
            </p>
          </section>
        </aside>
      </div>
    </article>
  );
}
