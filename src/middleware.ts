import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isDashboardRoute = createRouteMatcher(["/dashboard/(.*)"]);
const isAdminRoute = createRouteMatcher(["/dashboard/admin/(.*)"]);
const isOwnerRoute = createRouteMatcher(["/dashboard/owner/(.*)"]);
// La puerta para convertirse en dueño: cualquier usuario identificado puede dar de alta su primer restaurante.
const isBecomeOwnerRoute = createRouteMatcher(["/dashboard/owner/restaurants/new"]);
const isApiRoute = createRouteMatcher(["/api/(.*)"]); // webhooks entrantes y API v1: sin sesión de Clerk

/**
 * El middleware solo exige sesión y hace un atajo por rol cuando el claim
 * publicMetadata.role viene en el token (ADR-0002). La comprobación
 * definitiva la hacen las páginas con el rol de la base de datos
 * (requireUserWithRole), porque el claim puede faltar si la plantilla de
 * sesión de Clerk no se ha personalizado.
 */
export default clerkMiddleware(async (auth, req) => {
  if (isApiRoute(req)) return;

  if (isDashboardRoute(req)) {
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      const signIn = new URL("/sign-in", req.url);
      signIn.searchParams.set("redirect_url", req.nextUrl.pathname + req.nextUrl.search);
      return NextResponse.redirect(signIn);
    }

    const metadata = sessionClaims?.publicMetadata as Record<string, unknown> | undefined;
    const role = metadata?.role as string | undefined;
    if (isAdminRoute(req) && role && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    if (isOwnerRoute(req) && !isBecomeOwnerRoute(req) && role && role !== "OWNER" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }
});

export const config = {
  matcher: [
    // Sin /api: la API v1 y los webhooks entrantes no llevan sesión de Clerk y
    // no deben pasar por su handshake (en instancias de desarrollo redirige las
    // peticiones de navegador a accounts.dev, lo que rompía abrir /api/v1 a mano).
    "/((?!api|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?)).*)",
  ],
};
