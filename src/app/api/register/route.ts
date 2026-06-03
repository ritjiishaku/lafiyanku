import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      return NextResponse.json(
        { error: "Server configuration error. Contact support." },
        { status: 500 },
      );
    }

    const supabase = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { email, password, fullName, role, facilityId } = await request.json();

    if (!email || !password || !fullName || !role) {
      return NextResponse.json(
        { error: "Email, password, full name, and role are required." },
        { status: 400 },
      );
    }

    if (!["doctor", "nurse"].includes(role)) {
      return NextResponse.json(
        { error: "Role must be 'doctor' or 'nurse'." },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (authError) {
      if (authError.message.includes("already registered") || authError.message.includes("already exists")) {
        return NextResponse.json(
          { error: "An account with this email already exists." },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { error: authError.message },
        { status: 500 },
      );
    }

    const userId = authData.user.id;

    const { error: profileError } = await supabase.from("user_profiles").insert({
      user_id: userId,
      email,
      role,
      facility_id: facilityId ?? null,
    });

    if (profileError) {
      await supabase.auth.admin.deleteUser(userId).catch(() => {});
      return NextResponse.json(
        { error: `Failed to create user profile: ${profileError.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
