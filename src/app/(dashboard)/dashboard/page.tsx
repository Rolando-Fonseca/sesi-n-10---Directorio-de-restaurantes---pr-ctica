import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";

export default async function DashboardPage() {
  const user = await requireUser();
  switch (user.role) {
    case "ADMIN":
      redirect("/dashboard/admin");
    case "OWNER":
      redirect("/dashboard/owner");
    default:
      redirect("/dashboard/user");
  }
}
