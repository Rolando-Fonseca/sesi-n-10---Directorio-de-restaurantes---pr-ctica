"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ComponentProps, type ReactNode } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { ActionResponse } from "@/types/api";

type Props = Omit<ComponentProps<typeof Button>, "onClick"> & {
  /** Server Action a ejecutar. Se le pasa `payload`. */
  action: (input: unknown) => Promise<ActionResponse<unknown>>;
  payload?: unknown;
  successMessage?: string;
  /** Si se indica, pide confirmación antes de ejecutar. */
  confirm?: { title: string; description?: string; confirmLabel?: string };
  onSuccess?: (data: unknown) => void;
  children: ReactNode;
};

/**
 * Botón que ejecuta una Server Action, muestra el resultado en un toast y
 * refresca la ruta. Con `confirm` abre un diálogo de confirmación antes.
 */
export function ActionButton({ action, payload, successMessage, confirm, onSuccess, children, disabled, ...rest }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);

  const run = () =>
    start(async () => {
      const res = await action(payload);
      if (res.success) {
        if (successMessage) toast.success(successMessage);
        onSuccess?.(res.data);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });

  if (!confirm) {
    return (
      <Button {...rest} disabled={disabled || pending} onClick={run}>
        {children}
      </Button>
    );
  }

  return (
    <>
      <Button {...rest} disabled={disabled || pending} onClick={() => setOpen(true)}>
        {children}
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm.title}</AlertDialogTitle>
            {confirm.description && <AlertDialogDescription>{confirm.description}</AlertDialogDescription>}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={run}>{confirm.confirmLabel ?? "Confirmar"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
