import { describe, it, expect } from "vitest";
import { mapFHIRToPatientInput, FHIRPatient, FHIREncounter, FHIRCondition, FHIRMedicationRequest } from "../fhir-adapter";
import { Gender } from "@/types/schemas";

describe("fhir-adapter", () => {
  it("should correctly map a complete FHIR R4 dataset to PatientInput structure", () => {
    const patient: FHIRPatient = {
      resourceType: "Patient",
      name: [{ text: "Aminu Ibrahim" }],
      birthDate: "1981-06-15",
      gender: "male",
      identifier: [
        { value: "H-123456" },
        { value: "NHIS-9999", system: "http://nhis.gov.ng" }
      ]
    };

    const encounter: FHIREncounter = {
      resourceType: "Encounter",
      period: {
        start: "2026-05-01T10:00:00Z",
        end: "2026-05-10T14:30:00Z"
      },
      participant: [
        { individual: { display: "Dr. Aliyu" } }
      ]
    };

    const conditions: FHIRCondition[] = [
      {
        resourceType: "Condition",
        code: { text: "Hypertension" }
      },
      {
        resourceType: "Condition",
        code: { text: "Type 2 Diabetes" }
      }
    ];

    const medications: FHIRMedicationRequest[] = [
      {
        resourceType: "MedicationRequest",
        medicationCodeableConcept: { text: "Metformin" },
        dosageInstruction: [
          {
            doseAndRate: [{ doseQuantity: { value: 500, unit: "mg" } }],
            timing: { code: { text: "Twice daily" } }
          }
        ]
      }
    ];

    const mapped = mapFHIRToPatientInput(patient, encounter, conditions, medications);

    expect(mapped.patientName).toBe("Aminu Ibrahim");
    expect(mapped.age).toBe(new Date().getFullYear() - 1981);
    expect(mapped.gender).toBe(Gender.Male);
    expect(mapped.hospitalNumber).toBe("H-123456");
    expect(mapped.nhisNumber).toBe("NHIS-9999");
    expect(mapped.admissionDate).toBe("2026-05-01");
    expect(mapped.dischargeDate).toBe("2026-05-10");
    expect(mapped.diagnosis).toContain("Hypertension");
    expect(mapped.diagnosis).toContain("Type 2 Diabetes");
    expect(mapped.medications).toBeDefined();
    expect(mapped.medications?.length).toBe(1);
    expect(mapped.medications?.[0].name).toBe("Metformin");
    expect(mapped.medications?.[0].dosage).toBe("500 mg");
    expect(mapped.medications?.[0].frequency).toBe("Twice daily");
    expect(mapped.dischargedBy).toBe("Dr. Aliyu");
  });
});
