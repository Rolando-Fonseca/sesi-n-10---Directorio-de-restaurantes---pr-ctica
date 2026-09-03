import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { formatDistance, priceSymbol } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { RestaurantSummary } from "@/server/queries/dto";
import { RatingStars } from "./rating-stars";

type Props = { restaurant: RestaurantSummary; variant?: "grid" | "feature" | "row"; priority?: boolean; className?: string };

export function RestaurantCard({ restaurant: r, variant = "grid", priority, className }: Props) {
  const href = `/restaurant/${r.slug}`;
  const cuisines = r.cuisines.map((c) => c.name).join(" · ");

  if (variant === "row") {
    return (
      <Link href={href} data-pressable className={cn("card-zoom group flex gap-4 rounded-xl p-2 transition-colors duration-(--duration-fast) hover:bg-muted", className)}>
        <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-muted">
          {r.coverUrl && <Image src={r.coverUrl} alt="" fill sizes="112px" className="object-cover" />}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold group-hover:underline group-hover:underline-offset-4">{r.name}</h3>
          <p className="truncate text-sm text-muted-foreground">{cuisines}</p>
          <div className="mt-1 flex items-center gap-3 text-sm">
            <RatingStars value={r.averageRating} count={r.reviewCount} />
            <span className="text-muted-foreground">{priceSymbol(r.priceRange)}</span>
            {r.distanceKm != null && <span className="text-muted-foreground">{formatDistance(r.distanceKm)}</span>}
          </div>
        </div>
      </Link>
    );
  }

  const feature = variant === "feature";
  return (
    <Link href={href} data-pressable className={cn("card-zoom group flex flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-border/70 transition-shadow duration-(--duration-ui) hover:shadow-lg hover:shadow-foreground/5", className)}>
      <div className={cn("relative w-full overflow-hidden bg-muted", feature ? "aspect-[16/10]" : "aspect-[4/3]")}>
        {r.coverUrl ? (
          <Image src={r.coverUrl} alt={`Interior de ${r.name}`} fill priority={priority} sizes={feature ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"} className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">Sin foto</div>
        )}
        {r.priceRange && (
          <span className="absolute top-3 left-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold backdrop-blur">{priceSymbol(r.priceRange)}</span>
        )}
        {r.distanceKm != null && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-secondary/85 px-2.5 py-1 text-xs font-medium text-secondary-foreground backdrop-blur">
            <MapPin className="size-3" /> {formatDistance(r.distanceKm)}
          </span>
        )}
      </div>
      <div className={cn("flex flex-1 flex-col gap-1.5", feature ? "p-5" : "p-4")}>
        <div className="flex items-start justify-between gap-3">
          <h3 className={cn("font-semibold leading-snug", feature ? "font-display text-2xl" : "text-lg")}>{r.name}</h3>
          <RatingStars value={r.averageRating} className="shrink-0 pt-0.5" />
        </div>
        <p className="text-sm text-muted-foreground">
          {cuisines}
          {r.city && (
            <>
              <span aria-hidden="true"> · </span>
              {r.city}
            </>
          )}
        </p>
      </div>
    </Link>
  );
}
