import { NextRequest, NextResponse } from "next/server";
import {
  fhirPatient,
  fhirEncounter,
  fhirCondition,
  fhirMedicationRequests,
  fhirProcedures,
  fhirDischargeSummary,
} from "@/services/fhir-adapter";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input, clinicalSummary, recordId } = body;

    if (!input) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_INPUT", message: "PatientInput data is required." } },
        { status: 400 },
      );
    }

    const patientId = (recordId as string) ?? crypto.randomUUID();
    const patientRef = `urn:uuid:${patientId}`;
    const encounterRef = `urn:uuid:${crypto.randomUUID()}`;
    const practitionerRef = `urn:uuid:${crypto.randomUUID()}`;

    const bundle = {
      resourceType: "Bundle",
      type: "document",
      timestamp: new Date().toISOString(),
      entry: [
        { fullUrl: patientRef, resource: fhirPatient(input, patientId) },
        { fullUrl: encounterRef, resource: fhirEncounter(input, patientRef) },
        { fullUrl: `urn:uuid:${crypto.randomUUID()}`, resource: fhirCondition(input, patientRef, encounterRef) },
        ...(fhirMedicationRequests((input.medications ?? []) as any[], patientRef, encounterRef).map((r) => ({
          fullUrl: `urn:uuid:${crypto.randomUUID()}`,
          resource: r,
        }))),
        ...(fhirProcedures((input.proceduresPerformed ?? []) as string[], patientRef, encounterRef).map((r) => ({
          fullUrl: `urn:uuid:${crypto.randomUUID()}`,
          resource: r,
        }))),
        {
          fullUrl: `urn:uuid:${crypto.randomUUID()}`,
          resource: fhirDischargeSummary(input, clinicalSummary ?? "", patientRef, encounterRef, practitionerRef, recordId ?? crypto.randomUUID()),
        },
      ],
    };

    return NextResponse.json({ success: true, data: bundle });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "CONVERSION_FAILED", message: "FHIR conversion failed." } },
      { status: 500 },
    );
  }
}
