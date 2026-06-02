import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/services/supabase-server";
import { writeAuditLog } from "@/services/audit-log";
import { AuditAction } from "@/types/schemas";
import { apiError, ErrorCodes } from "@/lib/error-codes";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const { userId, userRole } = body;

  if (userRole !== "doctor" && userRole !== "admin") {
    return NextResponse.json(
      apiError(ErrorCodes.ROLE_NOT_PERMITTED, {
        role: userRole,
    action: AuditAction.Archive,
        requiredRole: "doctor or admin",
      }),
      { status: 403 },
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

  if (existing.status === "archived") {
    return NextResponse.json(
      apiError(ErrorCodes.RECORD_ARCHIVED, { action: "archive", recordId: id }),
      { status: 400 },
    );
  }

  const { error: updateError } = await supabase
    .from("discharge_records")
    .update({ status: "archived" })
    .eq("record_id", id);

  if (updateError) {
    return NextResponse.json(
      apiError(ErrorCodes.SUPABASE_ERROR, { operation: "UPDATE archive" }),
      { status: 500 },
    );
  }

  await writeAuditLog({
    recordId: id,
    userId,
    userRole,
    action: AuditAction.Archive,
    ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json({ success: true, data: { recordId: id, status: "archived" } });
}
