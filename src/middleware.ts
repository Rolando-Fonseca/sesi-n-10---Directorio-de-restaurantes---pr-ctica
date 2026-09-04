import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isDashboardRoute = createRouteMatcher(["/dashboard/(.*)"]);
const isAdminRoute = createRouteMatcher(["/dashboard/admin/(.*)"]);
const isOwnerRoute = createRouteMatcher(["/dashboard/owner/(.*)"]);
const isApiRoute = createRouteMatcher(["/api/(.*)"]); // webhooks entrantes y API v1: sin sesión de Clerk

export default clerkMiddleware(async (auth, req) => {
  if (isApiRoute(req)) return;

  if (isDashboardRoute(req)) {
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    const metadata = sessionClaims?.publicMetadata as Record<string, unknown> | undefined;
    const role = metadata?.role as string | undefined;
    if (isAdminRoute(req) && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    if (isOwnerRoute(req) && role !== "OWNER" && role !== "ADMIN") {
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
