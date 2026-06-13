"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useRole } from "@/hooks/useRole";
import { Plus, Search, FileText, Eye, ChevronLeft, ChevronRight, FileCheck, Clock, Archive } from "lucide-react";

interface DischargeSummary {
  recordId: string;
  patientName: string;
  facilityName: string;
  dischargeDate: string;
  status: string;
  dischargedBy: string;
}

interface DashboardListProps {
  onNavigate: (view: { name: "new" } | { name: "output"; id: string } | { name: "detail"; id: string }) => void;
}

export function DashboardList({ onNavigate }: DashboardListProps) {
  const { role } = useRole();
  const [records, setRecords] = useState<DischargeSummary[]>([]);
  const [metrics, setMetrics] = useState({ total: 0, draft: 0, finalised: 0, archived: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  useEffect(() => {
    async function load() {
      setError(null);
      try {
        const [recordsRes, metricsRes] = await Promise.all([
          fetch(`/api/discharge?${new URLSearchParams({ ...(debouncedSearch && { search: debouncedSearch }), ...(statusFilter !== "all" && { status: statusFilter }), page: String(page) })}`),
          fetch("/api/dashboard/metrics"),
        ]);
        const recordsJson = await recordsRes.json();
        const metricsJson = await metricsRes.json();
        if (recordsJson.success) {
          setRecords(recordsJson.data ?? []);
          setTotalPages(recordsJson.pagination?.totalPages ?? 0);
        } else {
          setError(recordsJson.error?.detail ?? recordsJson.error?.message ?? "Failed to load records.");
        }
        if (metricsJson.success) {
          setMetrics(metricsJson.data);
        }
      } catch (e) {
        console.error("Dashboard fetch error:", e);
        setError("Network error. Please check your connection.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [debouncedSearch, statusFilter, page]);

  const canCreate = role === "doctor" || role === "nurse";

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-3 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-deep-navy sm:text-3xl">Dashboard</h1>
          <p className="text-sm text-cool-grey">Manage discharge records</p>
        </div>
        {canCreate && (
          <Button className="touch-target-min" onClick={() => onNavigate({ name: "new" })}>
            <Plus className="mr-1 h-4 w-4" />
            New Discharge
          </Button>
        )}
      </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="border-slate/10">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="rounded-lg p-2 bg-slate/10 shrink-0">
                <FileText className="h-4 w-4 text-slate" />
              </div>
              <div><p className="text-xs text-cool-grey">Total</p><p className="text-lg font-bold text-slate">{metrics.total}</p></div>
            </CardContent>
          </Card>
          <Card className="border-slate/10">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="rounded-lg p-2 bg-warm-amber/10 shrink-0">
                <Clock className="h-4 w-4 text-warm-amber" />
              </div>
              <div><p className="text-xs text-cool-grey">Draft</p><p className="text-lg font-bold text-warm-amber">{metrics.draft}</p></div>
            </CardContent>
          </Card>
          <Card className="border-slate/10">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="rounded-lg p-2 bg-clinical-teal/10 shrink-0">
                <FileCheck className="h-4 w-4 text-clinical-teal" />
              </div>
              <div><p className="text-xs text-cool-grey">Finalised</p><p className="text-lg font-bold text-clinical-teal">{metrics.finalised}</p></div>
            </CardContent>
          </Card>
          <Card className="border-slate/10">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="rounded-lg p-2 bg-cool-grey/10 shrink-0">
                <Archive className="h-4 w-4 text-cool-grey" />
              </div>
              <div><p className="text-xs text-cool-grey">Archived</p><p className="text-lg font-bold text-cool-grey">{metrics.archived}</p></div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cool-grey" />
          <input
            type="text"
            aria-label="Search by patient name"
            placeholder="Search by patient name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate/30 bg-white px-3.5 pl-10 text-sm text-slate placeholder:text-cool-grey focus:border-clinical-teal focus:outline-none focus:ring-1 focus:ring-clinical-teal h-11"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by status"
          className="touch-target-min rounded-lg border border-slate/30 bg-white px-3.5 text-sm text-slate shadow-sm focus:border-clinical-teal focus:outline-none focus:ring-1 focus:ring-clinical-teal h-11"
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="finalised">Finalised</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-lg border border-slate/10 bg-white p-5">
              <div className="h-4 w-48 rounded bg-slate-200" />
              <div className="mt-2 h-3 w-32 rounded bg-slate-100" />
              <div className="mt-2 flex gap-3"><div className="h-3 w-24 rounded bg-slate-100" /><div className="h-3 w-28 rounded bg-slate-100" /></div>
            </div>
          ))}
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-lg border border-slate/10 bg-white p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-cool-grey/50" />
          <p className="mt-4 text-lg font-medium text-deep-navy">No discharge records found</p>
          <p className="mt-1 text-sm text-cool-grey">
            {search || statusFilter !== "all"
              ? "Try adjusting your search or filter."
              : canCreate
                ? "Create your first discharge record to get started."
                : "No records available."}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {records.map((record, i) => (
              <div
                key={record.recordId}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onNavigate({ name: "output", id: record.recordId });
                  }
                }}
                className="group flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate/10 bg-white p-3 transition-all duration-200 hover:shadow-md hover:border-slate/20 hover:-translate-y-0.5 sm:p-4 cursor-pointer"
                onClick={() => onNavigate({ name: "output", id: record.recordId })}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate text-base font-semibold text-deep-navy group-hover:text-clinical-teal transition-colors">{record.patientName}</p>
                  <p className="truncate text-sm text-cool-grey">{record.facilityName}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-cool-grey">
                    <span>Discharged: {record.dischargeDate}</span>
                    <span>By: {record.dischargedBy}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <StatusBadge status={record.status as "draft" | "finalised" | "archived"} />
                  <Button variant="outline" size="sm" className="touch-target-min group-hover:border-clinical-teal/30 group-hover:text-clinical-teal transition-all" onClick={() => onNavigate({ name: "output", id: record.recordId })}>
                    <Eye className="mr-1 h-4 w-4" />View
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} aria-label="Previous page">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-cool-grey">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} aria-label="Next page">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
