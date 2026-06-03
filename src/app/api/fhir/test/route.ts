import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { apiError, ErrorCodes } from "@/lib/error-codes";
import { mapFHIRToPatientInput, FHIRPatient, FHIREncounter, FHIRCondition, FHIRMedicationRequest } from "@/services/fhir-adapter";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(apiError(ErrorCodes.UNAUTHORIZED), { status: 401 });
    }
    if (session.user.role !== "doctor") {
      return NextResponse.json(apiError(ErrorCodes.ROLE_NOT_PERMITTED, { role: session.user.role, requiredRole: "doctor" }), { status: 403 });
    }

    const bundle = await req.json();

    if (!bundle || bundle.resourceType !== "Bundle" || !Array.isArray(bundle.entry)) {
      return NextResponse.json({ error: "Invalid FHIR Bundle payload" }, { status: 400 });
    }

    let patient: FHIRPatient | null = null;
    let encounter: FHIREncounter | null = null;
    const conditions: FHIRCondition[] = [];
    const medications: FHIRMedicationRequest[] = [];

    for (const entry of bundle.entry) {
      const resource = entry.resource;
      if (!resource) continue;

      if (resource.resourceType === "Patient") {
        patient = resource as FHIRPatient;
      } else if (resource.resourceType === "Encounter") {
        encounter = resource as FHIREncounter;
      } else if (resource.resourceType === "Condition") {
        conditions.push(resource as FHIRCondition);
      } else if (resource.resourceType === "MedicationRequest") {
        medications.push(resource as FHIRMedicationRequest);
      }
    }

    if (!patient || !encounter) {
      return NextResponse.json(
        { error: "FHIR Bundle must contain at least a Patient and an Encounter resource" },
        { status: 400 }
      );
    }

    const mappedInput = mapFHIRToPatientInput(patient, encounter, conditions, medications);

    return NextResponse.json({
      success: true,
      patientInput: mappedInput,
    });
  } catch (err: unknown) {
    console.error("FHIR mapping error:", err);
    return NextResponse.json({ error: "Mapping failed" }, { status: 500 });
  }
}
