import { Receipt } from "lucide-react";
import { EmptyState, PageHeader, Panel } from "@/components/dashboard/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatPrice } from "@/lib/format";
import { requireUserWithRole } from "@/lib/session";
import { getSubscriptionsForUser } from "@/server/queries/misc";

export const metadata = { title: "Facturas" };

export default async function InvoicesPage() {
  const user = await requireUserWithRole("OWNER");
  const subs = await getSubscriptionsForUser(user.id);
  const invoices = subs.flatMap((s) => s.invoices.map((i) => ({ ...i, plan: s.plan.name, interval: s.interval }))).sort((a, b) => b.issuedAt.getTime() - a.issuedAt.getTime());

  return (
    <>
      <PageHeader title="Facturas" description="Facturas simplificadas con el IVA desglosado al 21 %." />
      {invoices.length === 0 ? (
        <EmptyState icon={Receipt} title="Sin facturas" text="Se generan al activar un plan." action={{ href: "/dashboard/owner/subscription", label: "Ver planes" }} />
      ) : (
        <Panel>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead className="text-right">Base</TableHead>
                  <TableHead className="text-right">IVA</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-mono text-xs">{i.number}</TableCell>
                    <TableCell>{formatDate(i.issuedAt)}</TableCell>
                    <TableCell>
                      Plan {i.plan} ({i.interval === "monthly" ? "mensual" : "anual"})
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatPrice(i.amountSubtotal)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatPrice(i.taxAmount)}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{formatPrice(i.total)}</TableCell>
                    <TableCell>{i.status === "PAID" ? "Pagada" : i.status === "VOID" ? "Anulada" : "Reembolsada"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {user.billingName && (
            <p className="mt-4 text-xs text-muted-foreground">
              Facturado a {user.billingName}, {user.taxId}, {user.billingAddress}.
            </p>
          )}
        </Panel>
      )}
    </>
  );
}
