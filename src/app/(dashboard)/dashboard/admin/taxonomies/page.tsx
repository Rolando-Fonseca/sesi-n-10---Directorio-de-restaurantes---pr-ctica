import { TaxonomyManager } from "@/components/dashboard/admin/taxonomy-manager";
import { PageHeader } from "@/components/dashboard/ui";
import { requireUserWithRole } from "@/lib/session";
import { getAllTaxonomiesForAdmin } from "@/server/queries/taxonomies";

export const metadata = { title: "Taxonomías" };

export default async function AdminTaxonomiesPage() {
  await requireUserWithRole("ADMIN");
  const items = await getAllTaxonomiesForAdmin();
  return (
    <>
      <PageHeader title="Taxonomías" description="Cocinas, tipos de local, características, presentaciones, alérgenos y categorías globales. Solo el administrador las edita; los dueños las eligen." />
      <TaxonomyManager items={items.map((t) => ({ id: t.id, scope: t.scope, name: t.name, slug: t.slug, order: t.order, isActive: t.isActive, uses: t._count.restaurants + t._count.dishTaxonomies + t._count.menuCategories }))} />
    </>
  );
}
