"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, Map as MapIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

/** Orden y alternancia lista/mapa. Estado en la URL, como los filtros. */
export function ExploreToolbar({ hasGeo }: { hasGeo: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const view = params.get("view") === "map" ? "map" : "list";
  const sort = params.get("sort") ?? (hasGeo ? "distance" : "rating");

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    next.set(key, value);
    router.replace(`${pathname}?${next}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={sort} onValueChange={(v) => set("sort", v)}>
        <SelectTrigger aria-label="Ordenar por" className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="rating">Mejor valorados</SelectItem>
          {hasGeo && <SelectItem value="distance">Más cercanos</SelectItem>}
          <SelectItem value="recent">Novedades</SelectItem>
          <SelectItem value="name">Nombre</SelectItem>
        </SelectContent>
      </Select>
      <div role="group" aria-label="Vista" className="inline-flex rounded-lg border p-0.5">
        {(
          [
            ["list", LayoutGrid, "Lista"],
            ["map", MapIcon, "Mapa"],
          ] as const
        ).map(([v, Icon, label]) => (
          <button
            key={v}
            type="button"
            aria-pressed={view === v}
            onClick={() => set("view", v)}
            className={cn("inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium", view === v ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            <Icon className="size-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
