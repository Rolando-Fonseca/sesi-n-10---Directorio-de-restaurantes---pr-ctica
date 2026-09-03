import Link from "next/link";
import type { ReactNode } from "react";
import type { RestaurantStatus, WebhookDeliveryStatus } from "@prisma/client";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PageHeader({ title, description, action, back }: { title: string; description?: string; action?: ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {back && (
          <Link href={back.href} className="text-sm text-muted-foreground hover:text-foreground">
            ← {back.label}
          </Link>
        )}
        <h1 className="font-display text-h2">{title}</h1>
        {description && <p className="mt-1 text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 gap-2">{action}</div>}
    </div>
  );
}

export function StatCard({ label, value, hint, icon: Icon, tone = "default" }: { label: string; value: string | number; hint?: string; icon?: LucideIcon; tone?: "default" | "primary" | "warning" }) {
  return (
    <div className={cn("rounded-2xl bg-background p-5 ring-1 ring-border", tone === "primary" && "bg-brand-soft ring-brand/40", tone === "warning" && "bg-accent/15 ring-accent/50")}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        {Icon && <Icon className="size-4 text-muted-foreground" aria-hidden="true" />}
      </div>
      <p className="mt-2 font-display text-4xl tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

const STATUS: Record<RestaurantStatus, { label: string; className: string }> = {
  PENDING: { label: "Pendiente", className: "bg-accent/20 text-foreground ring-accent/60" },
  APPROVED: { label: "Publicado", className: "bg-emerald-50 text-emerald-800 ring-emerald-200" },
  REJECTED: { label: "Rechazado", className: "bg-destructive/10 text-destructive ring-destructive/30" },
  ARCHIVED: { label: "Archivado", className: "bg-muted text-muted-foreground ring-border" },
};

export function StatusBadge({ status }: { status: RestaurantStatus }) {
  const s = STATUS[status];
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1", s.className)}>{s.label}</span>;
}

const DELIVERY: Record<WebhookDeliveryStatus, string> = {
  PENDING: "bg-accent/20 text-foreground ring-accent/60",
  DELIVERED: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  FAILED: "bg-destructive/10 text-destructive ring-destructive/30",
};

export function DeliveryBadge({ status }: { status: WebhookDeliveryStatus }) {
  const label = { PENDING: "Pendiente", DELIVERED: "Entregado", FAILED: "Fallido" }[status];
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1", DELIVERY[status])}>{label}</span>;
}

export function EmptyState({ icon: Icon, title, text, action }: { icon: LucideIcon; title: string; text: string; action?: { href: string; label: string } }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed bg-background/60 px-6 py-14 text-center">
      <Icon className="size-9 text-muted-foreground" aria-hidden="true" />
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>
      {action && (
        <Button asChild className="mt-6">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}

export function Panel({ title, description, children, className, action }: { title?: string; description?: string; children: ReactNode; className?: string; action?: ReactNode }) {
  return (
    <section className={cn("rounded-2xl bg-background p-5 ring-1 ring-border lg:p-6", className)}>
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
