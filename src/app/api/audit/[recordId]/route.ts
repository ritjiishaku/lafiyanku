import { NextRequest, NextResponse } from "next/server";
import { getAuditLogs } from "@/services/audit-log";
import { apiError, ErrorCodes } from "@/lib/error-codes";
import { auth } from "@/lib/auth";
import { UserRole } from "@/types/schemas";
import { verifyFacilityAccess } from "@/services/facility-access";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ recordId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.role) {
      return NextResponse.json(apiError(ErrorCodes.UNAUTHORIZED), { status: 401 });
    }

    if (session.user.role !== UserRole.Admin) {
      return NextResponse.json(
        apiError(ErrorCodes.ROLE_NOT_PERMITTED, { requiredRole: "admin" }),
        { status: 403 },
      );
    }

    const { recordId } = await params;

    const access = await verifyFacilityAccess(recordId, session.user.facilityId);
    if (!access.allowed) {
      return NextResponse.json(apiError(ErrorCodes.ROLE_NOT_PERMITTED), { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));

    const { logs, total } = await getAuditLogs(recordId, { page, limit });
    return NextResponse.json({
      success: true,
      data: logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json(
      apiError(ErrorCodes.SUPABASE_ERROR, { operation: "SELECT audit_logs" }),
      { status: 500 },
    );
  }
}
