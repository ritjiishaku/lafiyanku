import { NextResponse } from "next/server";
import { createServiceClient } from "@/services/supabase-server";
import { auth } from "@/lib/auth";
import { UserRole } from "@/types/schemas";
import { apiError, ErrorCodes } from "@/lib/error-codes";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== UserRole.Admin) {
      return NextResponse.json(apiError(ErrorCodes.ROLE_NOT_PERMITTED), { status: 403 });
    }

    const supabase = createServiceClient();

    const { data: adminProfile } = await supabase
      .from("user_profiles")
      .select("facility_id")
      .eq("user_id", session.user.id)
      .single();

    if (!adminProfile?.facility_id) {
      return NextResponse.json({ success: true, data: [] });
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .select("user_id, email, full_name, role, facility_id, created_at")
      .eq("facility_id", adminProfile.facility_id)
      .neq("role", "admin")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (err) {
    console.error("Load clinicians error:", err);
    return NextResponse.json(apiError(ErrorCodes.SUPABASE_ERROR), { status: 500 });
  }
}
