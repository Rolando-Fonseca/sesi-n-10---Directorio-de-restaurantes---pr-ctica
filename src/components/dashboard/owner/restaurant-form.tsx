"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { LocationPicker } from "@/components/features/map/location-picker";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PRICE_RANGE } from "@/lib/format";
import { createRestaurantAction, updateRestaurantAction } from "@/server/actions/restaurants";

type Tax = { id: string; name: string };
export type RestaurantFormValues = {
  id?: string;
  name: string;
  description: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  website: string;
  priceRange: "" | keyof typeof PRICE_RANGE;
  latitude: number | null;
  longitude: number | null;
  taxonomyIds: string[];
};

type Props = {
  initial?: RestaurantFormValues;
  groups: { cuisines: Tax[]; establishment: Tax[]; features: Tax[]; preferences: Tax[] };
  isOwnerAlready: boolean;
};

function TaxGroup({ title, items, hint, selected, onToggle }: { title: string; items: Tax[]; hint?: string; selected: string[]; onToggle: (id: string) => void }) {
  return (
    <fieldset>
      <legend className="text-sm font-medium">{title}</legend>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <ul className="mt-2 flex flex-wrap gap-2">
        {items.map((t) => {
          const on = selected.includes(t.id);
          return (
            <li key={t.id}>
              <label className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${on ? "border-primary bg-brand-soft text-primary" : "hover:border-foreground/40"}`}>
                <Checkbox className="sr-only" checked={on} onCheckedChange={() => onToggle(t.id)} />
                {t.name}
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

const EMPTY: RestaurantFormValues = { name: "", description: "", address: "", city: "", postalCode: "", phone: "", website: "", priceRange: "", latitude: null, longitude: null, taxonomyIds: [] };

export function RestaurantForm({ initial, groups, isOwnerAlready }: Props) {
  const router = useRouter();
  const [v, setV] = useState<RestaurantFormValues>(initial ?? EMPTY);
  const [pending, start] = useTransition();
  const set = <K extends keyof RestaurantFormValues>(key: K, value: RestaurantFormValues[K]) => setV((s) => ({ ...s, [key]: value }));
  const toggleTax = (id: string) => set("taxonomyIds", v.taxonomyIds.includes(id) ? v.taxonomyIds.filter((x) => x !== id) : [...v.taxonomyIds, id]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const payload = {
        ...(v.id ? { id: v.id } : {}),
        name: v.name,
        description: v.description || undefined,
        address: v.address,
        city: v.city || undefined,
        postalCode: v.postalCode || undefined,
        phone: v.phone || undefined,
        website: v.website || "",
        priceRange: v.priceRange || undefined,
        latitude: v.latitude ?? undefined,
        longitude: v.longitude ?? undefined,
        taxonomyIds: v.taxonomyIds,
      };
      const res = v.id ? await updateRestaurantAction(payload) : await createRestaurantAction(payload);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(v.id ? "Restaurante guardado" : "Restaurante enviado a revisión");
      router.push(`/dashboard/owner/restaurants/${res.data.id}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      {!v.id && !isOwnerAlready && (
        <p className="rounded-xl bg-brand-soft p-4 text-sm">Al enviar tu primer restaurante tu cuenta pasa a ser de dueño. Un administrador revisará la ficha antes de publicarla.</p>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" required minLength={2} maxLength={100} value={v.name} onChange={(e) => set("name", e.target.value)} className="mt-1.5" />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea id="description" rows={4} maxLength={2000} value={v.description} onChange={(e) => set("description", e.target.value)} className="mt-1.5" placeholder="Qué cocina, qué ambiente, qué conviene saber antes de ir." />
        </div>
        <div>
          <Label htmlFor="priceRange">Rango de precio</Label>
          <Select value={v.priceRange || "none"} onValueChange={(val) => set("priceRange", val === "none" ? "" : (val as RestaurantFormValues["priceRange"]))}>
            <SelectTrigger id="priceRange" className="mt-1.5 w-full">
              <SelectValue placeholder="Elige" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin indicar</SelectItem>
              {(Object.keys(PRICE_RANGE) as (keyof typeof PRICE_RANGE)[]).map((k) => (
                <SelectItem key={k} value={k}>
                  {PRICE_RANGE[k].symbol} · {PRICE_RANGE[k].label} ({PRICE_RANGE[k].hint})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" value={v.phone} onChange={(e) => set("phone", e.target.value)} className="mt-1.5" placeholder="+34 …" />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="website">Web</Label>
          <Input id="website" type="url" value={v.website} onChange={(e) => set("website", e.target.value)} className="mt-1.5" placeholder="https://" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold">Dirección y mapa</h2>
        <div className="grid gap-4 sm:grid-cols-[2fr_1fr_1fr]">
          <div>
            <Label htmlFor="address">Calle y número</Label>
            <Input id="address" required minLength={5} value={v.address} onChange={(e) => set("address", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="city">Ciudad</Label>
            <Input id="city" value={v.city} onChange={(e) => set("city", e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="postalCode">Código postal</Label>
            <Input id="postalCode" value={v.postalCode} onChange={(e) => set("postalCode", e.target.value)} className="mt-1.5" />
          </div>
        </div>
        <LocationPicker
          address={v.address}
          city={v.city}
          value={v.latitude != null && v.longitude != null ? { latitude: v.latitude, longitude: v.longitude } : null}
          onChange={(c) => setV((s) => ({ ...s, latitude: c?.latitude ?? null, longitude: c?.longitude ?? null }))}
        />
      </section>

      <section className="space-y-5">
        <h2 className="text-base font-semibold">Clasificación</h2>
        <TaxGroup title="Tipo de cocina" items={groups.cuisines} selected={v.taxonomyIds} onToggle={toggleTax} />
        <TaxGroup title="Tipo de local" items={groups.establishment} selected={v.taxonomyIds} onToggle={toggleTax} />
        <TaxGroup title="Características" items={groups.features} selected={v.taxonomyIds} onToggle={toggleTax} hint="Solo marca lo que ofreces de verdad; los usuarios filtran por esto." />
        <TaxGroup title="Ideal para" items={groups.preferences} selected={v.taxonomyIds} onToggle={toggleTax} />
      </section>

      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Guardando…" : v.id ? "Guardar cambios" : "Enviar a revisión"}
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
