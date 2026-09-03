import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Cinco estrellas con relleno proporcional; el número va aparte para lectores de pantalla. */
export function RatingStars({ value, count, size = "sm", className }: { value: number; count?: number; size?: "sm" | "md"; className?: string }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  const dim = size === "md" ? "size-5" : "size-3.5";
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)} aria-label={`${value.toString().replace(".", ",")} sobre 5${count != null ? `, ${count} reseñas` : ""}`}>
      <span className="relative inline-flex" aria-hidden="true">
        <span className="flex text-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={cn(dim, "fill-current")} />
          ))}
        </span>
        <span className="absolute inset-0 flex overflow-hidden text-accent" style={{ width: `${pct}%` }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={cn(dim, "shrink-0 fill-current")} />
          ))}
        </span>
      </span>
      <span className={cn("font-semibold tabular-nums", size === "md" ? "text-base" : "text-sm")} aria-hidden="true">
        {value > 0 ? value.toFixed(1).replace(".", ",") : "—"}
      </span>
      {count != null && (
        <span className="text-xs text-muted-foreground" aria-hidden="true">
          ({count})
        </span>
      )}
    </span>
  );
}
