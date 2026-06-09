"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface AuditLogTableProps {
  logs: AuditEntry[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function formatAction(action: string): string {
  return action.charAt(0).toUpperCase() + action.slice(1);
}

function formatTimestamp(ts: string): string {
  try {
    return new Date(ts).toLocaleString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Africa/Lagos",
    });
  } catch {
    return ts;
  }
}

export function AuditLogTable({
  logs,
  page,
  totalPages,
  onPageChange,
  className,
}: AuditLogTableProps) {
  if (logs.length === 0) {
    return (
      <div className="rounded-lg border border-slate/10 bg-white p-8 text-center text-cool-grey">
        No audit log entries found for this record.
      </div>
    );
  }

  return (
    <div className={cn("flex min-h-0 flex-col space-y-4", className)}>
      <div className="flex min-h-0 flex-1 overflow-hidden rounded-lg border border-slate/10">
        <div className="h-full overflow-auto">
          <div className="inline-block min-w-full align-middle">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-cool-off-white">
                <tr className="border-b border-slate/10">
                  <th scope="col" className="px-3 py-2 font-semibold text-deep-navy sm:px-4 sm:py-3">Timestamp</th>
                  <th scope="col" className="px-3 py-2 font-semibold text-deep-navy sm:px-4 sm:py-3">User</th>
                  <th scope="col" className="px-3 py-2 font-semibold text-deep-navy sm:px-4 sm:py-3">Role</th>
                  <th scope="col" className="px-3 py-2 font-semibold text-deep-navy sm:px-4 sm:py-3">Action</th>
                  <th scope="col" className="px-3 py-2 font-semibold text-deep-navy sm:px-4 sm:py-3">IP Address</th>
                  <th scope="col" className="px-3 py-2 font-semibold text-deep-navy sm:px-4 sm:py-3">Changes</th>
                  <th scope="col" className="px-3 py-2 font-semibold text-deep-navy sm:px-4 sm:py-3">Notes</th>
                </tr>
              </thead>
          <tbody>
            {logs.map((entry, idx) => (
              <tr
                key={entry.logId}
                className={`border-b border-slate/10 ${
                  idx % 2 === 0 ? "bg-white" : "bg-cool-off-white/50"
                }`}
              >
                <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-slate sm:px-4 sm:py-3">
                  {formatTimestamp(entry.timestamp)}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-slate sm:px-4 sm:py-3">
                  <span className="font-mono text-xs">{entry.userId.slice(0, 8)}...</span>
                </td>
                <td className="whitespace-nowrap px-3 py-2 sm:px-4 sm:py-3">
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                      entry.userRole === "doctor"
                        ? "bg-clinical-teal/10 text-clinical-teal"
                        : entry.userRole === "nurse"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-deep-navy/10 text-deep-navy"
                    }`}
                  >
                    {entry.userRole}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-slate sm:px-4 sm:py-3">
                  {formatAction(entry.action)}
                </td>
                <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-cool-grey sm:px-4 sm:py-3">
                  {entry.ipAddress ?? "—"}
                </td>
                <td className="max-w-[200px] truncate px-3 py-2 text-xs text-cool-grey sm:px-4 sm:py-3">
                  {entry.changesDiff
                    ? JSON.stringify(entry.changesDiff).slice(0, 80)
                    : "—"}
                </td>
                <td className="max-w-[200px] truncate px-3 py-2 text-xs text-cool-grey sm:px-4 sm:py-3">
                  {entry.notes ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
          </div>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="touch-target-min"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-cool-grey">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="touch-target-min"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
