import { createServiceClient } from "./supabase-server";
import type { AuditLog, AuditAction, UserRole } from "@/types/schemas";

export async function writeAuditLog(entry: {
  recordId: string;
  userId: string;
  userRole: UserRole;
  action: AuditAction;
  ipAddress?: string;
  changesDiff?: Record<string, unknown>;
  notes?: string;
}): Promise<void> {
  const supabase = createServiceClient();

  const { error } = await supabase.from("audit_logs").insert({
    record_id: entry.recordId,
    user_id: entry.userId,
    user_role: entry.userRole,
    action: entry.action,
    ip_address: entry.ipAddress ?? null,
    changes_diff: entry.changesDiff ?? null,
    notes: entry.notes ?? null,
  });

  if (error) {
    throw new Error("AUDIT_LOG_WRITE_FAILED");
  }
}

export async function getAuditLogs(
  recordId: string,
  options?: { page?: number; limit?: number },
): Promise<{ logs: AuditLog[]; total: number }> {
  const supabase = createServiceClient();
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 20;
  const offset = (page - 1) * limit;

  const { count, error: countError } = await supabase
    .from("audit_logs")
    .select("*", { count: "exact", head: true })
    .eq("record_id", recordId);

  if (countError) throw new Error("SUPABASE_ERROR");

  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("record_id", recordId)
    .order("timestamp", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error("SUPABASE_ERROR");

  return {
    logs: (data ?? []).map(mapAuditLog),
    total: count ?? 0,
  };
}

function mapAuditLog(raw: Record<string, unknown>): AuditLog {
  return {
    logId: raw.log_id as string,
    recordId: raw.record_id as string,
    userId: raw.user_id as string,
    userRole: raw.user_role as UserRole,
    action: raw.action as AuditAction,
    timestamp: raw.timestamp as string,
    ipAddress: raw.ip_address as string | null,
    changesDiff: raw.changes_diff as Record<string, unknown> | null,
    notes: raw.notes as string | null,
  };
}
