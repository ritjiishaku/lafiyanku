import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { createServiceClient } from "@/services/supabase-server";
import { auth } from "@/lib/auth";
import { UserRole } from "@/types/schemas";
import { apiError, ErrorCodes } from "@/lib/error-codes";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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
      .select("facility_id")
      .eq("user_id", id)
      .single();

    if (!targetProfile || !adminProfile?.facility_id || targetProfile.facility_id !== adminProfile.facility_id) {
      return NextResponse.json(apiError(ErrorCodes.ROLE_NOT_PERMITTED), { status: 403 });
    }

    const newPassword = randomBytes(12).toString("hex");

    const { error: authError } = await supabase.auth.admin.updateUserById(id, {
      password: newPassword,
    });

    if (authError) {
      return NextResponse.json(
        apiError(ErrorCodes.SUPABASE_ERROR, { operation: "UPDATE password" }),
        { status: 500 },
      );
    }

    // Force password change on next login
    await supabase.from("user_profiles").update({ must_change_password: true }).eq("user_id", id);

    return NextResponse.json({ success: true, data: { password: newPassword } });
  } catch {
    return NextResponse.json(
      apiError(ErrorCodes.INTERNAL_SERVER_ERROR),
      { status: 500 },
    );
  }
}
