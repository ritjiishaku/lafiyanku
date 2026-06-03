import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/services/supabase-server";
import { apiError, ErrorCodes } from "@/lib/error-codes";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.role) {
      return NextResponse.json(apiError(ErrorCodes.UNAUTHORIZED), { status: 401 });
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
      .select(`*, patient_input:patient_input_id (
        patient_name, facility_name, discharge_date, discharged_by
      )`, { count: "exact" });

    if (status && ["draft", "finalised", "archived"].includes(status)) {
      query = query.eq("status", status);
    }

    if (search) {
      const { data: matchingInputs } = await supabase
        .from("patient_inputs")
        .select("patient_id")
        .ilike("patient_name", `%${search}%`);

      if (matchingInputs && matchingInputs.length > 0) {
        const ids = matchingInputs.map((r: Record<string, unknown>) => r.patient_id);
        query = query.in("patient_input_id", ids);
      } else {
        return NextResponse.json({
          success: true,
          data: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
        });
      }
    }

    const { data, error, count } = await query
      .order("generated_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const records = (data ?? []).map((d: Record<string, unknown>) => {
      const pi = d.patient_input as Record<string, unknown> | undefined;
      return {
        recordId: d.record_id,
        patientName: pi?.patient_name ?? "",
        facilityName: pi?.facility_name ?? "",
        dischargeDate: pi?.discharge_date ?? "",
        dischargedBy: pi?.discharged_by ?? "",
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
  } catch {
    return NextResponse.json(
      apiError(ErrorCodes.SUPABASE_ERROR, { operation: "LIST discharge_records" }),
      { status: 500 },
    );
  }
}
