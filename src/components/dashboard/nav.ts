import type { UserRole } from "@prisma/client";
import { Bell, ChefHat, ClipboardCheck, CreditCard, FileText, Heart, LayoutDashboard, MessageSquare, Receipt, Shapes, Store, User, Users, Webhook } from "lucide-react";
import type { NavGroup } from "./shell";

const ACCOUNT: NavGroup = {
  title: "Cuenta",
  items: [
    { href: "/dashboard/profile", label: "Perfil y alérgenos", icon: User },
    { href: "/dashboard/notifications", label: "Notificaciones", icon: Bell },
  ],
};

const USER: NavGroup = {
  title: "Mi Foodzinder",
  items: [
    { href: "/dashboard/user", label: "Resumen", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/user/wishlist", label: "Platos guardados", icon: Heart },
    { href: "/dashboard/user/reviews", label: "Mis reseñas", icon: MessageSquare },
  ],
};

const OWNER: NavGroup = {
  title: "Mi negocio",
  items: [
    { href: "/dashboard/owner", label: "Resumen", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/owner/restaurants", label: "Restaurantes", icon: Store },
    { href: "/dashboard/owner/menus", label: "Cartas y platos", icon: ChefHat },
    { href: "/dashboard/owner/reviews", label: "Reseñas recibidas", icon: MessageSquare },
    { href: "/dashboard/owner/subscription", label: "Plan y facturación", icon: CreditCard },
    { href: "/dashboard/owner/invoices", label: "Facturas", icon: Receipt },
  ],
};

const ADMIN: NavGroup = {
  title: "Administración",
  items: [
    { href: "/dashboard/admin", label: "Resumen", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/admin/restaurants", label: "Restaurantes", icon: ClipboardCheck },
    { href: "/dashboard/admin/users", label: "Usuarios y roles", icon: Users },
    { href: "/dashboard/admin/taxonomies", label: "Taxonomías", icon: Shapes },
    { href: "/dashboard/admin/reviews", label: "Reseñas", icon: FileText },
    { href: "/dashboard/admin/webhooks", label: "Webhooks y eventos", icon: Webhook },
  ],
};

export function navForRole(role: UserRole): NavGroup[] {
  if (role === "ADMIN") return [ADMIN, OWNER, USER, ACCOUNT];
  if (role === "OWNER") return [OWNER, USER, ACCOUNT];
  return [USER, ACCOUNT];
}

export const ROLE_LABEL: Record<UserRole, string> = { ADMIN: "Administración", OWNER: "Cuenta de dueño", USER: "Cuenta personal" };
