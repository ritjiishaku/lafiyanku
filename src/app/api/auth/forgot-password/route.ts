import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { apiError, ErrorCodes } from "@/lib/error-codes";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(apiError(ErrorCodes.VALIDATION_ERROR, { field: "email", message: "Email is required." }), { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/login/reset-password`,
    });

    if (error) {
      return NextResponse.json(apiError(ErrorCodes.SUPABASE_ERROR, { details: error.message }), { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(apiError(ErrorCodes.INTERNAL_SERVER_ERROR), { status: 500 });
  }
}

