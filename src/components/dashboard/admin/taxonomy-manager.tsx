"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ActionButton } from "@/components/dashboard/action-button";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { createTaxonomyAction, deleteTaxonomyAction, updateTaxonomyAction } from "@/server/actions/admin";

type Scope = "RESTAURANT" | "MENU_PRESENTATION" | "MENU_ALLERGEN" | "MENU_CATEGORY";
export type AdminTaxonomy = { id: string; scope: Scope; name: string; slug: string; order: number; isActive: boolean; uses: number };

const SCOPE_LABEL: Record<Scope, string> = { RESTAURANT: "Restaurante", MENU_PRESENTATION: "Presentación", MENU_ALLERGEN: "Alérgeno", MENU_CATEGORY: "Categoría de carta" };
const FAMILY = (order: number) => (order < 20 ? "Cocina" : order < 30 ? "Tipo de local" : order < 40 ? "Característica" : "Preferencia");

type Draft = { id?: string; scope: Scope; name: string; slug: string; order: string; isActive: boolean };

export function TaxonomyManager({ items }: { items: AdminTaxonomy[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>({ scope: "RESTAURANT", name: "", slug: "", order: "0", isActive: true });
  const [pending, start] = useTransition();
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  function save(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const base = { name: draft.name, slug: draft.slug || draft.name, order: Number(draft.order) || 0, isActive: draft.isActive };
      const res = draft.id ? await updateTaxonomyAction({ id: draft.id, ...base }) : await createTaxonomyAction({ scope: draft.scope, ...base });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Taxonomía guardada");
      setOpen(false);
      router.refresh();
    });
  }

  const scopes = Object.keys(SCOPE_LABEL) as Scope[];
  return (
    <>
      <Tabs defaultValue="RESTAURANT">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            {scopes.map((s) => (
              <TabsTrigger key={s} value={s}>
                {SCOPE_LABEL[s]} <span className="ml-1 text-xs opacity-70">{items.filter((t) => t.scope === s).length}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          <Button
            onClick={() => {
              setDraft({ scope: "RESTAURANT", name: "", slug: "", order: "0", isActive: true });
              setOpen(true);
            }}
          >
            <Plus data-icon="inline-start" /> Nueva
          </Button>
        </div>
        {scopes.map((s) => (
          <TabsContent key={s} value={s} className="mt-4">
            {s === "RESTAURANT" && <p className="mb-2 text-xs text-muted-foreground">El orden agrupa por familia: 1 a 19 cocinas, 20 a 29 tipos de local, 30 a 39 características, 40 en adelante preferencias.</p>}
            <ul className="divide-y rounded-xl bg-background ring-1 ring-border">
              {items
                .filter((t) => t.scope === s)
                .map((t) => (
                  <li key={t.id} className={cn("flex items-center gap-3 px-4 py-2.5 text-sm", !t.isActive && "opacity-50")}>
                    <span className="w-8 text-xs text-muted-foreground tabular-nums">{t.order}</span>
                    <span className="min-w-0 flex-1">
                      <span className="font-medium">{t.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {t.slug}
                        {s === "RESTAURANT" && ` · ${FAMILY(t.order)}`}
                        {!t.isActive && " · inactiva"}
                      </span>
                    </span>
                    <span className="text-xs text-muted-foreground">{t.uses} usos</span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Editar ${t.name}`}
                      onClick={() => {
                        setDraft({ id: t.id, scope: t.scope, name: t.name, slug: t.slug, order: String(t.order), isActive: t.isActive });
                        setOpen(true);
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <ActionButton
                      action={deleteTaxonomyAction}
                      payload={{ id: t.id }}
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Eliminar ${t.name}`}
                      successMessage={t.uses > 0 ? "Está en uso: se ha desactivado en lugar de borrarla" : "Taxonomía eliminada"}
                      confirm={{ title: `¿Eliminar ${t.name}?`, description: t.uses > 0 ? `Tiene ${t.uses} usos, así que solo se desactivará.` : "No está en uso; se borrará." }}
                    >
                      <Trash2 className="size-4" />
                    </ActionButton>
                  </li>
                ))}
            </ul>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{draft.id ? "Editar taxonomía" : "Nueva taxonomía"}</DialogTitle>
            <DialogDescription>El slug se genera del nombre si lo dejas vacío.</DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            {!draft.id && (
              <div>
                <Label htmlFor="t-scope">Ámbito</Label>
                <Select value={draft.scope} onValueChange={(v) => set("scope", v as Scope)}>
                  <SelectTrigger id="t-scope" className="mt-1.5 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {scopes.map((s) => (
                      <SelectItem key={s} value={s}>
                        {SCOPE_LABEL[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-[1fr_1fr_5rem]">
              <div>
                <Label htmlFor="t-name">Nombre</Label>
                <Input id="t-name" required minLength={2} value={draft.name} onChange={(e) => set("name", e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="t-slug">Slug</Label>
                <Input id="t-slug" value={draft.slug} onChange={(e) => set("slug", e.target.value)} className="mt-1.5" placeholder="automático" />
              </div>
              <div>
                <Label htmlFor="t-order">Orden</Label>
                <Input id="t-order" inputMode="numeric" value={draft.order} onChange={(e) => set("order", e.target.value)} className="mt-1.5" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={draft.isActive} onCheckedChange={(c) => set("isActive", c)} /> Activa
            </label>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Guardando…" : "Guardar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
