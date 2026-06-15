import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/services/supabase-server";
import { apiError, ErrorCodes } from "@/lib/error-codes";
import { auth } from "@/lib/auth";
import { UserRole } from "@/types/schemas";

function escapeIlike(input: string): string {
  return input.replace(/%/g, "\\%").replace(/_/g, "\\_");
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.role) {
      return NextResponse.json(apiError(ErrorCodes.UNAUTHORIZED), { status: 401 });
    }

    if (session.user.role === UserRole.Admin) {
      return NextResponse.json(apiError(ErrorCodes.ROLE_NOT_PERMITTED), { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() ?? "";
    const status = searchParams.get("status")?.trim() ?? "";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
    const offset = (page - 1) * limit;

    const supabase = createServiceClient();

    let query = supabase
      .from("discharge_records")
      .select(`
        record_id, status, generated_at, facility_id,
        patient_input:patient_input_id (
          patient_name, facility_name, discharge_date, discharged_by
        )
      `, { count: "estimated" });

    if (!session.user.facilityId) {
      return NextResponse.json(
        apiError(ErrorCodes.ROLE_NOT_PERMITTED, { message: "No facility assigned. Contact your admin." }),
        { status: 403 },
      );
    }
    query = query.eq("facility_id", session.user.facilityId);

    if (status && ["draft", "finalised", "archived"].includes(status)) {
      query = query.eq("status", status);
    }

    if (search) {
      query = query.ilike("patient_input.patient_name", `%${escapeIlike(search)}%`);
    }

    const { data, error, count } = await query
      .order("generated_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const records = (data ?? []).map((d: Record<string, unknown>) => {
      const pi = d.patient_input as Record<string, unknown> | undefined;
      return {
        recordId: d.record_id,
        patientName: pi?.patient_name as string ?? "",
        facilityName: pi?.facility_name as string ?? "",
        dischargeDate: pi?.discharge_date as string ?? "",
        dischargedBy: pi?.discharged_by as string ?? "",
        status: d.status,
        generatedAt: d.generated_at,
      };
    });

    return NextResponse.json({
      success: true,
      data: records,
      pagination: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "INTERNAL_SERVER_ERROR";
    return NextResponse.json(
      apiError(ErrorCodes.SUPABASE_ERROR, { operation: "LIST discharge_records", details: message }),
      { status: 500 },
    );
  }
}
