"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { useRole } from "@/hooks/useRole";
import { ClipboardList, Search, ArrowRight } from "lucide-react";

interface RecordSummary {
  recordId: string;
  patientName: string;
  facilityName: string;
  dischargeDate: string;
  status: string;
}

export default function AuditListPage() {
  const router = useRouter();
  const { role } = useRole();
  const [records, setRecords] = useState<RecordSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchRecords() {
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        const res = await fetch(`/api/discharge?${params}`);
        const json = await res.json();
        if (json.success) setRecords(json.data ?? []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchRecords();
  }, [search]);

  if (role !== "admin") {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-cool-grey">Access restricted to Admin users.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-deep-navy sm:text-3xl">Audit Log</h1>
          <p className="text-sm text-cool-grey">View audit trail for discharge records</p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cool-grey" />
          <input
            type="text"
            aria-label="Search records"
            placeholder="Search by patient name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate/30 bg-white py-2.5 pl-10 pr-4 text-sm text-slate placeholder:text-cool-grey focus:border-clinical-teal focus:outline-none focus:ring-1 focus:ring-clinical-teal"
          />
        </div>

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : records.length === 0 ? (
          <div className="rounded-lg border border-slate/10 bg-white p-12 text-center">
            <ClipboardList className="mx-auto h-12 w-12 text-cool-grey/50" />
            <p className="mt-4 text-lg font-medium text-deep-navy">No records found</p>
            <p className="mt-1 text-sm text-cool-grey">Try adjusting your search.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {records.map((r) => (
              <div
                key={r.recordId}
                className="flex items-center justify-between gap-4 rounded-lg border border-slate/10 bg-white p-4 transition-shadow hover:shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-deep-navy">{r.patientName}</p>
                  <p className="truncate text-sm text-cool-grey">{r.facilityName} — {r.dischargeDate}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/audit/${r.recordId}`)}
                >
                  View Log <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
