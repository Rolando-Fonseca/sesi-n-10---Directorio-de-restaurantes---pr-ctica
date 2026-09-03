"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { AlertTriangle, Star } from "lucide-react";
import { WishlistButton } from "@/components/features/wishlist/wishlist-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DishDto, MenuDto, TaxonomyRef } from "@/server/queries/dto";

type Props = {
  menus: MenuDto[];
  allergens: TaxonomyRef[];
  userAllergenIds: string[];
  wishlistDishIds: string[];
  signedIn: boolean;
};

/**
 * Carta por categorías con filtro de alérgenos. Los alérgenos del perfil del
 * usuario vienen preseleccionados; los platos afectados no desaparecen, se
 * atenúan y se marcan, para que la persona decida.
 */
export function MenuSection({ menus, allergens, userAllergenIds, wishlistDishIds, signedIn }: Props) {
  const [hidden, setHidden] = useState<Set<string>>(() => new Set(userAllergenIds));
  const [menuId, setMenuId] = useState(menus[0]?.id);
  const menu = menus.find((m) => m.id === menuId) ?? menus[0];
  const saved = useMemo(() => new Set(wishlistDishIds), [wishlistDishIds]);

  if (!menu) return <p className="text-muted-foreground">Este restaurante todavía no ha publicado su carta.</p>;

  const toggle = (id: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const conflicts = (d: DishDto) => d.allergens.filter((a) => hidden.has(a.id));
  const usedAllergenIds = new Set(menu.categories.flatMap((c) => c.dishes.flatMap((d) => d.allergens.map((a) => a.id))));
  const relevantAllergens = allergens.filter((a) => usedAllergenIds.has(a.id) || userAllergenIds.includes(a.id));

  return (
    <div className="space-y-6">
      {menus.length > 1 && (
        <div role="group" aria-label="Cartas" className="flex flex-wrap gap-2">
          {menus.map((m) => (
            <button
              key={m.id}
              type="button"
              aria-pressed={m.id === menu.id}
              onClick={() => setMenuId(m.id)}
              className={cn("rounded-full border px-3 py-1.5 text-sm font-medium", m.id === menu.id ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground/40")}
            >
              {m.title}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <h3 className="font-display text-2xl">{menu.title}</h3>
          {menu.price != null && <span className="text-sm font-semibold text-primary">Menú completo {formatPrice(menu.price)}</span>}
        </div>
        {menu.description && <p className="text-muted-foreground">{menu.description}</p>}
      </div>

      {relevantAllergens.length > 0 && (
        <fieldset className="rounded-xl bg-muted/70 p-4">
          <legend className="sr-only">Alérgenos a evitar</legend>
          <p className="text-sm font-medium">
            Marcar platos que contienen
            {userAllergenIds.length > 0 && <span className="ml-1 font-normal text-muted-foreground">(según tu perfil)</span>}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {relevantAllergens.map((a) => (
              <button
                key={a.id}
                type="button"
                aria-pressed={hidden.has(a.id)}
                onClick={() => toggle(a.id)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors duration-(--duration-fast)",
                  hidden.has(a.id) ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-border bg-background text-muted-foreground hover:text-foreground",
                )}
              >
                {a.name}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <Tabs defaultValue={menu.categories[0]?.id} key={menu.id}>
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
          {menu.categories.map((c) => (
            <TabsTrigger key={c.id} value={c.id} className="rounded-full border data-[state=active]:border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background">
              {c.name} <span className="ml-1 text-xs opacity-70">{c.dishes.length}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        {menu.categories.map((c) => (
          <TabsContent key={c.id} value={c.id} className="mt-4">
            <ul className="divide-y">
              {c.dishes.map((d) => {
                const bad = conflicts(d);
                return (
                  <li key={d.id} className={cn("flex gap-4 py-4", bad.length > 0 && "opacity-60")}>
                    {d.imageUrl && (
                      <div className="relative hidden h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-muted sm:block">
                        <Image src={d.imageUrl} alt={d.name} fill sizes="96px" className="object-cover" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-semibold">
                          {d.name}
                          {d.isFeatured && <Star className="ml-1.5 inline size-3.5 fill-accent text-accent" aria-label="Plato destacado" />}
                        </h4>
                        <span className="shrink-0 font-semibold tabular-nums">{formatPrice(d.price)}</span>
                      </div>
                      {d.description && <p className="mt-0.5 text-sm text-muted-foreground">{d.description}</p>}
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {d.presentation && <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">{d.presentation.name}</span>}
                        {d.allergens.map((a) => (
                          <span
                            key={a.id}
                            className={cn("rounded px-1.5 py-0.5 text-[11px] font-medium", hidden.has(a.id) ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground")}
                          >
                            {a.name}
                          </span>
                        ))}
                        {d.allergens.length === 0 && <span className="text-[11px] text-muted-foreground">Sin alérgenos declarados</span>}
                      </div>
                      {bad.length > 0 && (
                        <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-destructive">
                          <AlertTriangle className="size-3.5" /> Contiene {bad.map((a) => a.name.toLowerCase()).join(", ")}
                        </p>
                      )}
                    </div>
                    <WishlistButton dishId={d.id} dishName={d.name} initialSaved={saved.has(d.id)} signedIn={signedIn} className="shrink-0 self-start" />
                  </li>
                );
              })}
            </ul>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
