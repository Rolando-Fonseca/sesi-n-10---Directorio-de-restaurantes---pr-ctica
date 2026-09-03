import { ActionButton } from "@/components/dashboard/action-button";
import { SubscriptionPanel } from "@/components/dashboard/owner/subscription-panel";
import { PageHeader, Panel, StatCard } from "@/components/dashboard/ui";
import { formatDate, formatPrice } from "@/lib/format";
import { requireUserWithRole } from "@/lib/session";
import { cancelSubscriptionAction } from "@/server/actions/account";
import { getActivePlans, getSubscriptionsForUser } from "@/server/queries/misc";
import { getOwnerLimits } from "@/server/services/subscriptions";

export const metadata = { title: "Plan y facturación" };

export default async function SubscriptionPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const { plan } = await searchParams;
  const user = await requireUserWithRole("OWNER");
  const [plans, subs, limits] = await Promise.all([getActivePlans(), getSubscriptionsForUser(user.id), getOwnerLimits(user)]);
  const active = subs.find((s) => s.id === limits.subscriptionId) ?? null;
  const hasBilling = Boolean(user.billingName && user.taxId && user.billingAddress);

  return (
    <>
      <PageHeader title="Plan y facturación" description="Tu plan actual, sus límites y la activación de uno nuevo." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Plan actual" value={limits.planName} hint={active ? `hasta ${formatDate(active.currentPeriodEnd ?? active.endDate)}` : "sin suscripción"} tone="primary" />
        <StatCard label="Restaurantes permitidos" value={limits.maxRestaurants === Infinity ? "∞" : limits.maxRestaurants} />
        <StatCard label="Cartas permitidas" value={limits.maxMenus === Infinity ? "∞" : limits.maxMenus} hint={`${limits.maxDishesPerMenu === Infinity ? "∞" : limits.maxDishesPerMenu} platos por carta`} />
      </div>
      {active && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-background p-4 ring-1 ring-border">
          <p className="text-sm">
            Suscripción <strong>{active.plan.name}</strong> {active.interval === "monthly" ? "mensual" : "anual"} por {formatPrice(active.amount)}. Estado: {active.status === "ACTIVE" ? "activa" : active.status.toLowerCase()}.
          </p>
          <ActionButton action={cancelSubscriptionAction} payload={{ id: active.id }} variant="outline" size="sm" successMessage="Suscripción cancelada" confirm={{ title: "¿Cancelar la suscripción?", description: "Volverás al plan gratuito. Los restaurantes que superen el límite no se borran, pero no podrás crear más." }}>
            Cancelar suscripción
          </ActionButton>
        </div>
      )}
      <Panel className="mt-6">
        <SubscriptionPanel
          plans={plans.map((p) => ({ id: p.id, slug: p.slug, name: p.name, description: p.description, priceMonthly: p.priceMonthly, priceAnnual: p.priceAnnual, maxRestaurants: p.maxRestaurants, maxMenus: p.maxMenus, maxDishesPerMenu: p.maxDishesPerMenu }))}
          currentPlanSlug={active?.plan.slug ?? null}
          preselect={plan}
          billing={{ billingName: user.billingName ?? "", taxId: user.taxId ?? "", billingAddress: user.billingAddress ?? "" }}
          hasBilling={hasBilling}
        />
      </Panel>
    </>
  );
}
