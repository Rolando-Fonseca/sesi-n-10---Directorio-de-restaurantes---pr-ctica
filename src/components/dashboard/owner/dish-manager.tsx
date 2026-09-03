"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ActionButton } from "@/components/dashboard/action-button";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { createDishAction, createMenuCategoryAction, deleteDishAction, deleteMenuCategoryAction, updateDishAction } from "@/server/actions/menus";

type Tax = { id: string; name: string };
type Category = { id: string; name: string };
export type EditorDish = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  isAvailable: boolean;
  isFeatured: boolean;
  categoryId: string | null;
  taxonomyIds: string[];
  allergens: Tax[];
  presentation: Tax | null;
};

type Props = {
  menuId: string;
  /** Categorías locales del primer restaurante asignado (las categorías son por restaurante). */
  restaurant: { id: string; name: string; categories: Category[] } | null;
  dishes: EditorDish[];
  allergens: Tax[];
  presentations: Tax[];
};

type Draft = { id?: string; name: string; description: string; price: string; categoryId: string; presentationId: string; allergenIds: string[]; isAvailable: boolean; isFeatured: boolean };
const EMPTY: Draft = { name: "", description: "", price: "", categoryId: "", presentationId: "", allergenIds: [], isAvailable: true, isFeatured: false };

