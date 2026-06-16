import { NextRequest, NextResponse } from "next/server";
import { generateDischarge, translateText, getPromptVersion, getModelVersion } from "@/services/ai-provider";
import { createServiceClient } from "@/services/supabase-server";
import { UserRole, AuditAction } from "@/types/schemas";
import { writeAuditLog } from "@/services/audit-log";
import { apiError, ErrorCodes } from "@/lib/error-codes";
import { auth } from "@/lib/auth";
import { checkRateLimit } from "@/services/rate-limit";

const VALID_LANGUAGES = ["en", "ha", "yo", "ig"];

const GENERATE_RATE_LIMIT = { maxAttempts: 10, windowMs: 60 * 60 * 1000 }; // 10 per hour

const REQUIRED = [
  "facilityName", "admissionDate", "dischargeDate",
  "patientName", "age", "gender", "hospitalNumber",
  "diagnosis", "treatmentGiven", "medications", "dischargedBy",
] as const;

function validatePatientInput(body: Record<string, unknown>): string[] {
  const missing: string[] = [];
  for (const field of REQUIRED) {
    const value = body[field];
    if (value === undefined || value === null || value === "") {
      missing.push(field);
    }
  }
  // Type validation
  if (body.age !== undefined && body.age !== null && body.age !== "") {
    if (typeof body.age !== "number" || isNaN(body.age)) {
      missing.push("age (must be a number)");
    }
  }
  if (body.gender !== undefined && body.gender !== null && body.gender !== "") {
    if (!["Male", "Female", "Other"].includes(body.gender as string)) {
      missing.push("gender (must be Male, Female, or Other)");
    }
  }
  if (body.medications !== undefined && body.medications !== null) {
    if (!Array.isArray(body.medications) || body.medications.length === 0) {
      missing.push("medications (must be a non-empty array)");
    }
  }
  return missing;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.role) {
      return NextResponse.json(apiError(ErrorCodes.UNAUTHORIZED), { status: 401 });
    }
    const userId = session.user.id;
    const userRole = session.user.role;

    if (userRole !== UserRole.Doctor && userRole !== UserRole.Nurse) {
      return NextResponse.json(apiError(ErrorCodes.ROLE_NOT_PERMITTED), { status: 403 });
    }

    const rateLimit = await checkRateLimit(
      userId,
      "generate",
      GENERATE_RATE_LIMIT.maxAttempts,
      GENERATE_RATE_LIMIT.windowMs,
    );
    if (rateLimit.limited) {
      return NextResponse.json(apiError(ErrorCodes.RATE_LIMITED), { status: 429 });
    }

    const body = await request.json();
    const patientInput = body.patientInput as Record<string, unknown> | undefined;

    if (!patientInput) {
      return NextResponse.json(
        apiError(ErrorCodes.MISSING_REQUIRED_FIELD, { field: "patientInput" }),
        { status: 400 },
      );
    }

    const missingFields = validatePatientInput(patientInput);
    if (missingFields.length > 0) {
      return NextResponse.json(
        apiError(ErrorCodes.MISSING_REQUIRED_FIELD, { fields: missingFields }),
        { status: 400 },
      );
    }

    if (!patientInput.consentGiven) {
      return NextResponse.json(
        apiError(ErrorCodes.MISSING_REQUIRED_FIELD, { field: "consentGiven", message: "Patient consent is required before generating discharge documentation." }),
        { status: 400 },
      );
    }

    const generationResult = await generateDischarge(patientInput);

    if (!generationResult.clinicalSummary || !generationResult.patientFriendlyOutput) {
      return NextResponse.json(
        apiError(ErrorCodes.GENERATION_FAILED, { details: "AI returned empty output. Please try again." }),
        { status: 500 },
      );
    }

    const supabase = createServiceClient();
    const patientId = crypto.randomUUID();
    const recordId = crypto.randomUUID();

    const facilityId = session.user.facilityId;
    if (!facilityId) {
      return NextResponse.json(
        apiError(ErrorCodes.MISSING_REQUIRED_FIELD, { field: "facilityId", message: "Facility assignment required. Contact your admin." }),
        { status: 400 },
      );
    }

    let translatedOutput: string | null = null;
    let translationLanguage: string | null = null;
    let translationConfidence: string | null = null;
    let translationRequestId: string | null = null;

    const langRequested = patientInput.languageRequested as string | undefined;
    if (langRequested && langRequested !== "en") {
      if (!VALID_LANGUAGES.includes(langRequested)) {
        return NextResponse.json(
          apiError(ErrorCodes.INVALID_LANGUAGE, { provided: langRequested, allowed: ["ha", "yo", "ig"] }),
          { status: 400 },
        );
      }

      translationLanguage = langRequested;
      translationRequestId = crypto.randomUUID();

      const translation = await translateText(
        generationResult.patientFriendlyOutput,
        langRequested,
      );

      translatedOutput = translation.confidence === "failed" ? null : translation.translatedOutput;
      translationConfidence = translation.confidence;
    }

    const { error: rpcError } = await supabase.rpc("create_discharge_record", {
      p_patient_id: patientId,
      p_record_id: recordId,
      p_facility_id: facilityId,
      p_facility_name: patientInput.facilityName as string,
      p_facility_code: (patientInput.facilityCode as string) ?? null,
      p_ward_name: (patientInput.wardName as string) ?? null,
      p_admission_date: patientInput.admissionDate as string,
      p_discharge_date: patientInput.dischargeDate as string,
      p_patient_name: patientInput.patientName as string,
      p_age: patientInput.age as number,
      p_gender: patientInput.gender as string,
      p_hospital_number: patientInput.hospitalNumber as string,
      p_nhis_number: (patientInput.nhisNumber as string) ?? null,
      p_diagnosis: patientInput.diagnosis as string,
      p_treatment_given: patientInput.treatmentGiven as string,
      p_procedures_performed: (patientInput.proceduresPerformed as string[]) ?? [],
      p_medications: patientInput.medications,
      p_follow_up_instructions: (patientInput.followUpInstructions as string) ?? null,
      p_additional_notes: (patientInput.additionalNotes as string) ?? null,
      p_language_requested: (patientInput.languageRequested as string) ?? "en",
      p_discharged_by: patientInput.dischargedBy as string,
      p_clinician_license_no: (patientInput.clinicianLicenseNo as string) ?? null,
      p_generated_by_user_id: userId,
      p_user_role: userRole,
      p_prompt_version: getPromptVersion(),
      p_model_version: getModelVersion(),
      p_clinical_summary: generationResult.clinicalSummary,
      p_patient_friendly_output: generationResult.patientFriendlyOutput,
      p_translated_output: translatedOutput,
      p_translation_language: translationLanguage,
      p_translation_confidence: translationConfidence,
      p_missing_fields_log: generationResult.missingFieldsLog ?? [],
      p_flagged_issues: generationResult.flaggedIssues ?? [],
      p_translation_request_id: translationRequestId,
      p_translation_source_text: generationResult.patientFriendlyOutput,
      p_translation_target_language: translationLanguage,
      p_consent_given: true,
      p_consent_timestamp: new Date().toISOString(),
    });

    if (rpcError) {
      console.error("[generate] RPC create_discharge_record failed:", {
        message: rpcError.message,
        code: rpcError.code,
        details: rpcError.details,
        hint: rpcError.hint,
      });
      return NextResponse.json(
        apiError(ErrorCodes.SUPABASE_ERROR, { details: rpcError.message, code: rpcError.code, hint: rpcError.hint }),
        { status: 500 },
      );
    }

    await writeAuditLog({
      recordId,
      userId,
      userRole: userRole as UserRole,
      action: AuditAction.Generate,
      facilityId: session.user.facilityId,
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
      notes: translationLanguage
        ? `Generated with ${translationLanguage} translation`
        : undefined,
    });

    return NextResponse.json({
      success: true,
      data: {
        recordId,
        clinicalSummary: generationResult.clinicalSummary,
        patientFriendlyOutput: generationResult.patientFriendlyOutput,
        translatedOutput,
        translationLanguage,
        translationConfidence,
        missingFieldsLog: generationResult.missingFieldsLog,
        flaggedIssues: generationResult.flaggedIssues,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "INTERNAL_SERVER_ERROR";
    console.error("[generate] Unexpected error:", { message, stack: err instanceof Error ? err.stack : undefined });

    if (message === "GENERATION_TIMEOUT") {
      return NextResponse.json(apiError(ErrorCodes.GENERATION_TIMEOUT), { status: 500 });
    }
    if (message === "DEEPSEEK_RATE_LIMITED") {
      return NextResponse.json(apiError(ErrorCodes.DEEPSEEK_RATE_LIMITED), { status: 500 });
    }
    if (message === "DEEPSEEK_AUTH_FAILED") {
      return NextResponse.json(apiError(ErrorCodes.DEEPSEEK_AUTH_FAILED), { status: 500 });
    }

    return NextResponse.json(apiError(ErrorCodes.GENERATION_FAILED), { status: 500 });
  }
}
