import { RatingStars } from "@/components/features/restaurant/rating-stars";

export const CRITERIA_LABELS: Record<"AMBIANCE" | "SERVICE" | "FOOD" | "VALUE", string> = {
  AMBIANCE: "Ambiente",
  SERVICE: "Servicio",
  FOOD: "Comida",
  VALUE: "Calidad/precio",
};

export function RatingBreakdown({ average, count, breakdown }: { average: number; count: number; breakdown: Record<keyof typeof CRITERIA_LABELS, number> }) {
  return (
    <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
      <div className="text-center sm:pr-6">
        <p className="font-display text-6xl leading-none tabular-nums">{average > 0 ? average.toFixed(1).replace(".", ",") : "—"}</p>
        <RatingStars value={average} size="md" className="mt-2 justify-center [&>span:last-child]:sr-only" />
        <p className="mt-1 text-sm text-muted-foreground">
          {count} {count === 1 ? "reseña" : "reseñas"}
        </p>
      </div>
      <dl className="space-y-2.5">
        {(Object.keys(CRITERIA_LABELS) as (keyof typeof CRITERIA_LABELS)[]).map((k) => (
          <div key={k} className="grid grid-cols-[7rem_1fr_2.5rem] items-center gap-3 text-sm">
            <dt className="text-muted-foreground">{CRITERIA_LABELS[k]}</dt>
            <dd className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-accent" style={{ width: `${(breakdown[k] / 5) * 100}%` }} />
            </dd>
            <dd className="text-right font-semibold tabular-nums">{breakdown[k] > 0 ? breakdown[k].toFixed(1).replace(".", ",") : "—"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
