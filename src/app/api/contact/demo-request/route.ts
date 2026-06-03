import { NextResponse } from "next/server";
import { createServiceClient } from "@/services/supabase-server";

const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW = 10 * 60 * 1000;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const now = Date.now();
  const lastRequest = rateLimitMap.get(ip);

  if (lastRequest && now - lastRequest < RATE_LIMIT_WINDOW) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { fullName, role, facilityName, whatsappNumber, state } = body;

    if (!fullName?.trim() || !role?.trim() || !facilityName?.trim() || !whatsappNumber?.trim() || !state?.trim()) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (typeof fullName !== "string" || fullName.length > 200) {
      return NextResponse.json({ error: "Invalid full name" }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { error } = await supabase
      .from("demo_requests")
      .insert({
        full_name: fullName.trim(),
        role: role.trim(),
        facility_name: facilityName.trim(),
        whatsapp_number: whatsappNumber.trim(),
        state: state.trim(),
      });

    if (error) {
      return NextResponse.json({ error: "Database insertion failed" }, { status: 500 });
    }

    rateLimitMap.set(ip, now);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
