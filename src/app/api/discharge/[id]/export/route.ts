import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/services/supabase-server";
import { writeAuditLog } from "@/services/audit-log";
import { AuditAction } from "@/types/schemas";
import { apiError, ErrorCodes } from "@/lib/error-codes";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = request.headers.get("x-user-id") ?? "unknown";
  const userRole = request.headers.get("x-user-role") ?? "unknown";

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("discharge_records")
    .select("*")
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

  await writeAuditLog({
    recordId: id,
    userId,
    userRole: userRole as any,
    action: AuditAction.Export,
    ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
  });

  const exportData = {
    facilityName: data.facility_name,
    patientName: data.patient_name,
    dischargeDate: data.discharge_date,
    clinicianName: data.discharged_by,
    clinicalSummary: data.clinical_summary,
    patientFriendlyOutput: data.patient_friendly_output,
    translatedOutput: data.translated_output,
    translationLanguage: data.translation_language,
  };

  return NextResponse.json({ success: true, data: exportData });
}
