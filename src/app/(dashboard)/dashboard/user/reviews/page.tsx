import Link from "next/link";
import { MessageSquare, Trash2 } from "lucide-react";
import { RatingStars } from "@/components/features/restaurant/rating-stars";
import { CRITERIA_LABELS } from "@/components/features/review/rating-breakdown";
import { ActionButton } from "@/components/dashboard/action-button";
import { EmptyState, PageHeader, Panel } from "@/components/dashboard/ui";
import { timeAgo } from "@/lib/format";
import { requireUser } from "@/lib/session";
import { deleteReviewAction } from "@/server/actions/reviews";
import { getReviewsByUser } from "@/server/queries/reviews";

export const metadata = { title: "Mis reseñas" };

export default async function UserReviewsPage() {
  const user = await requireUser();
  const reviews = await getReviewsByUser(user.id);

  return (
    <>
      <PageHeader title="Mis reseñas" description="Una por restaurante. Puedes editarla desde la ficha del restaurante o borrarla aquí." />
      {reviews.length === 0 ? (
        <EmptyState icon={MessageSquare} title="Todavía no has escrito ninguna" text="La primera reseña da 40 puntos y la insignia «Primera opinión»." action={{ href: "/explore", label: "Buscar un sitio que conozcas" }} />
      ) : (
        <Panel>
          <ul className="divide-y">
            {reviews.map((r) => (
              <li key={r.id} className="py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/restaurant/${r.restaurant!.slug}`} className="font-semibold hover:underline">
                      {r.restaurant!.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{timeAgo(r.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <RatingStars value={r.average} />
                    <ActionButton
                      action={deleteReviewAction}
                      payload={{ id: r.id }}
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Borrar reseña"
                      successMessage="Reseña borrada"
                      confirm={{ title: "¿Borrar esta reseña?", description: "Se recalculará la media del restaurante. Los puntos ganados se conservan.", confirmLabel: "Borrar" }}
                    >
                      <Trash2 className="size-4" />
                    </ActionButton>
                  </div>
                </div>
                {r.comment && <p className="mt-2 text-sm">{r.comment}</p>}
                <dl className="mt-2 flex flex-wrap gap-x-4 text-xs text-muted-foreground">
                  {(Object.keys(CRITERIA_LABELS) as (keyof typeof CRITERIA_LABELS)[]).map((k) => (
                    <div key={k} className="flex gap-1">
                      <dt>{CRITERIA_LABELS[k]}</dt>
                      <dd className="font-semibold text-foreground">{r.ratings[k]}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </>
  );
}
