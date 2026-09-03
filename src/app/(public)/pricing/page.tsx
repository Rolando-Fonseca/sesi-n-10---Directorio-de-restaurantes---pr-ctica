import type { Metadata } from "next";
import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { Reveal } from "@/components/layout/reveal";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getActivePlans } from "@/server/queries/misc";
import { FREE_LIMITS } from "@/server/services/subscriptions";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Planes para restaurantes",
  description: "Publica tu restaurante gratis y amplía cuando lo necesites. Planes Básico, Pro y Premium con IVA incluido.",
};

const FEATURE_LABELS: Record<string, string> = {
  basicListing: "Ficha en el directorio",
  menuManagement: "Cartas con alérgenos",
  photos: "Fotos",
  reviews: "Reseñas y respuesta",
  analytics: "Estadísticas de visitas",
  featuredListing: "Posición destacada",
  prioritySupport: "Soporte prioritario",
};

export default async function PricingPage() {
  const plans = await getActivePlans();
  return (
    <div className="container-page py-10 lg:py-14">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold tracking-wide text-primary uppercase">Para restaurantes</p>
        <h1 className="mt-2 font-display text-h1 text-balance">Empieza gratis. Paga solo cuando necesites más.</h1>
        <p className="mt-4 text-lead text-muted-foreground">
          Con la cuenta gratuita publicas {FREE_LIMITS.maxRestaurants} restaurante y {FREE_LIMITS.maxMenus} carta de hasta {FREE_LIMITS.maxDishesPerMenu} platos. Los planes
          amplían restaurantes, cartas y visibilidad. Precios con IVA incluido.
        </p>
      </div>

      <ul className="mt-12 grid gap-6 lg:grid-cols-3">
        {plans.map((p, i) => {
          const highlight = p.slug === "pro";
          const dim = highlight ? "text-secondary-foreground/75" : "text-muted-foreground";
          return (
            <Reveal as="li" key={p.id} delay={80 * i} className={cn("flex flex-col rounded-2xl p-6 ring-1", highlight ? "bg-secondary text-secondary-foreground ring-secondary" : "bg-card ring-border")}>
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-2xl">{p.name}</h2>
                {highlight && <span className="rounded-full bg-brand px-2.5 py-0.5 text-xs font-semibold text-foreground">El más elegido</span>}
              </div>
              <p className={cn("mt-1 text-sm", dim)}>{p.description}</p>
              <p className="mt-6">
                <span className="font-display text-4xl">{formatPrice(p.priceMonthly)}</span>
                <span className={cn("text-sm", dim)}> /mes</span>
              </p>
              <p className={cn("text-xs", dim)}>o {formatPrice(p.priceAnnual)} al año (dos meses gratis)</p>

              <dl className={cn("mt-6 grid grid-cols-3 gap-2 rounded-lg p-3 text-center text-sm", highlight ? "bg-secondary-foreground/10" : "bg-muted")}>
                {(
                  [
                    [p.maxRestaurants, "restaurantes"],
                    [p.maxMenus, "cartas"],
                    [p.maxDishesPerMenu, "platos/carta"],
                  ] as const
                ).map(([n, l]) => (
                  <div key={l}>
                    <dt className="text-xs opacity-75">{l}</dt>
                    <dd className="font-semibold tabular-nums">{n}</dd>
                  </div>
                ))}
              </dl>

              <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                {Object.entries(FEATURE_LABELS).map(([key, label]) => {
                  const on = Boolean(p.features[key]);
                  return (
                    <li key={key} className={cn("flex items-center gap-2", !on && "opacity-50")}>
                      {on ? <Check className="size-4 text-brand" /> : <Minus className="size-4" />}
                      {label}
                    </li>
                  );
                })}
              </ul>

              <Button asChild size="lg" className={cn("mt-8 h-11", highlight && "bg-brand text-foreground hover:bg-brand/90")} variant={highlight ? "default" : "outline"}>
                <Link href={`/dashboard/owner/subscription?plan=${p.slug}`}>Elegir {p.name}</Link>
              </Button>
            </Reveal>
          );
        })}
      </ul>

      <p className="mt-8 text-sm text-muted-foreground">
        Este es un proyecto académico: la activación del plan es simulada y no se realiza ningún cobro. Se genera la suscripción y una factura de ejemplo con el IVA
        desglosado.
      </p>
    </div>
  );
}
