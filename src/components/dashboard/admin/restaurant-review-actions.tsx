"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { ActionButton } from "@/components/dashboard/action-button";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { approveRestaurantAction, reassignRestaurantAction, rejectRestaurantAction } from "@/server/actions/admin";

type Props = {
  restaurantId: string;
  name: string;
  status: string;
  ownerId: string;
  owners?: { id: string; email: string; name: string }[];
  size?: "sm" | "default";
};

/** Aprobar, rechazar con motivo y reasignar dueño. */
export function RestaurantReviewActions({ restaurantId, name, status, ownerId, owners, size = "sm" }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, start] = useTransition();

  function reject(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await rejectRestaurantAction({ restaurantId, reason });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(`${name} rechazado. El dueño recibe el motivo.`);
      setOpen(false);
      setReason("");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "PENDING" && (
        <>
          <ActionButton action={approveRestaurantAction} payload={{ restaurantId }} size={size} successMessage={`${name} publicado`}>
            <Check data-icon="inline-start" /> Aprobar
          </ActionButton>
          <Button variant="outline" size={size} onClick={() => setOpen(true)}>
            <X data-icon="inline-start" /> Rechazar
          </Button>
        </>
      )}
      {owners && (
        <Select
          value={ownerId}
          onValueChange={(v) =>
            start(async () => {
              const res = await reassignRestaurantAction({ restaurantId, ownerId: v });
              if (res.success) {
                toast.success("Dueño reasignado");
                router.refresh();
              } else toast.error(res.error);
            })
          }
        >
          <SelectTrigger size={size === "sm" ? "sm" : "default"} aria-label="Dueño" className="w-56" disabled={pending}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {owners.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.name} · {o.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar {name}</DialogTitle>
            <DialogDescription>El motivo se envía al dueño, que podrá corregir la ficha y reenviarla.</DialogDescription>
          </DialogHeader>
          <form onSubmit={reject} className="space-y-4">
            <div>
              <Label htmlFor="reason">Motivo</Label>
              <Textarea id="reason" required minLength={10} maxLength={1000} rows={4} value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1.5" placeholder="Qué falta o qué no cuadra." />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="destructive" disabled={pending || reason.trim().length < 10}>
                {pending ? "Enviando…" : "Rechazar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
