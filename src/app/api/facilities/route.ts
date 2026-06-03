import { NextResponse } from "next/server";
import { createServiceClient } from "@/services/supabase-server";

export async function GET() {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("facilities")
      .select("facility_id, facility_name, facility_code")
      .order("facility_name");

    if (error) throw error;

    return NextResponse.json({ success: true, data: data ?? [] });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to load facilities" },
      { status: 500 },
    );
  }
}
