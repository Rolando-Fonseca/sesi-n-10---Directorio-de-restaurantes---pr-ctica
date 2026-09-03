import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/layout/reveal";
import { plural } from "@/lib/format";
import { prisma } from "@/lib/db";
import { getCuisinesWithCounts } from "@/server/queries/taxonomies";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Cocinas",
  description: "Explora restaurantes por tipo de cocina: española, japonesa, mexicana, mediterránea y más.",
};

export default async function CategoriesPage() {
  const cuisines = await getCuisinesWithCounts();
  // Una portada representativa por cocina: la del restaurante mejor valorado que la tenga
  const covers = await prisma.restaurant.findMany({
    where: { status: "APPROVED", isActive: true, coverUrl: { not: null } },
    select: { coverUrl: true, taxonomies: { select: { taxonomyId: true } } },
    orderBy: { averageRating: "desc" },
  });
  const coverFor = (id: string) => covers.find((c) => c.taxonomies.some((t) => t.taxonomyId === id))?.coverUrl ?? null;
  const active = cuisines.filter((c) => c.count > 0);
  const empty = cuisines.filter((c) => c.count === 0);

  return (
    <div className="container-page py-10 lg:py-14">
      <h1 className="font-display text-h1">Cocinas</h1>
      <p className="mt-2 max-w-xl text-lead text-muted-foreground">Cada cocina lleva el número de restaurantes publicados. Las que aún no tienen ninguno esperan a su primer dueño.</p>

      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {active.map((c, i) => {
          const cover = coverFor(c.id);
          return (
            <Reveal as="li" key={c.id} delay={40 * i}>
              <Link href={`/explore?cuisine=${c.slug}`} data-pressable className="card-zoom group relative block aspect-[5/3] overflow-hidden rounded-2xl bg-secondary text-secondary-foreground">
                {cover && <Image src={cover} alt="" fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw" className="object-cover opacity-80" />}
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
                  <div>
                    <h2 className="font-display text-2xl">{c.name}</h2>
                    <p className="text-sm text-secondary-foreground/75">{plural(c.count, "restaurante", "restaurantes")}</p>
                  </div>
                  <ArrowRight className="size-5 opacity-0 transition-[opacity,transform] duration-(--duration-ui) group-hover:translate-x-0.5 group-hover:opacity-100" />
                </div>
              </Link>
            </Reveal>
          );
        })}
      </ul>

      {empty.length > 0 && (
        <section className="mt-14" aria-labelledby="sin">
          <h2 id="sin" className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Todavía sin restaurantes
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {empty.map((c) => (
              <li key={c.id} className="rounded-full border border-dashed px-3 py-1 text-sm text-muted-foreground">
                {c.name}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            ¿Tienes un restaurante de alguna de estas cocinas?{" "}
            <Link href="/sign-up?role=owner" className="font-medium text-primary hover:underline">
              Publícalo gratis.
            </Link>
          </p>
        </section>
      )}
    </div>
  );
}
