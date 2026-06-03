import { NextResponse } from "next/server";
import { createServiceClient } from "@/services/supabase-server";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceClient();
    const baseQuery = supabase.from("discharge_records");

    const facilityFilter = session.user.facilityId
      ? (q: any) => q.eq("facility_id", session.user.facilityId)
      : (q: any) => q;

    const [total, draft, finalised, archived] = await Promise.all([
      facilityFilter(baseQuery.select("*", { count: "estimated", head: true })).then((r: any) => r.count ?? 0),
      facilityFilter(baseQuery.select("*", { count: "estimated", head: true }).eq("status", "draft")).then((r: any) => r.count ?? 0),
      facilityFilter(baseQuery.select("*", { count: "estimated", head: true }).eq("status", "finalised")).then((r: any) => r.count ?? 0),
      facilityFilter(baseQuery.select("*", { count: "estimated", head: true }).eq("status", "archived")).then((r: any) => r.count ?? 0),
    ]);

    return NextResponse.json({
      success: true,
      data: { total, draft, finalised, archived },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load metrics" }, { status: 500 });
  }
}
