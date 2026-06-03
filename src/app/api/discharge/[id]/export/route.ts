import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/services/supabase-server";
import { writeAuditLog } from "@/services/audit-log";
import { AuditAction, UserRole } from "@/types/schemas";
import { apiError, ErrorCodes } from "@/lib/error-codes";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.role) {
    return NextResponse.json(apiError(ErrorCodes.UNAUTHORIZED), { status: 401 });
  }

  const role = session.user.role;
  if (role !== UserRole.Doctor && role !== UserRole.Nurse) {
    return NextResponse.json(apiError(ErrorCodes.ROLE_NOT_PERMITTED), { status: 403 });
  }

  const { id } = await params;

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("discharge_records")
    .select(`*, patient_input:patient_input_id (
      patient_name, facility_name, discharge_date, discharged_by
    )`)
    .eq("record_id", id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      apiError(ErrorCodes.RECORD_NOT_FOUND, { recordId: id }),
      { status: 404 },
    );
  }

  if (data.status !== "finalised") {
    return NextResponse.json(
      apiError(ErrorCodes.RECORD_NOT_FINALISED, { action: "export", currentStatus: data.status }),
      { status: 400 },
    );
  }

  const pi = data.patient_input as Record<string, unknown> | undefined;

  const exportData = {
    facilityName: pi?.facility_name ?? "",
    patientName: pi?.patient_name ?? "",
    dischargeDate: pi?.discharge_date ?? "",
    clinicianName: pi?.discharged_by ?? "",
    clinicalSummary: data.clinical_summary,
    patientFriendlyOutput: data.patient_friendly_output,
    translatedOutput: data.translated_output,
    translationLanguage: data.translation_language,
  };

  await writeAuditLog({
    recordId: id,
    userId: session.user.id,
    userRole: role as any,
    action: AuditAction.Export,
    ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json({ success: true, data: exportData });
}
