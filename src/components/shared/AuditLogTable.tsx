"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

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
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = roleFilter === "all" ? logs : logs.filter((l) => l.userRole === roleFilter);

  if (logs.length === 0) {
    return (
      <div className="rounded-lg border border-slate/10 bg-white p-8 text-center text-cool-grey">
        No audit log entries found for this record.
      </div>
    );
  }

  return (
    <div className={cn("flex min-h-0 flex-col space-y-4", className)}>
      {logs.length > 0 && (
        <div className="flex flex-shrink-0 justify-end">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            aria-label="Filter by role"
            className="h-10 rounded-lg border border-slate/30 bg-white px-3 text-xs text-slate shadow-sm focus:border-clinical-teal focus:outline-none focus:ring-1 focus:ring-clinical-teal"
          >
            <option value="all">All roles</option>
            <option value="doctor">Doctor</option>
            <option value="nurse">Nurse</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      )}
      <div className="flex flex-col min-h-0 flex-1 overflow-hidden rounded-lg border border-slate/10">
        <div className="flex-1 min-h-0 overflow-auto">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-cool-grey">No matching entries.</div>
          ) : (
            <>
          <div className="space-y-3 p-4 sm:hidden">
        {filtered.map((entry) => (
          <div key={entry.logId} className="rounded-lg border border-slate/10 bg-white p-4">
            <div className="flex items-start justify-between gap-2">
              <span className="font-mono text-xs text-slate">{formatTimestamp(entry.timestamp)}</span>
              <span
                className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${
                  entry.userRole === "doctor"
                    ? "bg-clinical-teal/10 text-clinical-teal"
                    : entry.userRole === "nurse"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-deep-navy/10 text-deep-navy"
                }`}
              >
                {entry.userRole}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2 text-xs text-cool-grey">
              <span className="font-mono">{entry.userId.slice(0, 8)}...</span>
              <span className="font-medium capitalize">{formatAction(entry.action)}</span>
            </div>
            <div className="mt-2 border-t border-slate/10 pt-2 text-xs text-cool-grey">
              <div className="flex justify-between gap-2">
                <span>IP: {entry.ipAddress ?? "—"}</span>
              </div>
              {(entry.changesDiff || entry.notes) && (
                <div className="mt-1 space-y-0.5">
                  {entry.changesDiff && (
                    <p className="truncate">{JSON.stringify(entry.changesDiff).slice(0, 60)}</p>
                  )}
                  {entry.notes && <p className="truncate italic">{entry.notes}</p>}
                </div>
              )}
            </div>
          </div>
        ))}
          </div>
          <div className="hidden sm:block">
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
            {filtered.map((entry, idx) => (
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
          </>
        )}
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
