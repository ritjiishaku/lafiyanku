import { NextResponse } from "next/server";
import { createServiceClient } from "@/services/supabase-server";

export async function GET() {
  let supabaseConnected = false;

  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from("patient_inputs").select("patient_id", { count: "exact", head: true });
    supabaseConnected = !error;
  } catch {
    supabaseConnected = false;
  }

  return NextResponse.json({
    status: supabaseConnected ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    version: process.env.CFW_AI_MODEL_VERSION ?? "unknown",
    supabase: supabaseConnected ? "connected" : "disconnected",
  });
}
