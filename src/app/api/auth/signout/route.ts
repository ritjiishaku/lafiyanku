import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET() {
  const host = (await headers()).get("host") ?? "localhost:3000";
  const proto = (await headers()).get("x-forwarded-proto") ?? "http";
  const response = NextResponse.redirect(new URL("/auth", `${proto}://${host}`));
  const cookieNames = [
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "next-auth.csrf-token",
    "__Host-next-auth.csrf-token",
    "__Secure-authjs.session-token",
    "authjs.session-token",
    "__Host-authjs.csrf-token",
    "__Secure-authjs.callback-url",
    "authjs.callback-url",
    "__Secure-authjs.csrf-token",
    "authjs.csrf-token",
  ];
  for (const name of cookieNames) {
    response.cookies.set(name, "", { maxAge: 0, path: "/" });
  }
  return response;
}
