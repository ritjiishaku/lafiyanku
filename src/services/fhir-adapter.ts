import { PatientInput, Gender, Medication } from "@/types/schemas";

// Basic FHIR R4 interfaces for typing
export interface FHIRPatient {
  resourceType: "Patient";
  name?: Array<{
    text?: string;
    given?: string[];
    family?: string;
  }>;
  birthDate?: string;
  gender?: "male" | "female" | "other" | "unknown";
  identifier?: Array<{
    system?: string;
    value?: string;
    type?: {
      coding?: Array<{
        code?: string;
        system?: string;
      }>;
    };
  }>;
}

export interface FHIREncounter {
  resourceType: "Encounter";
  period?: {
    start?: string;
    end?: string;
  };
  participant?: Array<{
    individual?: {
      display?: string;
      reference?: string;
    };
  }>;
}

export interface FHIRCondition {
  resourceType: "Condition";
  code?: {
    text?: string;
    coding?: Array<{
      display?: string;
      code?: string;
    }>;
  };
  clinicalStatus?: {
    coding?: Array<{
      code?: string;
    }>;
  };
}

export interface FHIRMedicationRequest {
  resourceType: "MedicationRequest";
  medicationCodeableConcept?: {
    text?: string;
    coding?: Array<{
      display?: string;
    }>;
  };
  dosageInstruction?: Array<{
    doseAndRate?: Array<{
      doseQuantity?: {
        value?: number;
        unit?: string;
      };
    }>;
    timing?: {
      code?: {
        text?: string;
      };
    };
  }>;
}

export interface FHIRDocumentReference {
  resourceType: "DocumentReference";
  status: "current";
  type: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  subject: {
    reference: string;
  };
  content: Array<{
    attachment: {
      contentType: string;
      data: string;
    };
  }>;
}

export function mapFHIRToPatientInput(
  patient: FHIRPatient,
  encounter: FHIREncounter,
  conditions: FHIRCondition[],
  medications: FHIRMedicationRequest[]
): Partial<PatientInput> {
  const patientInput: Partial<PatientInput> = {};

  // Map Patient Name
  if (patient.name && patient.name.length > 0) {
    const mainName = patient.name[0];
    if (mainName.text) {
      patientInput.patientName = mainName.text;
    } else {
      const given = mainName.given ? mainName.given.join(" ") : "";
      const family = mainName.family || "";
      patientInput.patientName = `${given} ${family}`.trim();
    }
  }

  // Derived Age
  if (patient.birthDate) {
    const birthYear = new Date(patient.birthDate).getFullYear();
    const currentYear = new Date().getFullYear();
    patientInput.age = currentYear - birthYear;
  }

  // Map Gender
  if (patient.gender) {
    if (patient.gender === "male") patientInput.gender = Gender.Male;
    else if (patient.gender === "female") patientInput.gender = Gender.Female;
    else patientInput.gender = Gender.Other;
  }

  // Hospital Number & NHIS Number
  if (patient.identifier) {
    const hospitalId = patient.identifier[0]?.value;
    if (hospitalId) {
      patientInput.hospitalNumber = hospitalId;
    }

    const nhis = patient.identifier.find(
      (id) =>
        id.system?.includes("nhis") ||
        id.type?.coding?.some((c) => c.code === "NHIS")
    );
    if (nhis?.value) {
      patientInput.nhisNumber = nhis.value;
    }
  }

  // Admission & Discharge Dates
  if (encounter.period) {
    if (encounter.period.start) {
      patientInput.admissionDate = encounter.period.start.split("T")[0];
    }
    if (encounter.period.end) {
      patientInput.dischargeDate = encounter.period.end.split("T")[0];
    }
  }

  // Diagnosis mapping (primary + secondary)
  if (conditions && conditions.length > 0) {
    patientInput.diagnosis = conditions
      .map((c) => c.code?.text || c.code?.coding?.[0]?.display || "")
      .filter(Boolean)
      .join(", ");
  }

  // Medications
  if (medications && medications.length > 0) {
    patientInput.medications = medications.map((med) => {
      const name = med.medicationCodeableConcept?.text || med.medicationCodeableConcept?.coding?.[0]?.display || "Unknown Medication";
      const dosageVal = med.dosageInstruction?.[0]?.doseAndRate?.[0]?.doseQuantity?.value;
      const dosageUnit = med.dosageInstruction?.[0]?.doseAndRate?.[0]?.doseQuantity?.unit || "";
      const dosage = dosageVal ? `${dosageVal} ${dosageUnit}`.trim() : "Not provided";
      const frequency = med.dosageInstruction?.[0]?.timing?.code?.text || "Not provided";

      return {
        name,
        dosage,
        frequency,
      } as Medication;
    });
  }

  // Clinician name from Encounter participant
  if (encounter.participant && encounter.participant.length > 0) {
    const clinician = encounter.participant[0].individual?.display;
    if (clinician) {
      patientInput.dischargedBy = clinician;
    }
  }

  return patientInput;
}

