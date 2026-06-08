import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/services/supabase-server";
import { writeAuditLog } from "@/services/audit-log";
import { verifyFacilityAccess } from "@/services/facility-access";
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

    const role = session.user.role;
    if (role !== UserRole.Doctor && role !== UserRole.Admin) {
      return NextResponse.json(apiError(ErrorCodes.ROLE_NOT_PERMITTED), { status: 403 });
    }

    const { id } = await params;

    const access = await verifyFacilityAccess(id, session.user.facilityId);
    if (!access.allowed) {
      return NextResponse.json(
        apiError(ErrorCodes.RECORD_NOT_FOUND, { recordId: id }),
        { status: 404 },
      );
    }

    const supabase = createServiceClient();

    const { data: existing, error: findError } = await supabase
      .from("discharge_records")
      .select("status")
      .eq("record_id", id)
      .single();

    if (findError || !existing) {
      return NextResponse.json(
        apiError(ErrorCodes.RECORD_NOT_FOUND, { recordId: id }),
        { status: 404 },
      );
    }

    if (existing.status !== "archived") {
      return NextResponse.json(
        apiError(ErrorCodes.RECORD_NOT_ARCHIVED),
        { status: 400 },
      );
    }

    const { error: updateError } = await supabase
      .from("discharge_records")
      .update({ status: "draft" })
      .eq("record_id", id);

    if (updateError) {
      return NextResponse.json(
        apiError(ErrorCodes.SUPABASE_ERROR, { operation: "UPDATE unarchive" }),
        { status: 500 },
      );
    }

    await writeAuditLog({
      recordId: id,
      userId: session.user.id,
      userRole: role as UserRole,
      action: AuditAction.Unarchive,
      facilityId: session.user.facilityId,
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
      notes: `Status changed: ${existing.status} → draft (unarchived)`,
    });

    return NextResponse.json({ success: true, data: { recordId: id, status: "draft" } });
  } catch {
    return NextResponse.json(
      apiError(ErrorCodes.INTERNAL_SERVER_ERROR),
      { status: 500 },
    );
  }
}
