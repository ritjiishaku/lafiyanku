import { NextResponse } from "next/server";
import { createServiceClient } from "@/services/supabase-server";
import { isNigerianPhone, isValidEmail } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, role, facilityName, whatsappNumber, email, state } = body;

    const errors: string[] = [];

    if (!fullName?.trim() || fullName.length > 200) errors.push("Valid full name is required.");
    if (!role?.trim()) errors.push("Role is required.");
    if (!facilityName?.trim()) errors.push("Facility name is required.");
    if (!state?.trim()) errors.push("State is required.");
    if (!whatsappNumber?.trim()) errors.push("WhatsApp number is required.");
    else if (!isNigerianPhone(whatsappNumber.replace(/\s+/g, ""))) errors.push("WhatsApp number must be a valid Nigerian number (e.g. +2348031234567).");
    if (!email?.trim()) errors.push("Email is required.");
    else if (!isValidEmail(email.trim())) errors.push("Valid email is required.");

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { count, error: countError } = await supabase
      .from("demo_requests")
      .select("*", { count: "exact", head: true })
      .eq("whatsapp_number", whatsappNumber.trim())
      .gte("created_at", new Date(Date.now() - 10 * 60 * 1000).toISOString());

    if (countError) {
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    if (count && count > 0) {
      return NextResponse.json({ error: "You already submitted a request recently. We will contact you shortly." }, { status: 429 });
    }

    const { error: insertError } = await supabase
      .from("demo_requests")
      .insert({
        full_name: fullName.trim(),
        role: role.trim(),
        facility_name: facilityName.trim(),
        whatsapp_number: whatsappNumber.trim(),
        email: email.trim(),
        state: state.trim(),
      });

    if (insertError) {
      return NextResponse.json({ error: "Database insertion failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
