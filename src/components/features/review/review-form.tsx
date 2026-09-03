"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { submitReviewAction } from "@/server/actions/reviews";
import { CRITERIA_LABELS } from "./rating-breakdown";

type Criterion = keyof typeof CRITERIA_LABELS;
type Props = { restaurantId: string; signedIn: boolean; isOwner: boolean; existing?: { ratings: Record<string, number>; comment: string | null } | null };

export function ReviewForm({ restaurantId, signedIn, isOwner, existing }: Props) {
  const router = useRouter();
  const [scores, setScores] = useState<Record<Criterion, number>>({
    AMBIANCE: existing?.ratings.AMBIANCE ?? 0,
    SERVICE: existing?.ratings.SERVICE ?? 0,
    FOOD: existing?.ratings.FOOD ?? 0,
    VALUE: existing?.ratings.VALUE ?? 0,
  });
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  if (isOwner) return null;
  if (!signedIn) {
    return (
      <p className="rounded-xl bg-muted p-4 text-sm">
        <Link href="/sign-in" className="font-medium text-primary hover:underline">
          Entra
        </Link>{" "}
        para escribir tu reseña. Cuatro notas y, si quieres, un comentario.
      </p>
    );
  }

  const complete = (Object.values(scores) as number[]).every((s) => s > 0);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await submitReviewAction({
        restaurantId,
        comment: comment.trim() || undefined,
        ratings: (Object.keys(scores) as Criterion[]).map((criterion) => ({ criterion, score: scores[criterion] })),
      });
      if (!res.success) {
        setError(res.error);
        return;
      }
      setDone(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="rounded-2xl bg-cream p-5 ring-1 ring-border">
      <h3 className="font-semibold">{existing ? "Edita tu reseña" : "Escribe tu reseña"}</h3>
      <p className="mt-1 text-sm text-muted-foreground">Una por persona y restaurante. Puedes cambiarla cuando quieras.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {(Object.keys(CRITERIA_LABELS) as Criterion[]).map((k) => (
          <fieldset key={k} className="flex items-center justify-between gap-3 rounded-lg bg-background px-3 py-2">
            <legend className="sr-only">{CRITERIA_LABELS[k]}</legend>
            <span className="text-sm font-medium">{CRITERIA_LABELS[k]}</span>
            <div className="flex" role="radiogroup" aria-label={CRITERIA_LABELS[k]}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={scores[k] === n}
                  aria-label={`${n} de 5`}
                  onClick={() => setScores((s) => ({ ...s, [k]: n }))}
                  className="p-0.5 text-border transition-colors duration-(--duration-fast) hover:text-accent"
                >
                  <Star className={cn("size-6", n <= scores[k] && "fill-accent text-accent")} />
                </button>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      <div className="mt-4">
        <Label htmlFor="comment">Comentario (opcional)</Label>
        <Textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={2000} rows={3} className="mt-1.5 bg-background" placeholder="Qué pediste, qué repetirías, qué no." />
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {done && (
        <p role="status" className="mt-3 text-sm font-medium text-primary">
          Reseña guardada. Gracias por tu tiempo.
        </p>
      )}
      <Button type="submit" size="lg" className="mt-4 h-10" disabled={!complete || pending}>
        {pending ? "Guardando…" : existing ? "Actualizar reseña" : "Publicar reseña"}
      </Button>
      {!complete && <p className="mt-2 text-xs text-muted-foreground">Puntúa los cuatro criterios para publicar.</p>}
    </form>
  );
}
