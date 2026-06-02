import { NextRequest, NextResponse } from "next/server";
import { getAuditLogs } from "@/services/audit-log";
import { apiError, ErrorCodes } from "@/lib/error-codes";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ recordId: string }> },
) {
  const { recordId } = await params;

  try {
    const logs = await getAuditLogs(recordId);
    return NextResponse.json({ success: true, data: logs });
  } catch {
    return NextResponse.json(
      apiError(ErrorCodes.SUPABASE_ERROR, { operation: "SELECT audit_logs" }),
      { status: 500 },
    );
  }
}
