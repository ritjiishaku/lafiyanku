import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicPaths = [
  "/_next",
  "/favicon",
  "/og-image",
  "/auth",
  "/api/auth",
  "/api/facilities",
  "/api/contact",
  "/api/demo",
  "/api/health",
  "/pricing",
  "/contact",
  "/demo",
  "/",
];

export const proxy = auth((req) => {
  const path = req.nextUrl.pathname;
  if (publicPaths.some((p) => path === p || path.startsWith(p))) {
    return NextResponse.next();
  }
  if (!req.auth) {
    const url = new URL("/auth", req.url);
    url.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
});
