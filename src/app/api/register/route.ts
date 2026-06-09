import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/lib/auth";
import { UserRole } from "@/types/schemas";
import { registerSchema } from "@/lib/validations";
import { apiError, ErrorCodes } from "@/lib/error-codes";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== UserRole.Admin) {
      return NextResponse.json(apiError(ErrorCodes.ROLE_NOT_PERMITTED), { status: 403 });
    }

    const adminFacilityId = session.user.facilityId;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      return NextResponse.json(
        apiError(ErrorCodes.INTERNAL_SERVER_ERROR, { details: "Server configuration error. Contact support." }),
        { status: 500 },
      );
    }

    const body = await request.json();

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        apiError(ErrorCodes.VALIDATION_ERROR, { field: firstIssue.path.join("."), message: firstIssue.message }),
        { status: 400 },
      );
    }

    const { email, fullName, role } = parsed.data;

    const defaultPassword = randomBytes(12).toString("hex");

    const supabase = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: defaultPassword,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (authError) {
      if (authError.message.includes("already registered") || authError.message.includes("already exists")) {
        return NextResponse.json(
          apiError(ErrorCodes.SUPABASE_ERROR, { details: "An account with this email already exists." }),
          { status: 409 },
        );
      }
      return NextResponse.json(
        apiError(ErrorCodes.SUPABASE_ERROR, { operation: "CREATE user" }),
        { status: 500 },
      );
    }

    const userId = authData.user.id;

    const { error: profileError } = await supabase.from("user_profiles").upsert({
      user_id: userId,
      email,
      full_name: fullName,
      role,
      facility_id: adminFacilityId ?? null,
    }, { onConflict: "user_id" });

    if (profileError) {
      await supabase.auth.admin.deleteUser(userId).catch(() => {});
      return NextResponse.json(
        apiError(ErrorCodes.SUPABASE_ERROR, { operation: "UPSERT user_profile" }),
        { status: 500 },
      );
    }

    const loginUrl = new URL("/auth", request.url).toString();

    return NextResponse.json({
      success: true,
      data: { userId, email, defaultPassword, loginUrl },
    }, { status: 201 });
  } catch {
    return NextResponse.json(
      apiError(ErrorCodes.INTERNAL_SERVER_ERROR),
      { status: 500 },
    );
  }
}
