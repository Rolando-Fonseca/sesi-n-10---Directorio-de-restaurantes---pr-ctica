import { MessageSquare } from "lucide-react";
import { ReviewList } from "@/components/features/review/review-list";
import { EmptyState, PageHeader, Panel } from "@/components/dashboard/ui";
import { requireUser } from "@/lib/session";
import { getReviewsForOwner } from "@/server/queries/reviews";

export const metadata = { title: "Reseñas recibidas" };

export default async function OwnerReviewsPage() {
  const user = await requireUser();
  const reviews = await getReviewsForOwner(user.id, 100);
  return (
    <>
      <PageHeader title="Reseñas recibidas" description="Las de todos tus restaurantes, de la más reciente a la más antigua. Cada una avisa también por webhook (útil para automatizar respuestas)." />
      {reviews.length === 0 ? (
        <EmptyState icon={MessageSquare} title="Todavía sin reseñas" text="Aparecerán aquí cuando un usuario valore uno de tus restaurantes publicados." />
      ) : (
        <Panel>
          <ReviewList reviews={reviews} showRestaurant />
        </Panel>
      )}
    </>
  );
}
