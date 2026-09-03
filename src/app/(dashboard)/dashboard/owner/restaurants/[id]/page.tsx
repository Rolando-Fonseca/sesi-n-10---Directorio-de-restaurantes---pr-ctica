import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { ActionButton } from "@/components/dashboard/action-button";
import { RestaurantForm } from "@/components/dashboard/owner/restaurant-form";
import { PageHeader, Panel, StatusBadge } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/session";
import { deleteRestaurantAction, ownerTransitionAction } from "@/server/actions/restaurants";
import { getOwnedRestaurant } from "@/server/queries/restaurants";
import { getRestaurantTaxonomyGroups } from "@/server/queries/taxonomies";

export const metadata = { title: "Editar restaurante" };

export default async function EditRestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const [r, groups] = await Promise.all([getOwnedRestaurant(user.id, id, user.role === "ADMIN"), getRestaurantTaxonomyGroups()]);
  if (!r) notFound();

  return (
    <>
      <PageHeader
        title={r.name}
        description={STATUS_TEXT[r.status]}
        back={{ href: "/dashboard/owner/restaurants", label: "Restaurantes" }}
        action={
          <>
            {r.status === "APPROVED" && (
              <Button asChild variant="outline">
                <Link href={`/restaurant/${r.slug}`} target="_blank">
                  Ver ficha pública <ExternalLink data-icon="inline-end" />
                </Link>
              </Button>
            )}
            {r.status === "REJECTED" && (
              <ActionButton action={ownerTransitionAction} payload={{ id: r.id, to: "PENDING" }} successMessage="Enviado de nuevo a revisión">
                Reenviar a revisión
              </ActionButton>
            )}
            {r.status === "APPROVED" && (
              <ActionButton action={ownerTransitionAction} payload={{ id: r.id, to: "ARCHIVED" }} variant="outline" successMessage="Restaurante archivado" confirm={{ title: "¿Archivar este restaurante?", description: "Dejará de verse en el directorio. Puedes restaurarlo cuando quieras." }}>
                Archivar
              </ActionButton>
            )}
            {r.status === "ARCHIVED" && (
              <ActionButton action={ownerTransitionAction} payload={{ id: r.id, to: "APPROVED" }} successMessage="Restaurante restaurado">
                Volver a publicar
              </ActionButton>
            )}
          </>
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <StatusBadge status={r.status} />
        {r.status === "REJECTED" && r.rejectionReason && <p className="text-sm text-destructive">Motivo del rechazo: {r.rejectionReason}</p>}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <Panel>
          <RestaurantForm
            groups={groups}
            isOwnerAlready
            initial={{
              id: r.id,
              name: r.name,
              description: r.description ?? "",
              address: r.address,
              city: r.city ?? "",
              postalCode: r.postalCode ?? "",
              phone: r.phone ?? "",
              website: r.website ?? "",
              priceRange: r.priceRange ?? "",
              latitude: r.latitude,
              longitude: r.longitude,
              taxonomyIds: r.taxonomies.map((t) => t.taxonomyId),
            }}
          />
        </Panel>
        <div className="space-y-4">
          <Panel title="Cartas asignadas">
            {r.menus.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ninguna todavía.</p>
            ) : (
              <ul className="space-y-1.5 text-sm">
                {r.menus.map((m) => (
                  <li key={m.menu.id} className="flex justify-between">
                    <Link href={`/dashboard/owner/menus/${m.menu.id}`} className="font-medium hover:underline">
                      {m.menu.title}
                    </Link>
                    <span className="text-muted-foreground">{m.menu._count.dishes} platos</span>
                  </li>
                ))}
              </ul>
            )}
            <Button asChild variant="link" size="sm" className="mt-2 px-0">
              <Link href="/dashboard/owner/menus/new">Crear una carta</Link>
            </Button>
          </Panel>
          <Panel title="Zona peligrosa">
            <p className="text-sm text-muted-foreground">Borrar elimina también sus categorías, reseñas y platos guardados por usuarios.</p>
            <ActionButton
              action={deleteRestaurantAction}
              payload={{ id: r.id }}
              variant="destructive"
              className="mt-3"
              successMessage="Restaurante borrado"
              confirm={{ title: `¿Borrar ${r.name}?`, description: "Esta acción no se puede deshacer.", confirmLabel: "Borrar definitivamente" }}
            >
              Borrar restaurante
            </ActionButton>
          </Panel>
        </div>
      </div>
    </>
  );
}

const STATUS_TEXT = {
  PENDING: "En revisión. Te avisaremos cuando un administrador lo apruebe.",
  APPROVED: "Publicado en el directorio.",
  REJECTED: "Rechazado. Corrige lo indicado y reenvíalo.",
  ARCHIVED: "Archivado. No aparece en el directorio.",
} as const;
