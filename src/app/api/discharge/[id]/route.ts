import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/services/supabase-server";
import { apiError, ErrorCodes } from "@/lib/error-codes";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("discharge_records")
    .select("*")
    .eq("record_id", id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      apiError(ErrorCodes.RECORD_NOT_FOUND, { recordId: id }),
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, data });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();

  const supabase = createServiceClient();

  const { data: existing, error: findError } = await supabase
    .from("discharge_records")
    .select("status")
    .eq("record_id", id)
    .single();

  if (findError || !existing) {
    return NextResponse.json(
      apiError(ErrorCodes.RECORD_NOT_FOUND, { recordId: id }),
      { status: 404 },
    );
  }

  if (existing.status === "archived") {
    return NextResponse.json(
      apiError(ErrorCodes.RECORD_ARCHIVED, { action: "edit", recordId: id }),
      { status: 400 },
    );
  }

  const { error: updateError } = await supabase
    .from("discharge_records")
    .update({
      clinical_summary: body.clinicalSummary,
      patient_friendly_output: body.patientFriendlyOutput,
      status: body.status ?? existing.status,
      last_edited_at: new Date().toISOString(),
      last_edited_by_user_id: body.editedByUserId,
    })
    .eq("record_id", id);

  if (updateError) {
    return NextResponse.json(
      apiError(ErrorCodes.SUPABASE_ERROR, { operation: "UPDATE discharge_records" }),
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
