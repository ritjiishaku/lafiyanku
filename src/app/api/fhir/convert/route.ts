import { NextRequest, NextResponse } from "next/server";
import {
  fhirPatient,
  fhirEncounter,
  fhirCondition,
  fhirMedicationRequests,
  fhirProcedures,
  fhirDischargeSummary,
} from "@/services/fhir-adapter";
import { auth } from "@/lib/auth";
import { UserRole } from "@/types/schemas";
import { apiError, ErrorCodes } from "@/lib/error-codes";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(apiError(ErrorCodes.UNAUTHORIZED), { status: 401 });
    }
    if (session.user.role !== UserRole.Doctor && session.user.role !== UserRole.Nurse) {
      return NextResponse.json(apiError(ErrorCodes.ROLE_NOT_PERMITTED), { status: 403 });
    }

    const body = await request.json();
    const { input, clinicalSummary, recordId } = body;

    if (!input) {
      return NextResponse.json(
        apiError(ErrorCodes.MISSING_REQUIRED_FIELD, { field: "input" }),
        { status: 400 },
      );
    }

    const patientId = (recordId as string) ?? crypto.randomUUID();
    const patientRef = `urn:uuid:${patientId}`;
    const encounterRef = `urn:uuid:${crypto.randomUUID()}`;

    const bundle = {
      resourceType: "Bundle",
      type: "document",
      timestamp: new Date().toISOString(),
      entry: [
        { fullUrl: patientRef, resource: fhirPatient(input) },
        { fullUrl: encounterRef, resource: fhirEncounter(input) },
        { fullUrl: `urn:uuid:${crypto.randomUUID()}`, resource: fhirCondition(input) },
        ...(fhirMedicationRequests((input.medications ?? []) as Array<Record<string, unknown>>).map((r) => ({
          fullUrl: `urn:uuid:${crypto.randomUUID()}`,
          resource: r,
        }))),
        ...(fhirProcedures((input.proceduresPerformed ?? []) as string[], patientRef, encounterRef).map((r) => ({
          fullUrl: `urn:uuid:${crypto.randomUUID()}`,
          resource: r,
        }))),
        {
          fullUrl: `urn:uuid:${crypto.randomUUID()}`,
          resource: fhirDischargeSummary(clinicalSummary ?? "", patientRef),
        },
      ],
    };

    return NextResponse.json({ success: true, data: bundle });
  } catch {
    return NextResponse.json(
      apiError(ErrorCodes.INTERNAL_SERVER_ERROR, { details: "FHIR conversion failed." }),
      { status: 500 },
    );
  }
}
