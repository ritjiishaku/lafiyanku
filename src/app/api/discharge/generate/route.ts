import { NextRequest, NextResponse } from "next/server";
import { generateDischarge, translateText, getPromptVersion, getModelVersion } from "@/services/ai-provider";
import { writeAuditLog } from "@/services/audit-log";
import { createServiceClient } from "@/services/supabase-server";
import { AuditAction, Language, TranslationConfidence, UserRole } from "@/types/schemas";
import { apiError, ErrorCodes } from "@/lib/error-codes";
import { auth } from "@/lib/auth";

const VALID_LANGUAGES = ["en", "ha", "yo", "ig"];

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

    const generationResult = await generateDischarge(patientInput);

    const supabase = createServiceClient();
    const recordId = crypto.randomUUID();

    let translatedOutput: string | null = null;
    let translationLanguage: string | null = null;
    let translationConfidence: string | null = null;

    const langRequested = patientInput.languageRequested as string | undefined;
    if (langRequested && langRequested !== "en") {
      if (!VALID_LANGUAGES.includes(langRequested)) {
        return NextResponse.json(
          apiError(ErrorCodes.INVALID_LANGUAGE, { provided: langRequested, allowed: ["ha", "yo", "ig"] }),
          { status: 400 },
        );
      }

      translationLanguage = langRequested;

      const translation = await translateText(
        generationResult.patientFriendlyOutput,
        langRequested,
      );

      translatedOutput = translation.confidence === "failed" ? null : translation.translatedOutput;
      translationConfidence = translation.confidence;
    }

    const { error: insertError } = await supabase.from("discharge_records").insert({
      record_id: recordId,
      patient_input_id: patientInput.patientId ?? null,
      facility_id: patientInput.facilityId ?? null,
      generated_at: new Date().toISOString(),
      generated_by_user_id: userId,
      prompt_version: getPromptVersion(),
      model_version: getModelVersion(),
      clinical_summary: generationResult.clinicalSummary,
      patient_friendly_output: generationResult.patientFriendlyOutput,
      translated_output: translatedOutput,
      translation_language: translationLanguage,
      translation_confidence: translationConfidence,
      missing_fields_log: generationResult.missingFieldsLog,
      flagged_issues: generationResult.flaggedIssues,
      status: "draft",
    });

    if (insertError) {
      return NextResponse.json(
        apiError(ErrorCodes.SUPABASE_ERROR, { operation: "INSERT discharge_records" }),
        { status: 500 },
      );
    }

    if (langRequested && langRequested !== "en" && translationConfidence !== "failed") {
      await supabase.from("translation_requests").insert({
        request_id: crypto.randomUUID(),
        record_id: recordId,
        source_text: generationResult.patientFriendlyOutput,
        target_language: langRequested,
        output_text: translatedOutput,
        confidence: translationConfidence === "low" ? TranslationConfidence.Low : TranslationConfidence.High,
        fallback_used: translationConfidence === "low" ? "yes" : "no",
        requested_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      });
    }

    await writeAuditLog({
      recordId,
      userId,
      userRole: userRole as any,
      action: AuditAction.Generate,
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
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
