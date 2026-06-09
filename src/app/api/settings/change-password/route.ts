import { NextResponse } from "next/server";
import { createServiceClient } from "@/services/supabase-server";
import { auth } from "@/lib/auth";
import { changePasswordSchema } from "@/lib/validations";
import { apiError, ErrorCodes } from "@/lib/error-codes";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(apiError(ErrorCodes.UNAUTHORIZED), { status: 401 });
    }

    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        apiError(ErrorCodes.VALIDATION_ERROR, { field: firstIssue.path.join("."), message: firstIssue.message }),
        { status: 400 },
      );
    }

    const { currentPassword, newPassword } = parsed.data;
    const email = session.user.email;
    if (!email) {
      return NextResponse.json(
        apiError(ErrorCodes.INTERNAL_SERVER_ERROR, { details: "Session missing email." }),
        { status: 500 },
      );
    }

    const supabase = createServiceClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

    if (signInError) {
      return NextResponse.json(
        apiError(ErrorCodes.VALIDATION_ERROR, { field: "currentPassword", message: "Current password is incorrect." }),
        { status: 400 },
      );
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(
      session.user.id,
      { password: newPassword },
    );

    if (updateError) {
      return NextResponse.json(
        apiError(ErrorCodes.INTERNAL_SERVER_ERROR, { operation: "UPDATE password" }),
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      apiError(ErrorCodes.INTERNAL_SERVER_ERROR),
      { status: 500 },
    );
  }
}
