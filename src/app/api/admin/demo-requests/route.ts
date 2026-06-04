import { NextResponse } from "next/server";
import { createServiceClient } from "@/services/supabase-server";
import { auth } from "@/lib/auth";
import { UserRole } from "@/types/schemas";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session?.user?.role !== UserRole.Admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("demo_requests")
      .select("id, full_name, role, facility_name, whatsapp_number, email, state, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data: data ?? [] });
  } catch {
    return NextResponse.json({ error: "Failed to load demo requests" }, { status: 500 });
  }
}
