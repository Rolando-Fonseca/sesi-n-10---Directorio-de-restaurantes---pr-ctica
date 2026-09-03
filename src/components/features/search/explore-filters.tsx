"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { LocateFixed, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { PRICE_RANGE } from "@/lib/format";
import { cn } from "@/lib/utils";

type Tax = { id: string; slug: string; name: string };
type Props = { cities: { city: string; count: number }[]; cuisines: Tax[]; features: Tax[]; activeCount: number };

const RADII = [2, 5, 10, 25];

/**
 * Filtros de /explore. El estado vive en la URL: cada cambio hace router.replace
 * y el Server Component vuelve a consultar. Así los resultados son enlazables.
 */
export function ExploreFilters(props: Props) {
  return (
    <>
      <aside className="hidden lg:block" aria-label="Filtros">
        <FilterForm {...props} />
      </aside>
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="lg" className="h-10">
              <SlidersHorizontal data-icon="inline-start" />
              Filtros{props.activeCount > 0 && <span className="ml-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">{props.activeCount}</span>}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[min(90vw,22rem)] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
              <SheetDescription>Los resultados se actualizan al cambiar cualquier filtro.</SheetDescription>
            </SheetHeader>
            <div className="px-4 pb-8">
              <FilterForm {...props} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

function FilterForm({ cities, cuisines, features }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const [query, setQuery] = useState(params.get("query") ?? "");
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const update = useCallback(
    (mutate: (p: URLSearchParams) => void) => {
      const next = new URLSearchParams(params.toString());
      mutate(next);
      next.delete("page");
      startTransition(() => router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
    },
    [params, pathname, router],
  );

  // Texto: con retardo para no consultar en cada tecla
  useEffect(() => {
    const current = params.get("query") ?? "";
    if (query === current) return;
    const t = setTimeout(() => update((p) => (query.trim() ? p.set("query", query.trim()) : p.delete("query"))), 350);
    return () => clearTimeout(t);
  }, [query, params, update]);

  const toggleMulti = (key: string, value: string) =>
    update((p) => {
      const values = p.getAll(key);
      p.delete(key);
      const next = values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
      next.forEach((v) => p.append(key, v));
    });

  const has = (key: string, value: string) => params.getAll(key).includes(value);
  const hasGeo = params.has("lat") && params.has("lng");

  function locate() {
    if (!navigator.geolocation) {
      setGeoError("Tu navegador no permite geolocalización.");
      return;
    }
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        update((p) => {
          p.set("lat", pos.coords.latitude.toFixed(5));
          p.set("lng", pos.coords.longitude.toFixed(5));
          if (!p.has("radius")) p.set("radius", "5");
          p.delete("city");
          p.set("sort", "distance");
        });
      },
      () => {
        setLocating(false);
        setGeoError("No hemos podido obtener tu posición. Revisa los permisos del navegador.");
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );
  }

  const clearAll = () => {
    setQuery("");
    startTransition(() => router.replace(pathname, { scroll: false }));
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="f-query">Buscar</Label>
        <Input id="f-query" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Plato, nombre, barrio..." className="mt-1.5" />
      </div>

      <div>
        <Label>Dónde</Label>
        <div className="mt-1.5 flex flex-col gap-2">
          <Select value={hasGeo ? "cerca" : (params.get("city") ?? "todas")} onValueChange={(v) => update((p) => (v === "todas" ? (p.delete("city"), p.delete("lat"), p.delete("lng")) : (p.set("city", v), p.delete("lat"), p.delete("lng"))))}>
            <SelectTrigger className="w-full" aria-label="Ciudad">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las ciudades</SelectItem>
              {hasGeo && <SelectItem value="cerca">Cerca de mí</SelectItem>}
              {cities.map((c) => (
                <SelectItem key={c.city} value={c.city}>
                  {c.city} ({c.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" variant={hasGeo ? "secondary" : "outline"} onClick={locate} disabled={locating} className="justify-start">
            <LocateFixed data-icon="inline-start" className={cn(locating && "animate-pulse")} />
            {locating ? "Localizando…" : hasGeo ? "Usando tu posición" : "Cerca de mí"}
          </Button>
          {geoError && (
            <p role="alert" className="text-xs text-destructive">
              {geoError}
            </p>
          )}
          {hasGeo && (
            <div className="flex items-center gap-2">
              <Label htmlFor="f-radius" className="text-xs text-muted-foreground">
                Radio
              </Label>
              <Select value={params.get("radius") ?? "5"} onValueChange={(v) => update((p) => p.set("radius", v))}>
                <SelectTrigger id="f-radius" size="sm" className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RADII.map((r) => (
                    <SelectItem key={r} value={String(r)}>
                      {r} km
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      <fieldset>
        <legend className="text-sm font-medium">Precio</legend>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {(Object.keys(PRICE_RANGE) as (keyof typeof PRICE_RANGE)[]).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={has("price", k)}
              title={PRICE_RANGE[k].hint}
              onClick={() => toggleMulti("price", k)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm font-medium",
                has("price", k) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-foreground/40",
              )}
            >
              {PRICE_RANGE[k].symbol}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium">Cocina</legend>
        <ul className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-1.5 lg:grid-cols-1">
          {cuisines.map((c) => (
            <li key={c.id} className="flex items-center gap-2">
              <Checkbox id={`c-${c.slug}`} checked={has("cuisine", c.slug)} onCheckedChange={() => toggleMulti("cuisine", c.slug)} />
              <Label htmlFor={`c-${c.slug}`} className="font-normal">
                {c.name}
              </Label>
            </li>
          ))}
        </ul>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium">Características</legend>
        <ul className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-1.5 lg:grid-cols-1">
          {features.map((f) => (
            <li key={f.id} className="flex items-center gap-2">
              <Checkbox id={`f-${f.slug}`} checked={has("feature", f.slug)} onCheckedChange={() => toggleMulti("feature", f.slug)} />
              <Label htmlFor={`f-${f.slug}`} className="font-normal">
                {f.name}
              </Label>
            </li>
          ))}
        </ul>
      </fieldset>

      {params.size > 0 && (
        <Button type="button" variant="ghost" onClick={clearAll} className="w-full justify-start text-muted-foreground">
          <X data-icon="inline-start" /> Quitar filtros
        </Button>
      )}
    </div>
  );
}
