import Image from "next/image";
import { Award } from "lucide-react";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { PageHeader, Panel, StatCard } from "@/components/dashboard/ui";
import { LEVEL_THRESHOLDS } from "@/lib/points";
import { formatDate } from "@/lib/format";
import { requireUser } from "@/lib/session";
import { getTaxonomies } from "@/server/queries/taxonomies";
import { getUserProfile } from "@/server/queries/users";

export const metadata = { title: "Perfil" };

export default async function ProfilePage() {
  const session = await requireUser();
  const [profile, allergens, restaurantTax] = await Promise.all([getUserProfile(session.id), getTaxonomies("MENU_ALLERGEN"), getTaxonomies("RESTAURANT")]);
  if (!profile) return null;
  const preferences = restaurantTax.filter((t) => t.order >= 40);
  const nextThreshold = LEVEL_THRESHOLDS[profile.level] ?? null;
  const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.email;

  return (
    <>
      <PageHeader title="Perfil" description="Tus datos, tus alérgenos y tu progreso." />
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <Panel>
            <div className="flex items-center gap-4">
              {profile.imageUrl ? (
                <Image src={profile.imageUrl} alt="" width={56} height={56} className="size-14 rounded-full object-cover" />
              ) : (
                <span className="flex size-14 items-center justify-center rounded-full bg-brand-soft text-xl font-semibold text-primary">{name.slice(0, 1)}</span>
              )}
              <div>
                <p className="text-lg font-semibold">{name}</p>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
                <p className="text-xs text-muted-foreground">Miembro desde {formatDate(profile.createdAt)}. Nombre y foto se editan desde el menú de tu cuenta (arriba a la derecha).</p>
              </div>
            </div>
          </Panel>
          <Panel>
            <ProfileForm
              phone={profile.phone ?? ""}
              preferenceIds={profile.preferences.map((p) => p.taxonomy.id)}
              allergenIds={profile.userAllergens.map((a) => a.allergen.id)}
              preferences={preferences}
              allergens={allergens}
            />
          </Panel>
        </div>

        <div className="space-y-4">
          <StatCard label="Nivel" value={profile.level} hint={nextThreshold ? `${profile.points} de ${nextThreshold} puntos para el siguiente` : `${profile.points} puntos, nivel máximo`} tone="primary" />
          <Panel title="Insignias">
            {profile.badges.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todavía ninguna. La primera llega con tu primera reseña.</p>
            ) : (
              <ul className="space-y-2">
                {profile.badges.map((b) => (
                  <li key={b.badge.id} className="flex items-center gap-2 text-sm">
                    <Award className="size-4 text-accent" aria-hidden="true" />
                    <span className="font-medium">{b.badge.name}</span>
                    <span className="text-muted-foreground">· {b.badge.description}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          <Panel title="Últimos puntos">
            {profile.pointTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Escribe una reseña o guarda un plato para empezar.</p>
            ) : (
              <ul className="space-y-1.5 text-sm">
                {profile.pointTransactions.slice(0, 8).map((t) => (
                  <li key={t.id} className="flex justify-between">
                    <span className="text-muted-foreground">{REASON_LABEL[t.reason] ?? t.reason}</span>
                    <span className="font-semibold tabular-nums">+{t.points}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}

const REASON_LABEL: Record<string, string> = {
  REVIEW_CREATED: "Reseña publicada",
  REVIEW_WITH_PHOTOS: "Reseña con fotos",
  PROFILE_COMPLETED: "Perfil completado",
  WISHLIST_CREATED: "Plato guardado",
  FIRST_REVIEW: "Primera reseña",
};
