import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/services/supabase-server";
import { auth } from "@/lib/auth";
import { apiError, ErrorCodes } from "@/lib/error-codes";
import { UserRole } from "@/types/schemas";

function isClinician(role?: string): boolean {
  return role === UserRole.Doctor || role === UserRole.Nurse;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || !isClinician(session.user.role)) {
      return NextResponse.json(apiError(ErrorCodes.UNAUTHORIZED), { status: 401 });
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("form_drafts")
      .select("patient_input, updated_at")
      .eq("user_id", session.user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json(apiError(ErrorCodes.SUPABASE_ERROR, { operation: "GET draft" }), { status: 500 });
    }

    return NextResponse.json({ success: true, data: data ?? null });
  } catch {
    return NextResponse.json(apiError(ErrorCodes.INTERNAL_SERVER_ERROR), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !isClinician(session.user.role)) {
      return NextResponse.json(apiError(ErrorCodes.UNAUTHORIZED), { status: 401 });
    }

    const body = await request.json();
    const patientInput = body.patientInput;

    if (!patientInput) {
      return NextResponse.json(apiError(ErrorCodes.MISSING_REQUIRED_FIELD, { field: "patientInput" }), { status: 400 });
    }

    const supabase = createServiceClient();
    const now = new Date().toISOString();

    const { error } = await supabase.from("form_drafts").upsert({
      user_id: session.user.id,
      patient_input: patientInput,
      updated_at: now,
    }, { onConflict: "user_id", ignoreDuplicates: false });

    if (error) {
      return NextResponse.json(apiError(ErrorCodes.SUPABASE_ERROR, { operation: "UPSERT draft" }), { status: 500 });
    }

    return NextResponse.json({ success: true, savedAt: now });
  } catch {
    return NextResponse.json(apiError(ErrorCodes.INTERNAL_SERVER_ERROR), { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id || !isClinician(session.user.role)) {
      return NextResponse.json(apiError(ErrorCodes.UNAUTHORIZED), { status: 401 });
    }

    const supabase = createServiceClient();
    const { error } = await supabase
      .from("form_drafts")
      .delete()
      .eq("user_id", session.user.id);

    if (error) {
      return NextResponse.json(apiError(ErrorCodes.SUPABASE_ERROR, { operation: "DELETE draft" }), { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(apiError(ErrorCodes.INTERNAL_SERVER_ERROR), { status: 500 });
  }
}
