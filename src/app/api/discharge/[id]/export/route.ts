import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/services/supabase-server";
import { writeAuditLog } from "@/services/audit-log";
import { verifyFacilityAccess } from "@/services/facility-access";
import { AuditAction, UserRole } from "@/types/schemas";
import { apiError, ErrorCodes } from "@/lib/error-codes";
import { auth } from "@/lib/auth";
import { renderDischargePdfToBuffer } from "@/components/pdf/DischargePdf";

export async function GET(
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
      facilityName: String(pi?.facility_name ?? ""),
      patientName: String(pi?.patient_name ?? ""),
      dischargeDate: String(pi?.discharge_date ?? ""),
      clinicianName: String(pi?.discharged_by ?? ""),
      clinicalSummary: String(data.clinical_summary ?? ""),
      patientFriendlyOutput: String(data.patient_friendly_output ?? ""),
      translatedOutput: data.translated_output ? String(data.translated_output) : null,
      translationLanguage: data.translation_language ? String(data.translation_language) : null,
    };

    await writeAuditLog({
      recordId: id,
      userId: session.user.id,
      userRole: role as any,
      action: AuditAction.Export,
      facilityId: session.user.facilityId,
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
    });

    const format = request.nextUrl.searchParams.get("format");
    if (format === "pdf") {
      const pdfBuffer = await renderDischargePdfToBuffer(exportData);
      return new NextResponse(new Uint8Array(pdfBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="discharge-${id}.pdf"`,
        },
      });
    }

    return NextResponse.json({ success: true, data: exportData });
  } catch (err) {
    const message = err instanceof Error ? err.message : "INTERNAL_SERVER_ERROR";
    return NextResponse.json(
      apiError(ErrorCodes.SUPABASE_ERROR, { operation: "GET discharge_record export", details: message }),
      { status: 500 },
    );
  }
}
