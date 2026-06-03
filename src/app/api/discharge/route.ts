import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/services/supabase-server";
import { apiError, ErrorCodes } from "@/lib/error-codes";
import { auth } from "@/lib/auth";
import { UserRole } from "@/types/schemas";

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
      .select("*", { count: "estimated" });

    if (session.user.facilityId) {
      query = query.eq("facility_id", session.user.facilityId);
    }

    if (status && ["draft", "finalised", "archived"].includes(status)) {
      query = query.eq("status", status);
    }

    let searchIds: string[] | null = null;
    if (search) {
      const { data: matchingInputs } = await supabase
        .from("patient_inputs")
        .select("patient_id")
        .ilike("patient_name", `%${search}%`);

      if (matchingInputs && matchingInputs.length > 0) {
        searchIds = matchingInputs.map((r: Record<string, unknown>) => r.patient_id as string);
      } else {
        return NextResponse.json({
          success: true,
          data: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
        });
      }
    }

    if (searchIds) {
      query = query.in("patient_input_id", searchIds);
    }

    const { data, error, count } = await query
      .order("generated_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const recordIds = (data ?? []).map((d: Record<string, unknown>) => d.patient_input_id as string);
    const { data: inputs } = recordIds.length > 0
      ? await supabase.from("patient_inputs").select("patient_id, patient_name, facility_name, discharge_date, discharged_by").in("patient_id", recordIds)
      : { data: [] };

    const inputMap = new Map((inputs ?? []).map((i: Record<string, unknown>) => [i.patient_id, i]));

    const records = (data ?? []).map((d: Record<string, unknown>) => {
      const pi = inputMap.get(d.patient_input_id as string);
      return {
        recordId: d.record_id,
        patientName: (pi as Record<string, unknown> | undefined)?.patient_name ?? "",
        facilityName: (pi as Record<string, unknown> | undefined)?.facility_name ?? "",
        dischargeDate: (pi as Record<string, unknown> | undefined)?.discharge_date ?? "",
        dischargedBy: (pi as Record<string, unknown> | undefined)?.discharged_by ?? "",
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
    console.error("DISCHARGE LIST ERROR:", err);
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    return NextResponse.json(
      { success: false, error: { code: "SUPABASE_ERROR", message, details: { operation: "LIST discharge_records" } } },
      { status: 500 },
    );
  }
}
