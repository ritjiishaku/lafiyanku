import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/services/supabase-server";
import { auth } from "@/lib/auth";
import { UserRole } from "@/types/schemas";
import { clinicianUpdateSchema } from "@/lib/validations";
import { apiError, ErrorCodes } from "@/lib/error-codes";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== UserRole.Admin) {
      return NextResponse.json(apiError(ErrorCodes.ROLE_NOT_PERMITTED), { status: 403 });
    }

    const { id } = await params;

    const body = await request.json();
    const parsed = clinicianUpdateSchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(apiError(ErrorCodes.VALIDATION_ERROR, { field: firstIssue.path.join("."), message: firstIssue.message }), { status: 400 });
    }

    const { fullName, role, password } = parsed.data;

    const supabase = createServiceClient();

    const { data: adminProfile } = await supabase
      .from("user_profiles")
      .select("facility_id")
      .eq("user_id", session.user.id)
      .single();

    const { data: targetProfile } = await supabase
      .from("user_profiles")
      .select("facility_id")
      .eq("user_id", id)
      .single();

    if (!targetProfile || !adminProfile?.facility_id || targetProfile.facility_id !== adminProfile.facility_id) {
      return NextResponse.json(apiError(ErrorCodes.ROLE_NOT_PERMITTED), { status: 403 });
    }

    const updates: Record<string, string> = {};

    if (fullName) updates.full_name = fullName;
    if (role) updates.role = role;

    if (Object.keys(updates).length > 0) {
      const { error: profileError } = await supabase
        .from("user_profiles")
        .update(updates)
        .eq("user_id", id);

      if (profileError) throw profileError;
    }

    if (password) {
      const { error: authError } = await supabase.auth.admin.updateUserById(id, { password });
      if (authError) throw authError;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      apiError(ErrorCodes.INTERNAL_SERVER_ERROR, { details: err instanceof Error ? err.message : "Failed to update clinician" }),
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== UserRole.Admin) {
      return NextResponse.json(apiError(ErrorCodes.ROLE_NOT_PERMITTED), { status: 403 });
    }

    const { id } = await params;

    const supabase = createServiceClient();

    const { data: adminProfile } = await supabase
      .from("user_profiles")
      .select("facility_id")
      .eq("user_id", session.user.id)
      .single();

    const { data: targetProfile } = await supabase
      .from("user_profiles")
      .select("facility_id, role")
      .eq("user_id", id)
      .single();

    if (!targetProfile || !adminProfile?.facility_id || targetProfile.facility_id !== adminProfile.facility_id || targetProfile.role === "admin") {
      return NextResponse.json(apiError(ErrorCodes.ROLE_NOT_PERMITTED), { status: 403 });
    }

    const { error: authError } = await supabase.auth.admin.deleteUser(id);
    if (authError) throw authError;

    const { error: profileError } = await supabase
      .from("user_profiles")
      .delete()
      .eq("user_id", id);
    if (profileError) throw profileError;

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      apiError(ErrorCodes.INTERNAL_SERVER_ERROR, { details: err instanceof Error ? err.message : "Failed to remove clinician" }),
      { status: 500 },
    );
  }
}
