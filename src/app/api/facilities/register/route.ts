import { NextResponse } from "next/server";
import { createServiceClient } from "@/services/supabase-server";
import { facilityRegisterSchema } from "@/lib/validations";
import { apiError, ErrorCodes } from "@/lib/error-codes";

export async function POST(request: Request) {
  try {
    const supabase = createServiceClient();

    const body = await request.json();

    const parsed = facilityRegisterSchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        apiError(ErrorCodes.VALIDATION_ERROR, { field: firstIssue.path.join("."), message: firstIssue.message }),
        { status: 400 },
      );
    }

    const { facilityName, facilityCode, adminName, adminEmail, adminPassword } = parsed.data;

    const recentCount = await supabase
      .from("facilities")
      .select("facility_id", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 3600000).toISOString());

    if ((recentCount.count ?? 0) >= 10) {
      return NextResponse.json(
        apiError(ErrorCodes.RATE_LIMITED),
        { status: 429 },
      );
    }

    const { data: facility, error: facilityError } = await supabase
      .from("facilities")
      .insert({ facility_name: facilityName, facility_code: facilityCode || null })
      .select("facility_id, facility_name, facility_code")
      .single();

    if (facilityError) {
      console.error("Facility insert error:", facilityError);
      return NextResponse.json(
        apiError(ErrorCodes.SUPABASE_ERROR, { operation: "INSERT facility", detail: facilityError.message }),
        { status: 500 },
      );
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { full_name: adminName },
    });

    if (authError) {
      console.error("Auth user creation error:", authError);
      await supabase.from("facilities").delete().eq("facility_id", facility.facility_id);
      const isDuplicate = authError.message.includes("already registered") || authError.message.includes("already exists");
      return NextResponse.json(
        apiError(ErrorCodes.SUPABASE_ERROR, {
          operation: "CREATE user",
          detail: isDuplicate ? "An account with this email already exists." : authError.message,
        }),
        { status: isDuplicate ? 409 : 500 },
      );
    }

    const userId = authData.user.id;

    const { error: profileError } = await supabase.from("user_profiles").upsert({
      user_id: userId,
      email: adminEmail,
      full_name: adminName,
      role: "admin",
      facility_id: facility.facility_id,
    }, { onConflict: "user_id" });

    if (profileError) {
      console.error("Profile upsert error:", profileError);
      await supabase.auth.admin.deleteUser(userId).catch((cleanupErr) => {
        console.error("CRITICAL: Failed to clean up user after profile upsert failure:", cleanupErr);
      });
      await supabase.from("facilities").delete().eq("facility_id", facility.facility_id);
      return NextResponse.json(
        apiError(ErrorCodes.SUPABASE_ERROR, { operation: "UPSERT user_profile", detail: profileError.message }),
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      facility_id: facility.facility_id,
      facility_name: facility.facility_name,
    }, { status: 201 });
  } catch {
    return NextResponse.json(
      apiError(ErrorCodes.INTERNAL_SERVER_ERROR),
      { status: 500 },
    );
  }
}
