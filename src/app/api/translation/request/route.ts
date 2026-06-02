import { NextRequest, NextResponse } from "next/server";
import { translateText } from "@/services/ai-provider";
import { createServiceClient } from "@/services/supabase-server";
import { writeAuditLog } from "@/services/audit-log";
import { AuditAction } from "@/types/schemas";
import { apiError, ErrorCodes } from "@/lib/error-codes";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recordId, targetLanguage, userId, userRole } = body;

    if (!["ha", "yo", "ig"].includes(targetLanguage)) {
      return NextResponse.json(
        apiError(ErrorCodes.INVALID_LANGUAGE, {
          provided: targetLanguage,
          allowed: ["ha", "yo", "ig"],
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

    if (result.fallbackUsed) {
      await writeAuditLog({
        recordId,
        userId,
        userRole,
      action: AuditAction.Edit,
        ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
        notes: `Translation to ${targetLanguage} had low confidence. Using English fallback.`,
      });

      return NextResponse.json({
        success: true,
        warning: {
          code: "TRANSLATION_LOW_CONFIDENCE",
          message: "Translation confidence is low. English version will be shown.",
          details: {
            targetLanguage,
            confidence: result.confidence,
            fallbackUsed: true,
          },
        },
        data: {
          translatedOutput: null,
          patientFriendlyOutput: record.patient_friendly_output,
        },
      });
    }

    const { error: updateError } = await supabase
      .from("discharge_records")
      .update({
        translated_output: result.translatedOutput,
        translation_language: targetLanguage,
        translation_confidence: result.confidence,
      })
      .eq("record_id", recordId);

    if (updateError) {
      return NextResponse.json(
        apiError(ErrorCodes.SUPABASE_ERROR, { operation: "UPDATE translation" }),
        { status: 500 },
      );
    }

    await writeAuditLog({
      recordId,
      userId,
      userRole,
      action: AuditAction.Edit,
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
      changesDiff: { translationLanguage: targetLanguage },
      notes: `Translation completed for ${targetLanguage}`,
    });

    return NextResponse.json({
      success: true,
      data: {
        translatedOutput: result.translatedOutput,
        translationLanguage: targetLanguage,
        confidence: result.confidence,
      },
    });
  } catch {
    return NextResponse.json(
      apiError(ErrorCodes.TRANSLATION_FAILED),
      { status: 500 },
    );
  }
}