export function DishManager({ menuId, restaurant, dishes, allergens, presentations }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [newCategory, setNewCategory] = useState("");
  const [pending, start] = useTransition();
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const openNew = () => {
    setDraft(EMPTY);
    setOpen(true);
  };
  const openEdit = (d: EditorDish) => {
    setDraft({
      id: d.id,
      name: d.name,
      description: d.description ?? "",
      price: String(d.price).replace(".", ","),
      categoryId: d.categoryId ?? "",
      presentationId: d.presentation?.id ?? "",
      allergenIds: d.allergens.map((a) => a.id),
      isAvailable: d.isAvailable,
      isFeatured: d.isFeatured,
    });
    setOpen(true);
  };

  function saveDish(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const taxonomyIds = [...draft.allergenIds, ...(draft.presentationId ? [draft.presentationId] : [])];
      const base = { name: draft.name, description: draft.description || undefined, price: Number(draft.price.replace(",", ".")), categoryId: draft.categoryId || undefined, isAvailable: draft.isAvailable, isFeatured: draft.isFeatured, taxonomyIds };
      const res = draft.id ? await updateDishAction({ id: draft.id, ...base }) : await createDishAction({ menuId, ...base });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(draft.id ? "Plato guardado" : "Plato añadido");
      setOpen(false);
      router.refresh();
    });
  }

  function addCategory() {
    if (!restaurant || !newCategory.trim()) return;
    start(async () => {
      const res = await createMenuCategoryAction({ restaurantId: restaurant.id, name: newCategory.trim(), order: restaurant.categories.length });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      setNewCategory("");
      toast.success("Categoría creada");
      router.refresh();
    });
  }

  const categories = restaurant?.categories ?? [];
  const byCategory = new Map<string | null, EditorDish[]>();
  for (const d of dishes) byCategory.set(d.categoryId, [...(byCategory.get(d.categoryId) ?? []), d]);
  const sections = [...categories.map((c) => ({ id: c.id as string | null, name: c.name, dishes: byCategory.get(c.id) ?? [] })), { id: null, name: "Sin categoría", dishes: byCategory.get(null) ?? [] }].filter(
    (s) => s.dishes.length > 0 || s.id !== null,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">
          Platos <span className="text-sm font-normal text-muted-foreground">({dishes.length})</span>
        </h2>
        <Button onClick={openNew}>
          <Plus data-icon="inline-start" /> Añadir plato
        </Button>
      </div>

      {restaurant && (
        <div className="rounded-xl bg-muted/70 p-4">
          <p className="text-sm font-medium">Categorías de {restaurant.name}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {categories.map((c) => (
              <span key={c.id} className="inline-flex items-center gap-1 rounded-full bg-background px-3 py-1 text-sm ring-1 ring-border">
                {c.name}
                <ActionButton action={deleteMenuCategoryAction} payload={{ id: c.id }} variant="ghost" size="icon-xs" aria-label={`Eliminar categoría ${c.name}`} confirm={{ title: `¿Eliminar la categoría ${c.name}?`, description: "Sus platos quedarán sin categoría, no se borran." }}>
                  <Trash2 className="size-3" />
                </ActionButton>
              </span>
            ))}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addCategory();
              }}
              className="flex gap-1.5"
            >
              <Input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Nueva categoría" className="h-8 w-40" aria-label="Nueva categoría" />
              <Button type="submit" size="sm" variant="outline" disabled={pending || !newCategory.trim()}>
                Añadir
              </Button>
            </form>
          </div>
        </div>
      )}

      {dishes.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Todavía no hay platos. Añade el primero con su precio y sus alérgenos.</p>
      ) : (
        sections.map((s) => (
          <section key={s.id ?? "none"}>
            <h3 className="mb-2 text-sm font-semibold tracking-wide text-muted-foreground uppercase">{s.name}</h3>
            <ul className="divide-y rounded-xl bg-background ring-1 ring-border">
              {s.dishes.map((d) => (
                <li key={d.id} className={cn("flex items-center gap-3 px-4 py-3", !d.isAvailable && "opacity-60")}>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {d.name}
                      {d.isFeatured && <Star className="ml-1.5 inline size-3.5 fill-accent text-accent" aria-label="Destacado" />}
                      {!d.isAvailable && <span className="ml-2 text-xs text-muted-foreground">(no disponible)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {d.presentation?.name ? `${d.presentation.name} · ` : ""}
                      {d.allergens.length ? d.allergens.map((a) => a.name).join(", ") : "Sin alérgenos declarados"}
                    </p>
                  </div>
                  <span className="font-semibold tabular-nums">{formatPrice(d.price)}</span>
                  <Button variant="ghost" size="icon-sm" aria-label={`Editar ${d.name}`} onClick={() => openEdit(d)}>
                    <Pencil className="size-4" />
                  </Button>
                  <ActionButton action={deleteDishAction} payload={{ id: d.id }} variant="ghost" size="icon-sm" aria-label={`Borrar ${d.name}`} successMessage="Plato borrado" confirm={{ title: `¿Borrar ${d.name}?`, confirmLabel: "Borrar" }}>
                    <Trash2 className="size-4" />
                  </ActionButton>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{draft.id ? "Editar plato" : "Nuevo plato"}</DialogTitle>
            <DialogDescription>Declara los alérgenos con cuidado: los usuarios filtran la carta con ellos.</DialogDescription>
          </DialogHeader>
          <form onSubmit={saveDish} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_7rem]">
              <div>
                <Label htmlFor="d-name">Nombre</Label>
                <Input id="d-name" required minLength={2} maxLength={100} value={draft.name} onChange={(e) => set("name", e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="d-price">Precio (€)</Label>
                <Input id="d-price" required inputMode="decimal" value={draft.price} onChange={(e) => set("price", e.target.value)} className="mt-1.5" placeholder="12,50" />
              </div>
            </div>
            <div>
              <Label htmlFor="d-desc">Descripción</Label>
              <Textarea id="d-desc" rows={2} maxLength={1000} value={draft.description} onChange={(e) => set("description", e.target.value)} className="mt-1.5" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="d-cat">Categoría</Label>
                <Select value={draft.categoryId || "none"} onValueChange={(v) => set("categoryId", v === "none" ? "" : v)}>
                  <SelectTrigger id="d-cat" className="mt-1.5 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin categoría</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="d-pres">Presentación</Label>
                <Select value={draft.presentationId || "none"} onValueChange={(v) => set("presentationId", v === "none" ? "" : v)}>
                  <SelectTrigger id="d-pres" className="mt-1.5 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin indicar</SelectItem>
                    {presentations.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <fieldset>
              <legend className="text-sm font-medium">Alérgenos</legend>
              <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 sm:grid-cols-3">
                {allergens.map((a) => (
                  <li key={a.id} className="flex items-center gap-2">
                    <Checkbox id={`a-${a.id}`} checked={draft.allergenIds.includes(a.id)} onCheckedChange={(c) => set("allergenIds", c ? [...draft.allergenIds, a.id] : draft.allergenIds.filter((x) => x !== a.id))} />
                    <Label htmlFor={`a-${a.id}`} className="text-sm font-normal">
                      {a.name}
                    </Label>
                  </li>
                ))}
              </ul>
            </fieldset>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={draft.isAvailable} onCheckedChange={(c) => set("isAvailable", c)} /> Disponible
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={draft.isFeatured} onCheckedChange={(c) => set("isFeatured", c)} /> Destacado
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Guardando…" : "Guardar plato"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
