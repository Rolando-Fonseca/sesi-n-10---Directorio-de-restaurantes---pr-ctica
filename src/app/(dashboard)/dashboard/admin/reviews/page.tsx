import Link from "next/link";
import { EyeOff } from "lucide-react";
import { RatingStars } from "@/components/features/restaurant/rating-stars";
import { ActionButton } from "@/components/dashboard/action-button";
import { PageHeader, Panel } from "@/components/dashboard/ui";
import { timeAgo } from "@/lib/format";
import { requireUserWithRole } from "@/lib/session";
import { cn } from "@/lib/utils";
import { deleteReviewAction } from "@/server/actions/reviews";
import { getAllReviews } from "@/server/queries/reviews";

export const metadata = { title: "Reseñas" };

export default async function AdminReviewsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireUserWithRole("ADMIN");
  const { page } = await searchParams;
  const result = await getAllReviews(Number(page) || 1, 40);

  return (
    <>
      <PageHeader title="Reseñas" description="Moderación: ocultar una reseña la desactiva (queda rastro) y recalcula la media del restaurante." />
      <Panel>
        <ul className="divide-y">
          {result.items.map((r) => (
            <li key={r.id} className={cn("py-3", !r.isActive && "opacity-50")}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm">
                  <span className="font-semibold">{r.author.name}</span> sobre{" "}
                  <Link href={`/restaurant/${r.restaurant!.slug}`} className="font-medium hover:underline">
                    {r.restaurant!.name}
                  </Link>
                  <span className="text-muted-foreground"> · {timeAgo(r.createdAt)}</span>
                  {!r.isActive && <span className="ml-2 text-xs text-destructive">oculta</span>}
                </div>
                <div className="flex items-center gap-2">
                  <RatingStars value={r.average} />
                  {r.isActive && (
                    <ActionButton action={deleteReviewAction} payload={{ id: r.id }} variant="ghost" size="sm" successMessage="Reseña ocultada" confirm={{ title: "¿Ocultar esta reseña?", description: "El autor no la verá publicada y se recalcula la media." }}>
                      <EyeOff data-icon="inline-start" /> Ocultar
                    </ActionButton>
                  )}
                </div>
              </div>
              {r.comment && <p className="mt-1 text-sm">{r.comment}</p>}
            </li>
          ))}
        </ul>
        {result.pages > 1 && (
          <p className="mt-4 text-sm text-muted-foreground">
            Página {result.page} de {result.pages}.{" "}
            {result.page < result.pages && (
              <Link href={`/dashboard/admin/reviews?page=${result.page + 1}`} className="font-medium text-primary hover:underline">
                Siguiente
              </Link>
            )}
          </p>
        )}
      </Panel>
    </>
  );
}