// FHIR Procedure interface
export interface FHIRProcedure {
  resourceType: "Procedure";
  status: "completed";
  code?: {
    text?: string;
  };
  subject?: { reference: string };
  encounter?: { reference: string };
}

// ============================================
// PatientInput → FHIR R4 conversion helpers
// Used by /api/fhir/convert to build a FHIR Bundle
// ============================================

export function fhirPatient(input: Record<string, unknown>): FHIRPatient {
  return {
    resourceType: "Patient",
    name: [{ text: input.patientName as string }],
    gender: (input.gender as string)?.toLowerCase() as "male" | "female" | "other" | undefined,
    identifier: [
      { system: "urn:oid:1.2.3.4.5.6.7", value: input.hospitalNumber as string },
      ...(input.nhisNumber
        ? [{ system: "https://nhis.gov.ng", value: input.nhisNumber as string, type: { coding: [{ code: "NHIS" }] } }]
        : []),
    ],
  };
}

export function fhirEncounter(input: Record<string, unknown>): FHIREncounter {
  return {
    resourceType: "Encounter",
    period: {
      start: input.admissionDate as string,
      end: input.dischargeDate as string,
    },
    participant: [
      { individual: { display: input.dischargedBy as string } },
    ],
  };
}

export function fhirCondition(input: Record<string, unknown>): FHIRCondition {
  return {
    resourceType: "Condition",
    code: { text: input.diagnosis as string },
    clinicalStatus: { coding: [{ code: "active" }] },
  };
}

export function fhirMedicationRequests(
  medications: Array<Record<string, unknown>>,
): FHIRMedicationRequest[] {
  return medications.map((med) => ({
    resourceType: "MedicationRequest",
    medicationCodeableConcept: { text: med.name as string },
    dosageInstruction: [
      {
        doseAndRate: [{ doseQuantity: (() => {
          const match = (med.dosage as string)?.match(/^([\d.]+)\s*(.*)$/);
          return { value: match ? parseFloat(match[1]) : 0, unit: match?.[2] || "" };
        })() }],
        timing: { code: { text: med.frequency as string } },
      },
    ],
  }));
}

export function fhirProcedures(
  procedures: string[],
  patientRef: string,
  encounterRef: string,
): FHIRProcedure[] {
  return procedures.map((proc) => ({
    resourceType: "Procedure",
    status: "completed",
    code: { text: proc },
    subject: { reference: patientRef },
    encounter: { reference: encounterRef },
  }));
}

export function fhirDischargeSummary(
  clinicalSummary: string,
  patientRef: string,
): FHIRDocumentReference {
  return {
    resourceType: "DocumentReference",
    status: "current",
    type: {
      coding: [
        {
          system: "http://loinc.org",
          code: "11524-6",
          display: "Hospital Discharge summary",
        },
      ],
    },
    subject: { reference: patientRef },
    content: [
      {
        attachment: {
          contentType: "text/plain",
          data: Buffer.from(clinicalSummary).toString("base64"),
        },
      },
    ],
  };
}
