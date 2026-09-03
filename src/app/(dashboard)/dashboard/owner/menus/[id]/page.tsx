import { notFound } from "next/navigation";
import { ActionButton } from "@/components/dashboard/action-button";
import { DishManager } from "@/components/dashboard/owner/dish-manager";
import { MenuForm } from "@/components/dashboard/owner/menu-form";
import { PageHeader, Panel } from "@/components/dashboard/ui";
import { requireUser } from "@/lib/session";
import { deleteMenuAction } from "@/server/actions/menus";
import { getMenuForEditor } from "@/server/queries/menus";
import { getRestaurantsByOwner } from "@/server/queries/restaurants";
import { getTaxonomies } from "@/server/queries/taxonomies";

export const metadata = { title: "Editar carta" };

export default async function EditMenuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const [menu, restaurants, allergens, presentations] = await Promise.all([
    getMenuForEditor(id, user.id, user.role === "ADMIN"),
    getRestaurantsByOwner(user.id),
    getTaxonomies("MENU_ALLERGEN"),
    getTaxonomies("MENU_PRESENTATION"),
  ]);
  if (!menu) notFound();
  const first = menu.restaurants[0]?.restaurant ?? null;

  return (
    <>
      <PageHeader
        title={menu.title}
        back={{ href: "/dashboard/owner/menus", label: "Cartas" }}
        action={
          <ActionButton action={deleteMenuAction} payload={{ id: menu.id }} variant="destructive" successMessage="Carta borrada" confirm={{ title: `¿Borrar la carta ${menu.title}?`, description: "Se borran también todos sus platos.", confirmLabel: "Borrar" }}>
            Borrar carta
          </ActionButton>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Panel title="Datos de la carta">
          <MenuForm
            restaurants={restaurants.map((r) => ({ id: r.id, name: r.name, status: r.status }))}
            initial={{ id: menu.id, title: menu.title, description: menu.description ?? "", price: menu.price == null ? "" : String(menu.price).replace(".", ","), restaurantIds: menu.restaurants.map((r) => r.restaurant.id) }}
          />
        </Panel>
        <Panel>
          <DishManager
            menuId={menu.id}
            restaurant={first ? { id: first.id, name: first.name, categories: first.menuCategories.map((c) => ({ id: c.id, name: c.name })) } : null}
            dishes={menu.dishes.map((d) => ({ id: d.id, name: d.name, description: d.description, price: d.price, isAvailable: d.isAvailable, isFeatured: d.isFeatured, categoryId: d.categoryId, taxonomyIds: d.taxonomyIds, allergens: d.allergens, presentation: d.presentation }))}
            allergens={allergens}
            presentations={presentations}
          />
        </Panel>
      </div>
    </>
  );
}
