import { describe, it, expect } from "vitest";
import { z } from "zod";

const medicationSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  timing: z.string().optional(),
  duration: z.string().optional(),
  notes: z.string().optional(),
});

const patientInputSchema = z
  .object({
    facilityName: z.string().min(1, "Facility name is required"),
    facilityCode: z.string().optional(),
    wardName: z.string().optional(),
    admissionDate: z.string().min(1, "Admission date is required"),
    dischargeDate: z.string().min(1, "Discharge date is required"),
    patientName: z.string().min(1, "Patient name is required"),
    age: z.coerce.number().int().min(0).max(130),
    gender: z.enum(["Male", "Female", "Other"]),
    hospitalNumber: z.string().min(1, "Hospital number is required"),
    nhisNumber: z.string().optional(),
    diagnosis: z.string().min(1, "Diagnosis is required"),
    treatmentGiven: z.string().min(1, "Treatment summary is required"),
    proceduresPerformed: z.string().optional(),
    medications: z.array(medicationSchema).min(1, "At least one medication is required"),
    followUpInstructions: z.string().optional(),
    additionalNotes: z.string().optional(),
    languageRequested: z.enum(["en", "ha", "yo", "ig"]).optional(),
    dischargedBy: z.string().min(1, "Clinician name is required"),
    clinicianLicenseNo: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.admissionDate || !data.dischargeDate) return true;
      return new Date(data.dischargeDate) >= new Date(data.admissionDate);
    },
    { message: "Discharge date must be on or after admission date", path: ["dischargeDate"] },
  );

describe("PatientInputForm schema", () => {
  it("passes validation with complete valid data", () => {
    const result = patientInputSchema.safeParse({
      facilityName: "Lagos General Hospital",
      admissionDate: "2026-05-01",
      dischargeDate: "2026-05-05",
      patientName: "Amina Bello",
      age: 34,
      gender: "Female",
      hospitalNumber: "LH-2026-0042",
      diagnosis: "Malaria",
      treatmentGiven: "IV Artesunate",
      medications: [{ name: "Artemether", dosage: "80mg", frequency: "twice daily" }],
      dischargedBy: "Dr. Emeka Okafor",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty facilityName", () => {
    const result = patientInputSchema.safeParse({
      facilityName: "",
      admissionDate: "2026-05-01",
      dischargeDate: "2026-05-05",
      patientName: "Amina Bello",
      age: 34,
      gender: "Female",
      hospitalNumber: "LH-2026-0042",
      diagnosis: "Malaria",
      treatmentGiven: "IV Artesunate",
      medications: [{ name: "Artemether", dosage: "80mg", frequency: "twice daily" }],
      dischargedBy: "Dr. Emeka Okafor",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("facilityName"))).toBe(true);
    }
  });

  it("rejects age below 0", () => {
    const result = patientInputSchema.safeParse({
      facilityName: "Lagos General Hospital",
      admissionDate: "2026-05-01",
      dischargeDate: "2026-05-05",
      patientName: "Amina Bello",
      age: -5,
      gender: "Female",
      hospitalNumber: "LH-2026-0042",
      diagnosis: "Malaria",
      treatmentGiven: "IV Artesunate",
      medications: [{ name: "Artemether", dosage: "80mg", frequency: "twice daily" }],
      dischargedBy: "Dr. Emeka Okafor",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("age"))).toBe(true);
    }
  });

  it("rejects age above 130", () => {
    const result = patientInputSchema.safeParse({
      facilityName: "Lagos General Hospital",
      admissionDate: "2026-05-01",
      dischargeDate: "2026-05-05",
      patientName: "Amina Bello",
      age: 150,
      gender: "Female",
      hospitalNumber: "LH-2026-0042",
      diagnosis: "Malaria",
      treatmentGiven: "IV Artesunate",
      medications: [{ name: "Artemether", dosage: "80mg", frequency: "twice daily" }],
      dischargedBy: "Dr. Emeka Okafor",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid gender", () => {
    const result = patientInputSchema.safeParse({
      facilityName: "Lagos General Hospital",
      admissionDate: "2026-05-01",
      dischargeDate: "2026-05-05",
      patientName: "Amina Bello",
      age: 34,
      gender: "Unknown",
      hospitalNumber: "LH-2026-0042",
      diagnosis: "Malaria",
      treatmentGiven: "IV Artesunate",
      medications: [{ name: "Artemether", dosage: "80mg", frequency: "twice daily" }],
      dischargedBy: "Dr. Emeka Okafor",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("gender"))).toBe(true);
    }
  });

  it("rejects discharge date before admission date", () => {
    const result = patientInputSchema.safeParse({
      facilityName: "Lagos General Hospital",
      admissionDate: "2026-05-10",
      dischargeDate: "2026-05-05",
      patientName: "Amina Bello",
      age: 34,
      gender: "Female",
      hospitalNumber: "LH-2026-0042",
      diagnosis: "Malaria",
      treatmentGiven: "IV Artesunate",
      medications: [{ name: "Artemether", dosage: "80mg", frequency: "twice daily" }],
      dischargedBy: "Dr. Emeka Okafor",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("dischargeDate"))).toBe(true);
    }
  });

  it("rejects empty medications array", () => {
    const result = patientInputSchema.safeParse({
      facilityName: "Lagos General Hospital",
      admissionDate: "2026-05-01",
      dischargeDate: "2026-05-05",
      patientName: "Amina Bello",
      age: 34,
      gender: "Female",
      hospitalNumber: "LH-2026-0042",
      diagnosis: "Malaria",
      treatmentGiven: "IV Artesunate",
      medications: [],
      dischargedBy: "Dr. Emeka Okafor",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("medications"))).toBe(true);
    }
  });

  it("rejects medication without dosage", () => {
    const result = medicationSchema.safeParse({
      name: "Paracetamol",
      dosage: "",
      frequency: "once daily",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes("dosage"))).toBe(true);
    }
  });

  it("passes optional fields as empty", () => {
    const result = patientInputSchema.safeParse({
      facilityName: "Lagos General Hospital",
      admissionDate: "2026-05-01",
      dischargeDate: "2026-05-05",
      patientName: "Amina Bello",
      age: 34,
      gender: "Female",
      hospitalNumber: "LH-2026-0042",
      diagnosis: "Malaria",
      treatmentGiven: "IV Artesunate",
      medications: [{ name: "Artemether", dosage: "80mg", frequency: "twice daily" }],
      dischargedBy: "Dr. Emeka Okafor",
      nhisNumber: "",
      proceduresPerformed: "",
      followUpInstructions: "",
      additionalNotes: "",
      clinicianLicenseNo: "",
    });
    expect(result.success).toBe(true);
  });

  it("accepts all language options", () => {
    for (const lang of ["en", "ha", "yo", "ig"] as const) {
      const result = patientInputSchema.safeParse({
        facilityName: "Lagos General Hospital",
        admissionDate: "2026-05-01",
        dischargeDate: "2026-05-05",
        patientName: "Amina Bello",
        age: 34,
        gender: "Female",
        hospitalNumber: "LH-2026-0042",
        diagnosis: "Malaria",
        treatmentGiven: "IV Artesunate",
        medications: [{ name: "Artemether", dosage: "80mg", frequency: "twice daily" }],
        dischargedBy: "Dr. Emeka Okafor",
        languageRequested: lang,
      });
      expect(result.success).toBe(true);
    }
  });
});
