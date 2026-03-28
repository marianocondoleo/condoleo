// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isProtectedRoute = createRouteMatcher([
  "/solicitar(.*)", "/mis-solicitudes(.*)", "/perfil(.*)"
]);
export default clerkMiddleware(async (auth, request) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as any)?.role;

  // Si va a /sign-in o /sign-up y ya está logueado como admin → redirigir a /admin
  if (userId && role === "admin" && request.nextUrl.pathname.startsWith("/sign-in")) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (isAdminRoute(request)) {
    if (!userId) return NextResponse.redirect(new URL("/sign-in", request.url));
    if (role !== "admin") return NextResponse.redirect(new URL("/", request.url));
  }

  if (isProtectedRoute(request)) {
    if (!userId) return NextResponse.redirect(new URL("/sign-in", request.url));
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};