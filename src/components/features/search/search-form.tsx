"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Props = { cities: { city: string; count: number }[]; defaultQuery?: string; defaultCity?: string; compact?: boolean };

/** Buscador de la home: texto libre + ciudad. Navega a /explore con los parámetros. */
export function SearchForm({ cities, defaultQuery = "", defaultCity = "", compact }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);
  const [city, setCity] = useState(defaultCity || "todas");
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("query", query.trim());
    if (city !== "todas") params.set("city", city);
    start(() => router.push(`/explore${params.size ? `?${params}` : ""}`));
  }

  return (
    <form onSubmit={submit} role="search" className={compact ? "flex flex-col gap-2 sm:flex-row" : "flex flex-col gap-3 rounded-2xl bg-background p-3 shadow-lg shadow-foreground/5 ring-1 ring-border sm:flex-row sm:items-end"}>
      <div className="flex-1">
        <Label htmlFor="q" className="sr-only">
          Qué te apetece
        </Label>
        <Input id="q" name="query" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Paella, tapas, ramen, un nombre..." className="h-11 text-base" autoComplete="off" />
      </div>
      <div className="sm:w-48">
        <Label htmlFor="city" className="sr-only">
          Ciudad
        </Label>
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger id="city" className="h-11! w-full">
            <SelectValue placeholder="Ciudad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las ciudades</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c.city} value={c.city}>
                {c.city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" size="lg" className="h-11 px-5" disabled={pending}>
        <Search data-icon="inline-start" />
        {pending ? "Buscando…" : "Buscar"}
      </Button>
    </form>
  );
}
