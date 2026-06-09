"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRole } from "@/hooks/useRole";
import {
  Shield,
  FileText,
  Users,
  Activity,
  Search,
} from "lucide-react";

interface RecentActivity {
  logId: string;
  userId: string;
  userRole: string;
  action: string;
  timestamp: string;
  ipAddress: string | null;
  notes: string | null;
  userName: string;
}

interface ComplianceData {
  totalLogs: number;
  actionCounts: Record<string, number>;
  uniqueUsers: number;
  recentActivity: RecentActivity[];
}

const ACTION_COLORS: Record<string, string> = {
  generate: "text-blue-500 bg-blue-500/10",
  edit: "text-warm-amber bg-warm-amber/10",
  view: "text-cool-grey bg-cool-grey/10",
  finalise: "text-clinical-teal bg-clinical-teal/10",
  archive: "text-red-500 bg-red-500/10",
  print: "text-purple-500 bg-purple-500/10",
  export: "text-green-500 bg-green-500/10",
};

export default function CompliancePage() {
  const { role } = useRole();
  const [data, setData] = useState<ComplianceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/compliance");
        const json = await res.json();
        if (json.success) setData(json.data);
        else setError("Failed to load compliance data");
      } catch {
        setError("Failed to load compliance data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (role !== "admin") {
    return (
      <AppShell noMainScroll>
        <div className="flex min-h-[60vh] items-center justify-center text-cool-grey">
          Access restricted to Admin users.
        </div>
      </AppShell>
    );
  }

  if (loading) {
    return (
      <AppShell noMainScroll>
        <div className="flex min-h-[60vh] items-center justify-center"><LoadingSpinner /></div>
      </AppShell>
    );
  }

  if (error || !data) {
    return (
      <AppShell noMainScroll>
        <div className="mx-auto max-w-4xl p-4"><div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error ?? "No data"}</div></div>
      </AppShell>
    );
  }

  const totalActions = Object.values(data.actionCounts).reduce((s, c) => s + c, 0);

  const filteredActivity = data.recentActivity.filter((r) => {
    const query = search.toLowerCase();
    const matchesSearch = !query || r.userName.toLowerCase().includes(query);
    const matchesAction = actionFilter === "all" || r.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <AppShell noMainScroll>
      <div className="mx-auto flex h-full min-h-0 max-w-6xl flex-col p-4 sm:p-6">
        <div className="mb-4 flex-shrink-0 space-y-1">
          <h1 className="text-2xl font-bold text-deep-navy sm:text-3xl">NDPR Compliance</h1>
          <p className="text-sm text-cool-grey">
            Monitor audit logs, data access, and regulatory compliance.
          </p>
        </div>

        <div className="mb-4 flex-shrink-0 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card className="border-slate/10">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-clinical-teal/10 p-2.5 shrink-0">
                <Activity className="h-5 w-5 text-clinical-teal" />
              </div>
              <div>
                <p className="text-xs text-cool-grey">Total Log Entries</p>
                <p className="text-xl font-bold text-slate">{data.totalLogs}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate/10">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-purple-500/10 p-2.5 shrink-0">
                <Users className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-cool-grey">Active Users</p>
                <p className="text-xl font-bold text-slate">{data.uniqueUsers}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate/10">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2.5 shrink-0">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-cool-grey">Total Actions</p>
                <p className="text-xl font-bold text-slate">{totalActions}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate/10">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-clinical-teal/10 p-2.5 shrink-0">
                <Shield className="h-5 w-5 text-clinical-teal" />
              </div>
              <div>
                <p className="text-xs text-cool-grey">Compliance Status</p>
                <p className="text-lg font-bold text-clinical-teal">Active</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-4 flex flex-shrink-0 flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cool-grey" />
            <input
              type="text"
              aria-label="Search by user name"
              placeholder="Search by user name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate/30 bg-white px-3.5 pl-10 text-sm text-slate placeholder:text-cool-grey focus:border-clinical-teal focus:outline-none focus:ring-1 focus:ring-clinical-teal h-11"
            />
          </div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            aria-label="Filter by action"
            className="h-11 rounded-lg border border-slate/30 bg-white px-3.5 text-sm text-slate shadow-sm focus:border-clinical-teal focus:outline-none focus:ring-1 focus:ring-clinical-teal"
          >
            <option value="all">All actions</option>
            <option value="generate">Generate</option>
            <option value="edit">Edit</option>
            <option value="view">View</option>
            <option value="finalise">Finalise</option>
            <option value="archive">Archive</option>
            <option value="print">Print</option>
            <option value="export">Export</option>
          </select>
        </div>

        <Card className="flex min-h-0 flex-1 flex-col border-slate/10">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="flex items-center gap-2 text-sm text-deep-navy">
              <Activity className="h-4 w-4 text-clinical-teal" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 overflow-hidden p-0">
            <div className="flex-1 min-h-0 overflow-auto">
              <div className="space-y-3 p-4 sm:hidden">
                {filteredActivity.length === 0 ? (
                  <div className="rounded-lg border border-slate/10 bg-white p-8 text-center text-sm text-cool-grey">
                    No recent activity.
                  </div>
                ) : (
                  filteredActivity.map((r) => {
                    const colors = ACTION_COLORS[r.action] ?? "text-slate bg-slate/10";
                    return (
                      <div key={r.logId} className="rounded-lg border border-slate/10 bg-white p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate">{r.userName}</p>
                            <p className="text-xs text-cool-grey font-mono">{r.userRole}</p>
                          </div>
                          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${colors}`}>
                            {r.action}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-slate/10 pt-3 text-xs text-cool-grey font-mono">
                          <span>{r.ipAddress ?? "—"}</span>
                          <span>{new Date(r.timestamp).toLocaleString("en-NG", { timeZone: "Africa/Lagos" })}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="hidden sm:block w-full">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 z-10 bg-cool-off-white">
                      <tr className="border-b border-slate/10">
                        <th scope="col" className="px-3 py-2 font-semibold text-deep-navy sm:px-4 sm:py-3">User</th>
                        <th scope="col" className="px-3 py-2 font-semibold text-deep-navy sm:px-4 sm:py-3">Action</th>
                        <th scope="col" className="px-3 py-2 font-semibold text-deep-navy sm:px-4 sm:py-3">IP Address</th>
                        <th scope="col" className="px-3 py-2 font-semibold text-deep-navy sm:px-4 sm:py-3">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredActivity.length === 0 ? (
                        <tr><td colSpan={4} className="px-3 py-8 text-center text-cool-grey sm:px-4">No recent activity.</td></tr>
                      ) : (
                        filteredActivity.map((r, i) => {
                          const colors = ACTION_COLORS[r.action] ?? "text-slate bg-slate/10";
                          return (
                            <tr key={r.logId} className={`border-b border-slate/10 ${i % 2 === 0 ? "bg-white" : "bg-cool-off-white/50"}`}>
                            <td className="px-3 py-2 sm:px-4 sm:py-3">
                              <p className="font-medium text-slate">{r.userName}</p>
                              <p className="text-xs text-cool-grey font-mono">{r.userRole}</p>
                            </td>
                            <td className="px-3 py-2 sm:px-4 sm:py-3">
                              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${colors}`}>
                                {r.action}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-xs text-cool-grey font-mono sm:px-4 sm:py-3">{r.ipAddress ?? "—"}</td>
                            <td className="px-3 py-2 text-xs text-cool-grey font-mono sm:px-4 sm:py-3">
                              {new Date(r.timestamp).toLocaleString("en-NG", { timeZone: "Africa/Lagos" })}
                            </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
