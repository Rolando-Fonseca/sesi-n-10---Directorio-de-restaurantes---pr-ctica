import { RestaurantForm } from "@/components/dashboard/owner/restaurant-form";
import { PageHeader, Panel } from "@/components/dashboard/ui";
import { requireUser } from "@/lib/session";
import { getRestaurantTaxonomyGroups } from "@/server/queries/taxonomies";

export const metadata = { title: "Nuevo restaurante" };

export default async function NewRestaurantPage() {
  const user = await requireUser();
  const groups = await getRestaurantTaxonomyGroups();
  return (
    <>
      <PageHeader title="Nuevo restaurante" description="Rellena la ficha y envíala a revisión." back={{ href: "/dashboard/owner/restaurants", label: "Restaurantes" }} />
      <Panel className="max-w-3xl">
        <RestaurantForm groups={groups} isOwnerAlready={user.role !== "USER"} />
      </Panel>
    </>
  );
}
