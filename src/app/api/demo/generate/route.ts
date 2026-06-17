import { NextRequest, NextResponse } from "next/server";
import { generateDischarge, translateText } from "@/services/ai-provider";
import { apiError, ErrorCodes } from "@/lib/error-codes";
import { checkRateLimit } from "@/services/rate-limit";

const VALID_LANGUAGES = ["en", "ha", "yo", "ig"];

const DEMO_RATE_LIMIT = { maxAttempts: 5, windowMs: 60 * 60 * 1000 }; // 5 per hour

const REQUIRED = [
  "facilityName", "admissionDate", "dischargeDate",
  "patientName", "age", "gender", "hospitalNumber",
  "diagnosis", "treatmentGiven", "medications", "dischargedBy",
] as const;

function validateInput(body: Record<string, unknown>): string[] {
  const missing: string[] = [];
  for (const field of REQUIRED) {
    const value = body[field];
    if (value === undefined || value === null || value === "") {
      missing.push(field);
    }
  }
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

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    const rateLimit = await checkRateLimit(
      ip,
      "demo-generate",
      DEMO_RATE_LIMIT.maxAttempts,
      DEMO_RATE_LIMIT.windowMs,
    );
    if (rateLimit.limited) {
      return NextResponse.json(apiError(ErrorCodes.RATE_LIMITED), { status: 429 });
    }

    const body = await request.json();

    const missingFields = validateInput(body);
    if (missingFields.length > 0) {
      return NextResponse.json(
        apiError(ErrorCodes.MISSING_REQUIRED_FIELD, { fields: missingFields }),
        { status: 400 },
      );
    }

    const generationResult = await generateDischarge(body);

    if (!generationResult.clinicalSummary || !generationResult.patientFriendlyOutput) {
      return NextResponse.json(
        apiError(ErrorCodes.GENERATION_FAILED, { details: "AI returned empty output." }),
        { status: 500 },
      );
    }

    let translatedOutput: string | null = null;
    let translationLanguage: string | null = null;
    let translationConfidence: string | null = null;

    const langRequested = body.languageRequested as string | undefined;
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

    return NextResponse.json({
      success: true,
      data: {
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
    console.error("[demo-generate] Error:", message);

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
