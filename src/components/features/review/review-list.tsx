import Image from "next/image";
import { RatingStars } from "@/components/features/restaurant/rating-stars";
import { timeAgo } from "@/lib/format";
import type { ReviewDto } from "@/server/queries/dto";
import { CRITERIA_LABELS } from "./rating-breakdown";

export function ReviewList({ reviews, showRestaurant }: { reviews: ReviewDto[]; showRestaurant?: boolean }) {
  if (reviews.length === 0) return <p className="text-muted-foreground">Todavía nadie ha escrito una reseña. Sé la primera persona.</p>;
  return (
    <ul className="divide-y">
      {reviews.map((r) => (
        <li key={r.id} className="py-6 first:pt-0">
          <div className="flex items-center gap-3">
            {r.author.imageUrl ? (
              <Image src={r.author.imageUrl} alt="" width={40} height={40} className="size-10 rounded-full object-cover" />
            ) : (
              <span className="flex size-10 items-center justify-center rounded-full bg-brand-soft font-semibold text-primary" aria-hidden="true">
                {r.author.name.slice(0, 1)}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                {r.author.name}
                <span className="ml-2 text-xs font-normal text-muted-foreground">Nivel {r.author.level}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                <time dateTime={r.createdAt}>{timeAgo(r.createdAt)}</time>
                {showRestaurant && r.restaurant && <> · {r.restaurant.name}</>}
              </p>
            </div>
            <RatingStars value={r.average} />
          </div>
          {r.comment && <p className="mt-3 leading-relaxed">{r.comment}</p>}
          <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {(Object.keys(CRITERIA_LABELS) as (keyof typeof CRITERIA_LABELS)[]).map((k) => (
              <div key={k} className="flex gap-1">
                <dt>{CRITERIA_LABELS[k]}</dt>
                <dd className="font-semibold text-foreground tabular-nums">{r.ratings[k] ?? "—"}</dd>
              </div>
            ))}
          </dl>
        </li>
      ))}
    </ul>
  );
}
