"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { activateSubscriptionAction, updateBillingAction } from "@/server/actions/account";

type Plan = { id: string; slug: string; name: string; description: string | null; priceMonthly: number; priceAnnual: number; maxRestaurants: number; maxMenus: number; maxDishesPerMenu: number };
type Props = { plans: Plan[]; currentPlanSlug: string | null; preselect?: string; billing: { billingName: string; taxId: string; billingAddress: string }; hasBilling: boolean };

export function SubscriptionPanel({ plans, currentPlanSlug, preselect, billing, hasBilling }: Props) {
  const router = useRouter();
  const [planId, setPlanId] = useState(plans.find((p) => p.slug === preselect)?.id ?? plans[1]?.id ?? plans[0]?.id ?? "");
  const [interval, setInterval] = useState<"monthly" | "annual">("monthly");
  const [coupon, setCoupon] = useState("");
  const [b, setB] = useState(billing);
  const [pending, start] = useTransition();
  const plan = plans.find((p) => p.id === planId);

  function saveBilling(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await updateBillingAction(b);
      if (res.success) {
        toast.success("Datos de facturación guardados");
        router.refresh();
      } else toast.error(res.error);
    });
  }

  function activate() {
    start(async () => {
      const res = await activateSubscriptionAction({ planId, interval, couponCode: coupon.trim() || undefined });
      if (res.success) {
        toast.success("Plan activado. Ya tienes la factura en Facturas.");
        router.refresh();
      } else toast.error(res.error);
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Elige un plan</h2>
          <p className="text-sm text-muted-foreground">Activación simulada (proyecto académico): no se cobra nada, pero la suscripción y la factura se generan de verdad.</p>
          <div role="radiogroup" aria-label="Plan" className="mt-4 grid gap-3 sm:grid-cols-3">
            {plans.map((p) => (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={planId === p.id}
                onClick={() => setPlanId(p.id)}
                className={cn("rounded-xl border p-4 text-left transition-colors duration-(--duration-fast)", planId === p.id ? "border-primary bg-brand-soft" : "hover:border-foreground/40")}
              >
                <p className="font-semibold">
                  {p.name}
                  {p.slug === currentPlanSlug && <span className="ml-2 text-xs font-normal text-primary">actual</span>}
                </p>
                <p className="mt-1 font-display text-2xl">{formatPrice(interval === "monthly" ? p.priceMonthly : p.priceAnnual)}</p>
                <p className="text-xs text-muted-foreground">
                  {p.maxRestaurants} rest. · {p.maxMenus} cartas · {p.maxDishesPerMenu} platos/carta
                </p>
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div role="group" aria-label="Periodo" className="inline-flex rounded-lg border p-0.5">
            {(["monthly", "annual"] as const).map((i) => (
              <button key={i} type="button" aria-pressed={interval === i} onClick={() => setInterval(i)} className={cn("rounded-md px-3 py-1.5 text-sm font-medium", interval === i ? "bg-secondary text-secondary-foreground" : "text-muted-foreground")}>
                {i === "monthly" ? "Mensual" : "Anual"}
              </button>
            ))}
          </div>
          <div>
            <Label htmlFor="coupon">Cupón</Label>
            <Input id="coupon" value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} className="mt-1.5 w-40" placeholder="Opcional" />
          </div>
          <Button size="lg" onClick={activate} disabled={pending || !plan || !hasBilling}>
            {pending ? "Activando…" : plan ? `Activar ${plan.name} por ${formatPrice(interval === "monthly" ? plan.priceMonthly : plan.priceAnnual)}` : "Elige un plan"}
          </Button>
        </div>
        {!hasBilling && <p className="text-sm text-destructive">Rellena los datos de facturación antes de activar un plan.</p>}
      </div>

      <form onSubmit={saveBilling} className="space-y-3 rounded-xl bg-muted/70 p-4">
        <h2 className="font-semibold">Datos de facturación</h2>
        <div>
          <Label htmlFor="billingName">Razón social o nombre</Label>
          <Input id="billingName" required value={b.billingName} onChange={(e) => setB({ ...b, billingName: e.target.value })} className="mt-1.5 bg-background" />
        </div>
        <div>
          <Label htmlFor="taxId">NIF / CIF</Label>
          <Input id="taxId" required value={b.taxId} onChange={(e) => setB({ ...b, taxId: e.target.value })} className="mt-1.5 bg-background" />
        </div>
        <div>
          <Label htmlFor="billingAddress">Dirección fiscal</Label>
          <Input id="billingAddress" required value={b.billingAddress} onChange={(e) => setB({ ...b, billingAddress: e.target.value })} className="mt-1.5 bg-background" />
        </div>
        <Button type="submit" variant="outline" disabled={pending}>
          Guardar datos
        </Button>
      </form>
    </div>
  );
}
