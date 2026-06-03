import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/services/supabase-server";
import { writeAuditLog } from "@/services/audit-log";
import { AuditAction, UserRole } from "@/types/schemas";
import { apiError, ErrorCodes } from "@/lib/error-codes";
import { auth } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.role) {
      return NextResponse.json(apiError(ErrorCodes.UNAUTHORIZED), { status: 401 });
    }
    if (session.user.role !== UserRole.Doctor) {
      return NextResponse.json(apiError(ErrorCodes.ROLE_NOT_PERMITTED), { status: 403 });
    }

    const { id } = await params;

    const supabase = createServiceClient();

    const { data: existing, error: findError } = await supabase
      .from("discharge_records")
      .select("status, missing_fields_log, flagged_issues")
      .eq("record_id", id)
      .single();

    if (findError || !existing) {
      return NextResponse.json(
        apiError(ErrorCodes.RECORD_NOT_FOUND, { recordId: id }),
        { status: 404 },
      );
    }

    if (existing.status === "finalised") {
      return NextResponse.json(
        apiError(ErrorCodes.RECORD_ALREADY_FINALISED, { recordId: id }),
        { status: 400 },
      );
    }

    if (existing.status === "archived") {
      return NextResponse.json(
        apiError(ErrorCodes.RECORD_ARCHIVED, { action: "finalise", recordId: id }),
        { status: 400 },
      );
    }

    const { error: updateError } = await supabase
      .from("discharge_records")
      .update({ status: "finalised" })
      .eq("record_id", id);

    if (updateError) {
      return NextResponse.json(
        apiError(ErrorCodes.SUPABASE_ERROR, { operation: "UPDATE finalise" }),
        { status: 500 },
      );
    }

    await writeAuditLog({
      recordId: id,
      userId: session.user.id,
      userRole: session.user.role as any,
      action: AuditAction.Finalise,
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
      notes:
        (existing.missing_fields_log ?? []).length > 0 ||
        (existing.flagged_issues ?? []).length > 0
          ? "Finalised with outstanding flags"
          : undefined,
    });

    return NextResponse.json({ success: true, data: { recordId: id, status: "finalised" } });
  } catch {
    return NextResponse.json(
      apiError(ErrorCodes.INTERNAL_SERVER_ERROR),
      { status: 500 },
    );
  }
}
