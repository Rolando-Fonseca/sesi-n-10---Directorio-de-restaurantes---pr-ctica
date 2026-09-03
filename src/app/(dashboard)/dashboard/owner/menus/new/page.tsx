import { redirect } from "next/navigation";
import { MenuForm } from "@/components/dashboard/owner/menu-form";
import { PageHeader, Panel } from "@/components/dashboard/ui";
import { requireUser } from "@/lib/session";
import { getRestaurantsByOwner } from "@/server/queries/restaurants";

export const metadata = { title: "Nueva carta" };

export default async function NewMenuPage() {
  const user = await requireUser();
  const restaurants = await getRestaurantsByOwner(user.id);
  if (restaurants.length === 0) redirect("/dashboard/owner/menus");
  return (
    <>
      <PageHeader title="Nueva carta" back={{ href: "/dashboard/owner/menus", label: "Cartas" }} />
      <Panel className="max-w-2xl">
        <MenuForm restaurants={restaurants.map((r) => ({ id: r.id, name: r.name, status: r.status }))} />
      </Panel>
    </>
  );
}
