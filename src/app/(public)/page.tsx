import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Reveal } from "@/components/layout/reveal";
import { RestaurantCard } from "@/components/features/restaurant/restaurant-card";
import { SearchForm } from "@/components/features/search/search-form";
import { Button } from "@/components/ui/button";
import { plural } from "@/lib/format";
import { getCities, getFeaturedRestaurants, searchRestaurants } from "@/server/queries/restaurants";
import { getCuisinesWithCounts } from "@/server/queries/taxonomies";

export const revalidate = 300;

const STEPS = [
  {
    n: "01",
    title: "Busca por plato, no solo por nombre",
    text: "Escribe «paella» o «ramen» y aparecen los sitios que lo tienen en carta, con el precio a la vista.",
  },
  {
    n: "02",
    title: "Filtra por tus alérgenos",
    text: "Guarda en tu perfil lo que no puedes comer y cada carta te marca qué platos evitar. Catorce alérgenos, los del reglamento europeo.",
  },
  {
    n: "03",
    title: "Lee reseñas con cuatro notas",
    text: "Ambiente, servicio, comida y precio por separado. Un sitio ruidoso con buena cocina se ve a la primera.",
  },
];

export default async function HomePage() {
  const [featured, cities, cuisines, total] = await Promise.all([
    getFeaturedRestaurants(5),
    getCities(),
    getCuisinesWithCounts(),
    searchRestaurants({ limit: 1 }).then((r) => r.total),
  ]);
  const [hero, ...rest] = featured;
  const activeCuisines = cuisines.filter((c) => c.count > 0);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-brand-tint">
        <div className="container-page grid items-center gap-10 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div className="max-w-xl">
            <p className="animate-fade-up text-sm font-semibold tracking-wide text-primary uppercase">Directorio de restaurantes</p>
            <h1 className="animate-fade-up font-display text-display text-balance [animation-delay:60ms]">
              Dónde comer hoy, <em className="text-primary not-italic">sin dar vueltas.</em>
            </h1>
            <p className="animate-fade-up mt-5 text-lead text-muted-foreground [animation-delay:120ms]">
              {plural(total, "restaurante", "restaurantes")} en {cities.length} ciudades con la carta completa, los alérgenos declarados y reseñas de gente
              que pagó la cuenta.
            </p>
            <div className="animate-fade-up mt-8 [animation-delay:180ms]">
              <SearchForm cities={cities} />
            </div>
            <ul className="animate-fade-up mt-6 flex flex-wrap gap-2 [animation-delay:240ms]" aria-label="Ciudades">
              {cities.map((c) => (
                <li key={c.city}>
                  <Link
                    href={`/explore?city=${encodeURIComponent(c.city)}`}
                    data-pressable
                    className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1.5 text-sm font-medium ring-1 ring-border transition-[box-shadow] duration-(--duration-fast) hover:ring-primary"
                  >
                    <MapPin className="size-3.5 text-primary" />
                    {c.city} <span className="text-muted-foreground">{c.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Collage asimétrico con tres fotos */}
          <div className="animate-fade-in relative hidden aspect-[5/4] lg:block [animation-delay:200ms]" aria-hidden="true">
            <div className="absolute top-0 right-0 h-[62%] w-[70%] overflow-hidden rounded-3xl shadow-xl shadow-foreground/10">
              <Image src="/images/restaurants/marina-blava.jpg" alt="" fill priority sizes="40vw" className="object-cover" />
            </div>
            <div className="absolute bottom-0 left-0 h-[52%] w-[58%] overflow-hidden rounded-3xl shadow-xl shadow-foreground/10 ring-8 ring-brand-tint">
              <Image src="/images/dishes/paella-valenciana.jpg" alt="" fill sizes="30vw" className="object-cover" />
            </div>
            <div className="absolute top-[58%] right-[6%] h-[30%] w-[30%] overflow-hidden rounded-2xl shadow-lg shadow-foreground/10 ring-8 ring-brand-tint">
              <Image src="/images/dishes/nigiri-toro.jpg" alt="" fill sizes="20vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* DESTACADOS: uno grande + lista numerada */}
      {hero && (
        <section className="container-page py-16 lg:py-20" aria-labelledby="destacados">
          <Reveal className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 id="destacados" className="font-display text-h2">
                Los mejor valorados esta semana
              </h2>
              <p className="mt-1 text-muted-foreground">Ordenados por la media de sus reseñas. Nadie paga por estar aquí.</p>
            </div>
            <Button asChild variant="link" className="hidden sm:inline-flex">
              <Link href="/explore?sort=rating">
                Ver todos <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </Reveal>
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <Reveal>
              <RestaurantCard restaurant={hero} variant="feature" priority />
            </Reveal>
            <ol className="flex flex-col divide-y">
              {rest.map((r, i) => (
                <Reveal as="li" key={r.id} delay={60 * (i + 1)} className="flex items-center gap-3 py-1">
                  <span className="w-6 shrink-0 font-display text-2xl text-muted-foreground/60 tabular-nums">{i + 2}</span>
                  <RestaurantCard restaurant={r} variant="row" className="flex-1" />
                </Reveal>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* COCINAS */}
      {activeCuisines.length > 0 && (
        <section className="border-y bg-cream py-12" aria-labelledby="cocinas">
          <div className="container-page">
            <Reveal className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="cocinas" className="font-display text-h3">
                ¿De qué tienes ganas?
              </h2>
              <Link href="/categories" className="text-sm font-medium text-primary hover:underline">
                Todas las cocinas
              </Link>
            </Reveal>
            <ul className="mt-5 flex flex-wrap gap-2">
              {activeCuisines.map((c, i) => (
                <Reveal as="li" key={c.id} delay={30 * i}>
                  <Link
                    href={`/explore?cuisine=${c.slug}`}
                    data-pressable
                    className="inline-flex items-center gap-2 rounded-full bg-background px-4 py-2 text-sm font-medium ring-1 ring-border transition-[box-shadow,color] duration-(--duration-fast) hover:text-primary hover:ring-primary"
                  >
                    {c.name}
                    <span className="text-xs text-muted-foreground">{c.count}</span>
                  </Link>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* CÓMO FUNCIONA: banda editorial numerada, no rejilla de iconos */}
      <section className="container-page py-16 lg:py-24" aria-labelledby="como">
        <Reveal>
          <h2 id="como" className="max-w-lg font-display text-h2 text-balance">
            Tres cosas que aquí se hacen distinto
          </h2>
        </Reveal>
        <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-6">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.n} delay={80 * i} className="relative border-t-2 border-foreground pt-5">
              <span className="font-display text-3xl text-primary">{s.n}</span>
              <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">{s.text}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* PARA RESTAURANTES */}
      <section className="bg-secondary text-secondary-foreground" aria-labelledby="owners">
        <div className="container-page grid items-center gap-8 py-16 lg:grid-cols-[1fr_auto] lg:py-20">
          <Reveal>
            <p className="text-sm font-semibold tracking-wide text-brand uppercase">Para restaurantes</p>
            <h2 id="owners" className="mt-2 max-w-xl font-display text-h2 text-balance">
              Publica tu carta con alérgenos y deja que te encuentren por lo que cocinas.
            </h2>
            <p className="mt-4 max-w-xl text-secondary-foreground/75">
              Alta gratuita con un restaurante y una carta. Un administrador revisa la ficha antes de publicarla, así el directorio no se llena de humo.
            </p>
          </Reveal>
          <Reveal delay={120} className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Button asChild size="lg" className="h-12 bg-brand px-6 text-base text-foreground hover:bg-brand/90">
              <Link href="/sign-up?role=owner">Publicar mi restaurante</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 border-secondary-foreground/30 bg-transparent px-6 text-base text-secondary-foreground hover:bg-secondary-foreground/10 hover:text-secondary-foreground"
            >
              <Link href="/pricing">Ver planes</Link>
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  );
}
