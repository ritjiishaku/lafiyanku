import { describe, it, expect } from "vitest";
import { validateInput, validateOutput } from "@/services/ai-provider";

describe("validateInput", () => {
  it("returns no issues for valid input", () => {
    const input = {
      facilityName: "Lagos General Hospital",
      admissionDate: "2026-05-01",
      dischargeDate: "2026-05-05",
      patientName: "Amina Bello",
      age: 34,
      gender: "Female",
      hospitalNumber: "LH-2026-0042",
      diagnosis: "Malaria",
      treatmentGiven: "IV Artesunate",
      medications: [{ name: "Artemether-Lumefantrine", dosage: "80/480mg", frequency: "twice daily" }],
      dischargedBy: "Dr. Emeka Okafor",
      followUpInstructions: "Return in 7 days",
    };
    const result = validateInput(input);
    expect(result.missingFieldsLog).toHaveLength(0);
    expect(result.flaggedIssues).toHaveLength(0);
  });

  it("flags missing required fields", () => {
    const input = {
      facilityName: "Lagos General Hospital",
      admissionDate: "2026-05-01",
      dischargeDate: "",
      patientName: "",
      diagnosis: "Malaria",
      treatmentGiven: "IV Artesunate",
    };
    const result = validateInput(input);
    expect(result.missingFieldsLog.length).toBeGreaterThan(0);
    expect(result.missingFieldsLog.some((m) => m.includes("dischargeDate"))).toBe(true);
    expect(result.missingFieldsLog.some((m) => m.includes("patientName"))).toBe(true);
  });

  it("flags missing follow-up instructions", () => {
    const input = {
      facilityName: "Lagos General Hospital",
      admissionDate: "2026-05-01",
      dischargeDate: "2026-05-05",
      patientName: "Amina Bello",
      age: 34,
      gender: "Female",
      hospitalNumber: "LH-2026-0042",
      diagnosis: "Malaria",
      treatmentGiven: "IV Artesunate",
      medications: [{ name: "Artemether-Lumefantrine", dosage: "80/480mg", frequency: "twice daily" }],
      dischargedBy: "Dr. Emeka Okafor",
    };
    const result = validateInput(input);
    expect(result.missingFieldsLog.some((m) => m.includes("follow-up"))).toBe(true);
  });

  it("flags medication missing dosage", () => {
    const input = {
      facilityName: "Lagos General Hospital",
      admissionDate: "2026-05-01",
      dischargeDate: "2026-05-05",
      patientName: "Amina Bello",
      age: 34,
      gender: "Female",
      hospitalNumber: "LH-2026-0042",
      diagnosis: "Malaria",
      treatmentGiven: "IV Artesunate",
      medications: [{ name: "Paracetamol", dosage: "", frequency: "once daily" }],
      dischargedBy: "Dr. Emeka Okafor",
      followUpInstructions: "Return in 7 days",
    };
    const result = validateInput(input);
    expect(result.flaggedIssues.some((m) => m.includes("Paracetamol"))).toBe(true);
  });

  it("flags contradictory dates", () => {
    const input = {
      facilityName: "Lagos General Hospital",
      admissionDate: "2026-05-10",
      dischargeDate: "2026-05-05",
      patientName: "Amina Bello",
      age: 34,
      gender: "Female",
      hospitalNumber: "LH-2026-0042",
      diagnosis: "Malaria",
      treatmentGiven: "IV Artesunate",
      medications: [{ name: "Artemether-Lumefantrine", dosage: "80/480mg", frequency: "twice daily" }],
      dischargedBy: "Dr. Emeka Okafor",
      followUpInstructions: "Return in 7 days",
    };
    const result = validateInput(input);
    expect(result.flaggedIssues.some((m) => m.includes("Discharge date is before admission date"))).toBe(true);
  });
});

describe("validateOutput", () => {
  const validMode1 = `──────────────────────────────────────────
CLINICAL DISCHARGE SUMMARY
──────────────────────────────────────────
...
Red flag warnings
Seek care if fever returns.
Discharged by
Name: Dr. Emeka`;

  const validMode2 = `──────────────────────────────────────────
PATIENT DISCHARGE INSTRUCTIONS
──────────────────────────────────────────
...
When to return to the hospital
Return if symptoms worsen.
Your follow-up appointment
See your doctor in 7 days.`;

  it("returns no issues when all sections present", () => {
    const content = validMode1 + "\n──────────────────────────────────────────\n" + validMode2;
    expect(validateOutput(content)).toHaveLength(0);
  });

  it("flags missing Red Flag Warnings", () => {
    const content = `──────────────────────────────────────────
CLINICAL DISCHARGE SUMMARY
──────────────────────────────────────────
Discharged by
Name: Dr. Emeka
──────────────────────────────────────────
PATIENT DISCHARGE INSTRUCTIONS
──────────────────────────────────────────
When to return to the hospital
Your follow-up appointment`;
    const issues = validateOutput(content);
    expect(issues.some((i) => i.includes("Red Flag Warnings"))).toBe(true);
  });

  it("flags missing Discharged By", () => {
    const content = `──────────────────────────────────────────
CLINICAL DISCHARGE SUMMARY
──────────────────────────────────────────
Red flag warnings
Seek care.
──────────────────────────────────────────
PATIENT DISCHARGE INSTRUCTIONS
──────────────────────────────────────────
When to return to the hospital
Your follow-up appointment`;
    const issues = validateOutput(content);
    expect(issues.some((i) => i.includes("Discharged By"))).toBe(true);
  });

  it("flags missing When to Return section", () => {
    const content = `──────────────────────────────────────────
CLINICAL DISCHARGE SUMMARY
──────────────────────────────────────────
Red flag warnings
Discharged by
──────────────────────────────────────────
PATIENT DISCHARGE INSTRUCTIONS
──────────────────────────────────────────
Your follow-up appointment`;
    const issues = validateOutput(content);
    expect(issues.some((i) => i.includes("When to Return"))).toBe(true);
  });

  it("flags missing Follow-Up Appointment section", () => {
    const content = `──────────────────────────────────────────
CLINICAL DISCHARGE SUMMARY
──────────────────────────────────────────
Red flag warnings
Discharged by
──────────────────────────────────────────
PATIENT DISCHARGE INSTRUCTIONS
──────────────────────────────────────────
When to return to the hospital`;
    const issues = validateOutput(content);
    expect(issues.some((i) => i.includes("Follow-Up"))).toBe(true);
  });
});
