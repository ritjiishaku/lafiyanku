import { NextRequest, NextResponse } from "next/server";
import { generateDischarge, getPromptVersion, getModelVersion } from "@/services/ai-provider";
import { writeAuditLog } from "@/services/audit-log";
import { createServiceClient } from "@/services/supabase-server";
import { AuditAction } from "@/types/schemas";
import { apiError, ErrorCodes } from "@/lib/error-codes";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientInput, userId, userRole } = body;

    if (!patientInput) {
      return NextResponse.json(
        apiError(ErrorCodes.MISSING_REQUIRED_FIELD, { field: "patientInput" }),
        { status: 400 },
      );
    }

    const generationResult = await generateDischarge(patientInput);

    const supabase = createServiceClient();

    const recordId = crypto.randomUUID();

    const { error: insertError } = await supabase.from("discharge_records").insert({
      record_id: recordId,
      patient_input_id: patientInput.patientId,
      generated_at: new Date().toISOString(),
      generated_by_user_id: userId,
      prompt_version: getPromptVersion(),
      model_version: getModelVersion(),
      clinical_summary: generationResult.clinicalSummary,
      patient_friendly_output: generationResult.patientFriendlyOutput,
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

    await writeAuditLog({
      recordId,
      userId,
      userRole,
      action: AuditAction.Generate,
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
    });

    return NextResponse.json({
      success: true,
      data: {
        recordId,
        clinicalSummary: generationResult.clinicalSummary,
        patientFriendlyOutput: generationResult.patientFriendlyOutput,
        missingFieldsLog: generationResult.missingFieldsLog,
        flaggedIssues: generationResult.flaggedIssues,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "INTERNAL_SERVER_ERROR";

    if (message === "GENERATION_TIMEOUT") {
      return NextResponse.json(
        apiError(ErrorCodes.GENERATION_TIMEOUT),
        { status: 500 },
      );
    }

    if (message === "DEEPSEEK_RATE_LIMITED") {
      return NextResponse.json(
        apiError(ErrorCodes.DEEPSEEK_RATE_LIMITED),
        { status: 500 },
      );
    }

    if (message === "DEEPSEEK_AUTH_FAILED") {
      return NextResponse.json(
        apiError(ErrorCodes.DEEPSEEK_AUTH_FAILED),
        { status: 500 },
      );
    }

    return NextResponse.json(
      apiError(ErrorCodes.GENERATION_FAILED),
      { status: 500 },
    );
  }
}
