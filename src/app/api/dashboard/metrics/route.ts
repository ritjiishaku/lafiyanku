import { NextResponse } from "next/server";
import { createServiceClient } from "@/services/supabase-server";
import { auth } from "@/lib/auth";
import { UserRole } from "@/types/schemas";
import { apiError, ErrorCodes } from "@/lib/error-codes";

async function countQuery(query: PromiseLike<{ count: number | null }>): Promise<number> {
  const res = await query;
  return res.count ?? 0;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.role) {
      return NextResponse.json(apiError(ErrorCodes.UNAUTHORIZED), { status: 401 });
    }

    if (session.user.role === UserRole.Admin) {
      return NextResponse.json(apiError(ErrorCodes.ROLE_NOT_PERMITTED), { status: 403 });
    }

    const supabase = createServiceClient();
    const facilityId = session.user.facilityId;
    const baseQuery = supabase.from("discharge_records");

    async function scopedCount(select: ReturnType<typeof baseQuery.select>) {
      const q = facilityId ? select.eq("facility_id", facilityId) : select;
      return countQuery(q);
    }

    const [total, draft, finalised, archived] = await Promise.all([
      scopedCount(baseQuery.select("*", { count: "estimated", head: true })),
      scopedCount(baseQuery.select("*", { count: "estimated", head: true }).eq("status", "draft")),
      scopedCount(baseQuery.select("*", { count: "estimated", head: true }).eq("status", "finalised")),
      scopedCount(baseQuery.select("*", { count: "estimated", head: true }).eq("status", "archived")),
    ]);

    return NextResponse.json({
      success: true,
      data: { total, draft, finalised, archived },
    });
  } catch {
    return NextResponse.json(apiError(ErrorCodes.SUPABASE_ERROR), { status: 500 });
  }
}
