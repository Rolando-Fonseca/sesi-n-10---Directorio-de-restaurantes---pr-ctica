import type { UserRole } from "@prisma/client";
import type { NavGroup } from "./shell";

// Los iconos se indican por nombre: este módulo lo lee un Server Component y
// una función (el componente del icono) no puede cruzar al Client Component.
// El mapa nombre → icono vive en shell.tsx.

const ACCOUNT: NavGroup = {
  title: "Cuenta",
  items: [
    { href: "/dashboard/profile", label: "Perfil y alérgenos", icon: "user" },
    { href: "/dashboard/notifications", label: "Notificaciones", icon: "bell" },
  ],
};

const USER: NavGroup = {
  title: "Mi Foodzinder",
  items: [
    { href: "/dashboard/user", label: "Resumen", icon: "dashboard", exact: true },
    { href: "/dashboard/user/wishlist", label: "Platos guardados", icon: "heart" },
    { href: "/dashboard/user/reviews", label: "Mis reseñas", icon: "message" },
  ],
};

const OWNER: NavGroup = {
  title: "Mi negocio",
  items: [
    { href: "/dashboard/owner", label: "Resumen", icon: "dashboard", exact: true },
    { href: "/dashboard/owner/restaurants", label: "Restaurantes", icon: "store" },
    { href: "/dashboard/owner/menus", label: "Cartas y platos", icon: "chef" },
    { href: "/dashboard/owner/reviews", label: "Reseñas recibidas", icon: "message" },
    { href: "/dashboard/owner/subscription", label: "Plan y facturación", icon: "card" },
    { href: "/dashboard/owner/invoices", label: "Facturas", icon: "receipt" },
  ],
};

const ADMIN: NavGroup = {
  title: "Administración",
  items: [
    { href: "/dashboard/admin", label: "Resumen", icon: "dashboard", exact: true },
    { href: "/dashboard/admin/restaurants", label: "Restaurantes", icon: "clipboard" },
    { href: "/dashboard/admin/users", label: "Usuarios y roles", icon: "users" },
    { href: "/dashboard/admin/taxonomies", label: "Taxonomías", icon: "shapes" },
    { href: "/dashboard/admin/reviews", label: "Reseñas", icon: "file" },
    { href: "/dashboard/admin/webhooks", label: "Webhooks y eventos", icon: "webhook" },
  ],
};

export function navForRole(role: UserRole): NavGroup[] {
  if (role === "ADMIN") return [ADMIN, OWNER, USER, ACCOUNT];
  if (role === "OWNER") return [OWNER, USER, ACCOUNT];
  return [USER, ACCOUNT];
}

export const ROLE_LABEL: Record<UserRole, string> = { ADMIN: "Administración", OWNER: "Cuenta de dueño", USER: "Cuenta personal" };
