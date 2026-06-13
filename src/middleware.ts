import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicPaths = [
  "/_next",
  "/favicon",
  "/og-image",
  "/login",
  "/facility",
  "/api/auth",
  "/api/facilities",
  "/api/contact",
  "/api/demo",
  "/api/health",
  "/contact",
  "/demo",
  "/",
];

export const middleware = auth((req) => {
  const path = req.nextUrl.pathname;
  if (publicPaths.some((p) => path === p || path.startsWith(p))) {
    return NextResponse.next();
  }
  if (!req.auth) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/|_next|favicon|og-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
