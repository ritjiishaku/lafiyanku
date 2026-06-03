import { NextRequest, NextResponse } from "next/server";
import { translateText } from "@/services/ai-provider";
import { createServiceClient } from "@/services/supabase-server";
import { writeAuditLog } from "@/services/audit-log";
import { AuditAction, UserRole } from "@/types/schemas";
import { apiError, ErrorCodes } from "@/lib/error-codes";
import { auth } from "@/lib/auth";

const VALID_LANGUAGES = ["ha", "yo", "ig"];

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.role) {
      return NextResponse.json(apiError(ErrorCodes.UNAUTHORIZED), { status: 401 });
    }

    const role = session.user.role;
    if (role !== UserRole.Doctor && role !== UserRole.Nurse) {
      return NextResponse.json(apiError(ErrorCodes.ROLE_NOT_PERMITTED), { status: 403 });
    }

    const body = await request.json();
    const { recordId, targetLanguage } = body;

    if (!targetLanguage || !VALID_LANGUAGES.includes(targetLanguage)) {
      return NextResponse.json(
        apiError(ErrorCodes.INVALID_LANGUAGE, {
          provided: targetLanguage,
          allowed: VALID_LANGUAGES,
        }),
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    const { data: record, error: findError } = await supabase
      .from("discharge_records")
      .select("patient_friendly_output, record_id")
      .eq("record_id", recordId)
      .single();

    if (findError || !record) {
      return NextResponse.json(
        apiError(ErrorCodes.RECORD_NOT_FOUND, { recordId }),
        { status: 404 },
      );
    }

    const result = await translateText(
      record.patient_friendly_output,
      targetLanguage,
    );

    await supabase.from("translation_requests").insert({
      request_id: crypto.randomUUID(),
      record_id: recordId,
      source_text: record.patient_friendly_output,
      target_language: targetLanguage,
      output_text: result.confidence === "failed" ? null : result.translatedOutput,
      confidence: result.confidence === "failed" ? null : result.confidence,
      fallback_used: result.fallbackUsed ? "yes" : "no",
      requested_at: new Date().toISOString(),
      completed_at: result.confidence !== "failed" ? new Date().toISOString() : null,
    });

    await supabase
      .from("discharge_records")
      .update({
        translated_output: result.translatedOutput,
        translation_language: targetLanguage,
        translation_confidence: result.confidence,
      })
      .eq("record_id", recordId);

    await writeAuditLog({
      recordId,
      userId: session.user.id,
      userRole: role as any,
      action: AuditAction.Edit,
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
      notes: result.fallbackUsed
        ? `Translation to ${targetLanguage} had low confidence. English fallback used.`
        : `Translation completed for ${targetLanguage}`,
    });

    return NextResponse.json({
      success: true,
      data: {
        translatedOutput: result.translatedOutput,
        translationLanguage: targetLanguage,
        confidence: result.confidence,
        fallbackUsed: result.fallbackUsed,
      },
      ...(result.fallbackUsed
        ? {
            warning: {
              code: "TRANSLATION_LOW_CONFIDENCE",
              message: `Translation into ${targetLanguage === "ha" ? "Hausa" : targetLanguage === "yo" ? "Yoruba" : "Igbo"} could not be completed with sufficient confidence.`,
            },
          }
        : {}),
    });
  } catch {
    return NextResponse.json(
      apiError(ErrorCodes.TRANSLATION_FAILED),
      { status: 500 },
    );
  }
}
