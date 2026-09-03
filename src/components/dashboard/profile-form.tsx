"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { updateProfileAction } from "@/server/actions/account";

type Tax = { id: string; name: string };
type Props = { phone: string; preferenceIds: string[]; allergenIds: string[]; preferences: Tax[]; allergens: Tax[] };

export function ProfileForm({ phone: initialPhone, preferenceIds, allergenIds, preferences, allergens }: Props) {
  const router = useRouter();
  const [phone, setPhone] = useState(initialPhone);
  const [prefs, setPrefs] = useState(new Set(preferenceIds));
  const [alls, setAlls] = useState(new Set(allergenIds));
  const [pending, start] = useTransition();

  const toggle = (set: Set<string>, setter: (s: Set<string>) => void, id: string) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setter(next);
  };

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await updateProfileAction({ phone, preferenceIds: [...prefs], allergenIds: [...alls] });
      if (res.success) {
        toast.success("Perfil guardado");
        router.refresh();
      } else toast.error(res.error);
    });
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      <fieldset>
        <legend className="text-base font-semibold">Alérgenos que debo evitar</legend>
        <p className="mt-1 text-sm text-muted-foreground">Cada carta marcará los platos que los contienen. Son los catorce del Reglamento UE 1169/2011.</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {allergens.map((a) => (
            <li key={a.id}>
              <label className={cn("flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm", alls.has(a.id) ? "border-destructive/40 bg-destructive/5" : "hover:bg-muted")}>
                <Checkbox checked={alls.has(a.id)} onCheckedChange={() => toggle(alls, setAlls, a.id)} />
                {a.name}
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <fieldset>
        <legend className="text-base font-semibold">Soy más de…</legend>
        <p className="mt-1 text-sm text-muted-foreground">Preferencias para recomendaciones. Puedes marcar varias.</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {preferences.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                aria-pressed={prefs.has(p.id)}
                onClick={() => toggle(prefs, setPrefs, p.id)}
                className={cn("rounded-full border px-3 py-1.5 text-sm font-medium", prefs.has(p.id) ? "border-primary bg-brand-soft text-primary" : "hover:border-foreground/40")}
              >
                {p.name}
              </button>
            </li>
          ))}
        </ul>
      </fieldset>

      <div className="max-w-xs">
        <Label htmlFor="phone">Teléfono (opcional)</Label>
        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+34 600 000 000" className="mt-1.5" />
      </div>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Guardando…" : "Guardar perfil"}
      </Button>
    </form>
  );
}
