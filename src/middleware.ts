import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  if (!req.auth) {
    const url = new URL("/auth/login", req.url);
    url.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/discharge/:path*",
    "/audit/:path*",
    "/settings/:path*",
    "/api/discharge/:path*",
    "/api/audit/:path*",
    "/api/translation/:path*",
  ],
};
