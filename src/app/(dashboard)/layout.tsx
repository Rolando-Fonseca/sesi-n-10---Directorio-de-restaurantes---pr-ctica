import type { Metadata } from "next";
import { navForRole, ROLE_LABEL } from "@/components/dashboard/nav";
import { DashboardShell } from "@/components/dashboard/shell";
import { Toaster } from "@/components/ui/sonner";
import { requireUser } from "@/lib/session";
import { countUnreadNotifications } from "@/server/queries/misc";

export const metadata: Metadata = { title: { default: "Panel", template: "%s | Panel de Foodzinder" }, robots: { index: false, follow: false } };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const unread = await countUnreadNotifications(user.id);
  return (
    <>
      <DashboardShell groups={navForRole(user.role)} roleLabel={ROLE_LABEL[user.role]} unread={unread}>
        {children}
      </DashboardShell>
      <Toaster position="bottom-right" richColors closeButton />
    </>
  );
}
