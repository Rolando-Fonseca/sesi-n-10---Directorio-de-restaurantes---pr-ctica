import Image from "next/image";
import type { UserRole } from "@prisma/client";
import { RoleSelect } from "@/components/dashboard/admin/role-select";
import { PageHeader, Panel } from "@/components/dashboard/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { requireUserWithRole } from "@/lib/session";
import { getUsersForAdmin } from "@/server/queries/users";

export const metadata = { title: "Usuarios y roles" };

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ role?: string; page?: string }> }) {
  const me = await requireUserWithRole("ADMIN");
  const sp = await searchParams;
  const role = ["ADMIN", "OWNER", "USER"].includes(sp.role ?? "") ? (sp.role as UserRole) : undefined;
  const result = await getUsersForAdmin(role, Number(sp.page) || 1, 50);

  return (
    <>
      <PageHeader title="Usuarios y roles" description="Cambiar el rol lo escribe en Clerk y en la base de datos a la vez. Los usuarios de demo (user_seed_*) no existen en Clerk." />
      <Panel>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead className="text-right">Restaurantes</TableHead>
                <TableHead className="text-right">Reseñas</TableHead>
                <TableHead className="text-right">Puntos</TableHead>
                <TableHead>Alta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {u.imageUrl ? <Image src={u.imageUrl} alt="" width={28} height={28} className="size-7 rounded-full object-cover" /> : <span className="size-7 rounded-full bg-brand-soft" aria-hidden="true" />}
                      <div>
                        <p className="font-medium">{[u.firstName, u.lastName].filter(Boolean).join(" ") || "—"}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <RoleSelect userId={u.id} role={u.role} disabled={u.id === me.id} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{u._count.restaurants}</TableCell>
                  <TableCell className="text-right tabular-nums">{u._count.reviews}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {u.points} <span className="text-xs text-muted-foreground">(niv. {u.level})</span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(u.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {result.total} usuarios en total.
        </p>
      </Panel>
    </>
  );
}
