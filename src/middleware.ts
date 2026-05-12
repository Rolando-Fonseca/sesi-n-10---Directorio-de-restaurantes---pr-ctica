import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isDashboardRoute = createRouteMatcher(["/dashboard/(.*)"]);
const isAdminRoute = createRouteMatcher(["/dashboard/admin/(.*)"]);
const isOwnerRoute = createRouteMatcher(["/dashboard/owner/(.*)"]);
const isApiWebhook = createRouteMatcher(["/api/webhooks/(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isApiWebhook(req)) return;

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
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?)).*)",
  ],
};
