"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { setUserRoleAction } from "@/server/actions/admin";

const ROLES = [
  ["USER", "Usuario"],
  ["OWNER", "Dueño"],
  ["ADMIN", "Administrador"],
] as const;

export function RoleSelect({ userId, role, disabled }: { userId: string; role: string; disabled?: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Select
      value={role}
      onValueChange={(v) =>
        start(async () => {
          const res = await setUserRoleAction({ userId, role: v });
          if (res.success) {
            toast.success("Rol actualizado en Clerk y en la base de datos");
            router.refresh();
          } else toast.error(res.error);
        })
      }
    >
      <SelectTrigger size="sm" className="w-40" aria-label="Rol" disabled={disabled || pending}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ROLES.map(([v, l]) => (
          <SelectItem key={v} value={v}>
            {l}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
