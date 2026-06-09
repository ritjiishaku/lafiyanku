"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AuditLogTable } from "@/components/shared/AuditLogTable";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useRole } from "@/hooks/useRole";

interface AuditEntry {
  logId: string;
  userId: string;
  userRole: string;
  action: string;
  timestamp: string;
  ipAddress: string | null;
  changesDiff: Record<string, unknown> | null;
  notes: string | null;
}

export default function AuditLogPage() {
  const params = useParams<{ recordId: string }>();
  const { role } = useRole();
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!role) return;

    async function fetchLogs() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/audit/${params.recordId}?page=${page}&limit=20`,
          { headers: { "x-user-role": role } },
        );
        const json = await res.json();
        if (json.success) {
          setLogs(json.data);
          setTotalPages(json.pagination.totalPages);
        } else {
          setError(json.error?.message ?? "Failed to load audit logs");
        }
      } catch {
        setError("Failed to load audit logs");
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, [params.recordId, page, role]);

  if (role && role !== "admin") {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center text-cool-grey">
          Only Admin users can view audit logs.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto flex h-full min-h-0 max-w-6xl flex-col p-4 sm:p-6">
        <div className="mb-6 flex-shrink-0 space-y-1">
          <h1 className="text-2xl font-bold text-deep-navy sm:text-3xl">
            Audit Log
          </h1>
          <p className="text-sm text-cool-grey">
            Record: <span className="font-mono">{params.recordId}</span>
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : (
          <AuditLogTable
            logs={logs}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            className="flex-1"
          />
        )}
      </div>
    </AppShell>
  );
}
