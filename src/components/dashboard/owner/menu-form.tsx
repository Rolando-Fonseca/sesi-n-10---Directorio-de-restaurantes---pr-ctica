"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createMenuAction, updateMenuAction } from "@/server/actions/menus";

type Props = {
  initial?: { id: string; title: string; description: string; price: string; restaurantIds: string[] };
  restaurants: { id: string; name: string; status: string }[];
};

export function MenuForm({ initial, restaurants }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial?.price ?? "");
  const [ids, setIds] = useState<string[]>(initial?.restaurantIds ?? restaurants.map((r) => r.id).slice(0, 1));
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const payload = { ...(initial ? { id: initial.id } : {}), title, description: description || undefined, price: price ? Number(price.replace(",", ".")) : undefined, restaurantIds: ids };
      const res = initial ? await updateMenuAction(payload) : await createMenuAction(payload);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(initial ? "Carta guardada" : "Carta creada. Ahora añade los platos.");
      router.push(`/dashboard/owner/menus/${res.data.id}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
        <div>
          <Label htmlFor="title">Título de la carta</Label>
          <Input id="title" required minLength={2} maxLength={100} value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5" placeholder="Carta de temporada, Menú del día, Brunch…" />
        </div>
        <div>
          <Label htmlFor="price">Precio de menú (opcional)</Label>
          <Input id="price" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1.5" placeholder="p. ej. 18,50" />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea id="description" rows={3} maxLength={2000} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1.5" />
      </div>
      <fieldset>
        <legend className="text-sm font-medium">Restaurantes donde se sirve</legend>
        <p className="text-xs text-muted-foreground">Una carta puede estar en varios de tus restaurantes.</p>
        <ul className="mt-2 space-y-1.5">
          {restaurants.map((r) => (
            <li key={r.id} className="flex items-center gap-2">
              <Checkbox id={`r-${r.id}`} checked={ids.includes(r.id)} onCheckedChange={(c) => setIds((s) => (c ? [...s, r.id] : s.filter((x) => x !== r.id)))} />
              <Label htmlFor={`r-${r.id}`} className="font-normal">
                {r.name}
                {r.status !== "APPROVED" && <span className="ml-1 text-xs text-muted-foreground">(no publicado)</span>}
              </Label>
            </li>
          ))}
        </ul>
      </fieldset>
      <Button type="submit" size="lg" disabled={pending || ids.length === 0}>
        {pending ? "Guardando…" : initial ? "Guardar carta" : "Crear carta"}
      </Button>
    </form>
  );
}
