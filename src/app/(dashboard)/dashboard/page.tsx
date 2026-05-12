import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/sign-in");

  switch (user.role) {
    case "ADMIN":
      redirect("/dashboard/admin");
    case "OWNER":
      redirect("/dashboard/owner");
    default:
      redirect("/dashboard/user");
  }
}
