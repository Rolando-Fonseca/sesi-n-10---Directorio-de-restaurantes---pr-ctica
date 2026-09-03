import type { WebhookDeliveryStatus } from "@prisma/client";
import Link from "next/link";
import { RotateCw, Send } from "lucide-react";
import { ActionButton } from "@/components/dashboard/action-button";
import { DeliveryBadge, PageHeader, Panel } from "@/components/dashboard/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { env } from "@/lib/env";
import { timeAgo } from "@/lib/format";
import { requireUserWithRole } from "@/lib/session";
import { cn } from "@/lib/utils";
import { retryWebhookDeliveryAction, sendTestWebhookAction } from "@/server/actions/admin";
import { getWebhookDeliveries } from "@/server/queries/misc";

export const metadata = { title: "Webhooks y eventos" };

const FILTERS: { key: WebhookDeliveryStatus | "ALL"; label: string }[] = [
  { key: "ALL", label: "Todas" },
  { key: "DELIVERED", label: "Entregadas" },
  { key: "FAILED", label: "Fallidas" },
  { key: "PENDING", label: "Pendientes" },
];

export default async function AdminWebhooksPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  await requireUserWithRole("ADMIN");
  const sp = await searchParams;
  const status = (FILTERS.some((f) => f.key === sp.status) ? sp.status : "ALL") as WebhookDeliveryStatus | "ALL";
  const urls = env.webhookUrls();
  const result = await getWebhookDeliveries(status === "ALL" ? undefined : status, Number(sp.page) || 1, 40);

  return (
    <>
      <PageHeader
        title="Webhooks y eventos"
        description="Cada evento del sistema se envía firmado a las URLs configuradas. Aquí se audita la entrega. Contrato en docs/api.md."
        action={
          <ActionButton action={sendTestWebhookAction} payload={{}} disabled={urls.length === 0} successMessage="Evento de prueba enviado; refresca en unos segundos para ver la entrega">
            <Send data-icon="inline-start" /> Enviar evento de prueba
          </ActionButton>
        }
      />
      <Panel className="mb-6" title="Destinos configurados" description="Variable WEBHOOK_URLS, separada por comas. Firma con WEBHOOK_SECRET en la cabecera X-Foodzinder-Signature.">
        {urls.length === 0 ? (
          <p className="text-sm text-muted-foreground">Ninguno. Sin destinos no se registran entregas. Para el P5, aquí irá la URL del webhook de n8n.</p>
        ) : (
          <ul className="space-y-1 font-mono text-sm">
            {urls.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        )}
      </Panel>

      <nav aria-label="Estado" className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <Link key={f.key} href={`/dashboard/admin/webhooks?status=${f.key}`} aria-current={status === f.key ? "page" : undefined} className={cn("rounded-full border px-3 py-1.5 text-sm font-medium", status === f.key ? "border-foreground bg-foreground text-background" : "bg-background hover:border-foreground/40")}>
            {f.label}
          </Link>
        ))}
      </nav>
      <Panel>
        {result.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin entregas registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evento</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Intentos</TableHead>
                  <TableHead>Última respuesta</TableHead>
                  <TableHead>Cuándo</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.items.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono text-xs">{d.event}</TableCell>
                    <TableCell className="max-w-56 truncate font-mono text-xs" title={d.url}>
                      {d.url}
                    </TableCell>
                    <TableCell>
                      <DeliveryBadge status={d.status} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{d.attempts}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{d.lastStatus ?? d.lastError ?? "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{timeAgo(d.createdAt)}</TableCell>
                    <TableCell>
                      {d.status !== "DELIVERED" && (
                        <ActionButton action={retryWebhookDeliveryAction} payload={{ id: d.id }} variant="ghost" size="sm" successMessage="Reintento ejecutado">
                          <RotateCw data-icon="inline-start" /> Reintentar
                        </ActionButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {result.pages > 1 && (
          <p className="mt-4 text-sm text-muted-foreground">
            Página {result.page} de {result.pages}.{" "}
            {result.page < result.pages && (
              <Link href={`/dashboard/admin/webhooks?status=${status}&page=${result.page + 1}`} className="font-medium text-primary hover:underline">
                Siguiente
              </Link>
            )}
          </p>
        )}
      </Panel>
    </>
  );
}
