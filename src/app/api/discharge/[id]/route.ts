import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/services/supabase-server";
import { writeAuditLog } from "@/services/audit-log";
import { verifyFacilityAccess } from "@/services/facility-access";
import { AuditAction, UserRole } from "@/types/schemas";
import { apiError, ErrorCodes } from "@/lib/error-codes";
import { auth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.role) {
      return NextResponse.json(apiError(ErrorCodes.UNAUTHORIZED), { status: 401 });
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

    const { data, error } = await supabase
      .from("discharge_records")
      .select(`*, patient_input:patient_input_id (
        patient_name, facility_name, admission_date, discharge_date, discharged_by
      )`)
      .eq("record_id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        apiError(ErrorCodes.RECORD_NOT_FOUND, { recordId: id }),
        { status: 404 },
      );
    }

    if (session.user.role === UserRole.Admin) {
      const { clinical_summary, ...rest } = data;
      void clinical_summary;
      return NextResponse.json({ success: true, data: rest });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "INTERNAL_SERVER_ERROR";
    return NextResponse.json(
      apiError(ErrorCodes.SUPABASE_ERROR, { operation: "GET discharge_record", details: message }),
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.role) {
      return NextResponse.json(apiError(ErrorCodes.UNAUTHORIZED), { status: 401 });
    }

    const role = session.user.role;
    if (role !== UserRole.Doctor && role !== UserRole.Nurse) {
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

    const body = await request.json();

    const supabase = createServiceClient();

    const { data: existing, error: findError } = await supabase
      .from("discharge_records")
      .select("status, clinical_summary, patient_friendly_output")
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
        apiError(ErrorCodes.RECORD_ARCHIVED, { action: "edit", recordId: id }),
        { status: 400 },
      );
    }

    if (existing.status === "finalised") {
      return NextResponse.json(
        apiError(ErrorCodes.RECORD_ALREADY_FINALISED, { action: "edit", recordId: id }),
        { status: 400 },
      );
    }

    const { error: updateError } = await supabase
      .from("discharge_records")
      .update({
        clinical_summary: body.clinicalSummary,
        patient_friendly_output: body.patientFriendlyOutput,
        last_edited_at: new Date().toISOString(),
        last_edited_by_user_id: session.user.id,
      })
      .eq("record_id", id);

    if (updateError) {
      return NextResponse.json(
        apiError(ErrorCodes.SUPABASE_ERROR, { operation: "UPDATE discharge_records" }),
        { status: 500 },
      );
    }

    await writeAuditLog({
      recordId: id,
      userId: session.user.id,
      userRole: role as UserRole,
      action: AuditAction.Edit,
      facilityId: session.user.facilityId,
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
      changesDiff: {
        clinicalSummary: {
          before: existing.clinical_summary?.slice(0, 100),
          after: body.clinicalSummary?.slice(0, 100),
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "INTERNAL_SERVER_ERROR";
    return NextResponse.json(
      apiError(ErrorCodes.SUPABASE_ERROR, { operation: "UPDATE discharge_record", details: message }),
      { status: 500 },
    );
  }
}
