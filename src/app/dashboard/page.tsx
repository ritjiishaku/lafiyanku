"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useRole } from "@/hooks/useRole";
import { Plus, Search, FileText, Eye, ArrowRight } from "lucide-react";

interface DischargeSummary {
  recordId: string;
  patientName: string;
  facilityName: string;
  dischargeDate: string;
  status: string;
  generatedAt: string;
  dischargedBy: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { role } = useRole();
  const [records, setRecords] = useState<DischargeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/discharge?${params}`);
      const json = await res.json();
      if (json.success) setRecords(json.data ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const canCreate = role === "doctor" || role === "nurse";

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-deep-navy sm:text-3xl">
              Dashboard
            </h1>
            <p className="text-sm text-cool-grey">
              Manage discharge records
            </p>
          </div>
          {canCreate && (
            <Button
              className="touch-target-min bg-clinical-teal hover:bg-clinical-teal/90"
              onClick={() => router.push("/discharge/new")}
            >
              <Plus className="mr-1 h-4 w-4" />
              New Discharge
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cool-grey" />
            <input
              type="text"
              placeholder="Search by patient name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate/30 bg-white py-2.5 pl-10 pr-4 text-sm text-slate placeholder:text-cool-grey focus:border-clinical-teal focus:outline-none focus:ring-1 focus:ring-clinical-teal"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="touch-target-min rounded-lg border border-slate/30 bg-white px-3 py-2.5 text-sm text-slate shadow-sm focus:border-clinical-teal focus:outline-none focus:ring-1 focus:ring-clinical-teal"
          >
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="finalised">Finalised</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : records.length === 0 ? (
          <div className="rounded-lg border border-slate/10 bg-white p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-cool-grey/50" />
            <p className="mt-4 text-lg font-medium text-deep-navy">
              No discharge records found
            </p>
            <p className="mt-1 text-sm text-cool-grey">
              {search || statusFilter !== "all"
                ? "Try adjusting your search or filter."
                : canCreate
                  ? "Create your first discharge record to get started."
                  : "No records available."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <div
                key={record.recordId}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate/10 bg-white p-4 transition-shadow hover:shadow-sm sm:p-5"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate text-base font-semibold text-deep-navy">
                    {record.patientName}
                  </p>
                  <p className="truncate text-sm text-cool-grey">
                    {record.facilityName}
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs text-cool-grey">
                    <span>Discharged: {record.dischargeDate}</span>
                    <span>By: {record.dischargedBy}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={record.status as "draft" | "finalised" | "archived"} />
                  <Button
                    variant="outline"
                    size="sm"
                    className="touch-target-min"
                    onClick={() => router.push(`/discharge/${record.recordId}/output`)}
                  >
                    <Eye className="mr-1 h-4 w-4" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="touch-target-min"
                    onClick={() => router.push(`/discharge/${record.recordId}`)}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
