import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, SearchX } from "lucide-react";
import { RestaurantMap } from "@/components/features/map/restaurant-map";
import { RestaurantCard } from "@/components/features/restaurant/restaurant-card";
import { ExploreFilters } from "@/components/features/search/explore-filters";
import { ExploreToolbar } from "@/components/features/search/explore-toolbar";
import { Button } from "@/components/ui/button";
import { plural } from "@/lib/format";
import { getCities, searchRestaurants, type RestaurantSearchParams } from "@/server/queries/restaurants";
import { getRestaurantTaxonomyGroups } from "@/server/queries/taxonomies";

type Search = Record<string, string | string[] | undefined>;
type Price = "CHEAP" | "MODERATE" | "EXPENSIVE" | "LUXURY";
const PRICES: Price[] = ["CHEAP", "MODERATE", "EXPENSIVE", "LUXURY"];

const arr = (v: string | string[] | undefined) => (v == null ? [] : Array.isArray(v) ? v : [v]);
const num = (v: string | string[] | undefined) => {
  const n = Number(Array.isArray(v) ? v[0] : v);
  return Number.isFinite(n) && (Array.isArray(v) ? v[0] : v) !== undefined ? n : undefined;
};
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

function parse(sp: Search): RestaurantSearchParams & { view: "list" | "map" } {
  const sort = str(sp.sort);
  return {
    query: str(sp.query),
    city: str(sp.city),
    cuisine: arr(sp.cuisine),
    feature: arr(sp.feature),
    price: arr(sp.price).filter((p): p is Price => PRICES.includes(p as Price)),
    lat: num(sp.lat),
    lng: num(sp.lng),
    radius: num(sp.radius) ?? 5,
    sort: sort === "rating" || sort === "distance" || sort === "recent" || sort === "name" ? sort : undefined,
    page: num(sp.page) ?? 1,
    limit: str(sp.view) === "map" ? 50 : 12,
    view: str(sp.view) === "map" ? "map" : "list",
  };
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<Search> }): Promise<Metadata> {
  const p = parse(await searchParams);
  const where = p.city ? ` en ${p.city}` : p.lat != null ? " cerca de ti" : "";
  const what = p.query ? `«${p.query}»` : p.cuisine?.length ? `Cocina ${p.cuisine.join(", ")}` : "Restaurantes";
  return { title: `${what}${where}`, description: `Explora restaurantes${where} con carta completa, alérgenos y reseñas.` };
}

export default async function ExplorePage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const p = parse(sp);
  const [result, cities, groups] = await Promise.all([searchRestaurants(p), getCities(), getRestaurantTaxonomyGroups()]);
  const hasGeo = p.lat != null && p.lng != null;
  const activeCount = (p.query ? 1 : 0) + (p.city ? 1 : 0) + (hasGeo ? 1 : 0) + (p.cuisine?.length ?? 0) + (p.feature?.length ?? 0) + (p.price?.length ?? 0);

  const cuisineName = p.cuisine?.length === 1 ? groups.cuisines.find((c) => c.slug === p.cuisine![0])?.name : undefined;
  const title = p.query ? `Resultados para «${p.query}»` : cuisineName ? `Cocina ${cuisineName.toLowerCase()}` : "Explorar restaurantes";
  const where = p.city ? ` en ${p.city}` : hasGeo ? ` a menos de ${p.radius} km` : "";

  const pageLink = (page: number) => {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) for (const val of arr(v)) if (k !== "page") next.append(k, val);
    if (page > 1) next.set("page", String(page));
    return `/explore${next.size ? `?${next}` : ""}`;
  };

  return (
    <div className="container-page py-8 lg:py-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-h1">
            {title}
            {where}
          </h1>
          <p className="mt-1 text-muted-foreground">{result.total === 0 ? "Ningún restaurante coincide" : plural(result.total, "restaurante", "restaurantes")}</p>
        </div>
        <ExploreToolbar hasGeo={hasGeo} />
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[15rem_1fr]">
        <ExploreFilters cities={cities} cuisines={groups.cuisines} features={groups.features} activeCount={activeCount} />

        <section aria-live="polite" aria-label="Resultados">
          {result.total === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed px-6 py-16 text-center">
              <SearchX className="size-10 text-muted-foreground" />
              <h2 className="mt-4 text-lg font-semibold">Nada por aquí</h2>
              <p className="mt-1 max-w-sm text-muted-foreground">Prueba con menos filtros, otra ciudad o un radio mayor. Los restaurantes pendientes de revisión no aparecen todavía.</p>
              <Button asChild variant="outline" className="mt-6">
                <Link href="/explore">Ver todos los restaurantes</Link>
              </Button>
            </div>
          ) : p.view === "map" ? (
            <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
              <div className="h-[60vh] min-h-[420px] overflow-hidden rounded-xl ring-1 ring-border">
                <RestaurantMap
                  points={result.items.map((r) => ({ ...r, cuisines: r.cuisines.map((c) => c.name).join(", ") }))}
                  origin={hasGeo ? { latitude: p.lat!, longitude: p.lng! } : null}
                />
              </div>
              <ol className="max-h-[60vh] space-y-1 overflow-y-auto pr-1">
                {result.items.map((r) => (
                  <li key={r.id}>
                    <RestaurantCard restaurant={r} variant="row" />
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <>
              <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {result.items.map((r, i) => (
                  <li key={r.id}>
                    <RestaurantCard restaurant={r} priority={i < 3} />
                  </li>
                ))}
              </ul>
              {result.pages > 1 && (
                <nav aria-label="Paginación" className="mt-8 flex items-center justify-center gap-3">
                  <Button asChild variant="outline" className={result.page <= 1 ? "pointer-events-none opacity-50" : ""}>
                    <Link href={pageLink(result.page - 1)} aria-disabled={result.page <= 1}>
                      <ChevronLeft data-icon="inline-start" /> Anterior
                    </Link>
                  </Button>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    Página {result.page} de {result.pages}
                  </span>
                  <Button asChild variant="outline" className={result.page >= result.pages ? "pointer-events-none opacity-50" : ""}>
                    <Link href={pageLink(result.page + 1)} aria-disabled={result.page >= result.pages}>
                      Siguiente <ChevronRight data-icon="inline-end" />
                    </Link>
                  </Button>
                </nav>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
