import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Routes accessibles sans être connecté
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)", // le webhook Clerk doit être accessible sans session
]);

export default clerkMiddleware(async (auth, request) => {
  // Si la route n'est pas publique, Clerk redirige vers /sign-in automatiquement
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",  // requis par Clerk pour le proxy interne
  ],
};
