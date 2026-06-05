import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET() {
  const host = (await headers()).get("host") ?? "localhost:3000";
  const proto = (await headers()).get("x-forwarded-proto") ?? "http";
  const response = NextResponse.redirect(new URL("/auth", `${proto}://${host}`));
  response.cookies.set("next-auth.session-token", "", { maxAge: 0, path: "/" });
  response.cookies.set("__Secure-next-auth.session-token", "", { maxAge: 0, path: "/" });
  response.cookies.set("next-auth.csrf-token", "", { maxAge: 0, path: "/" });
  response.cookies.set("__Host-next-auth.csrf-token", "", { maxAge: 0, path: "/" });
  return response;
}
