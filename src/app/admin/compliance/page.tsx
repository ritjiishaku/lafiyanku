"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRole } from "@/hooks/useRole";
import {
  Shield,
  FileText,
  Eye,
  Edit3,
  CheckCircle,
  Archive,
  Printer,
  Download,
  Users,
  Activity,
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

const ACTION_ICONS: Record<string, typeof FileText> = {
  generate: FileText,
  edit: Edit3,
  view: Eye,
  finalise: CheckCircle,
  archive: Archive,
  print: Printer,
  export: Download,
};

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
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center text-cool-grey">
          Access restricted to Admin users.
        </div>
      </AppShell>
    );
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center"><LoadingSpinner /></div>
      </AppShell>
    );
  }

  if (error || !data) {
    return (
      <AppShell>
        <div className="mx-auto max-w-4xl p-4"><div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error ?? "No data"}</div></div>
      </AppShell>
    );
  }

  const totalActions = Object.values(data.actionCounts).reduce((s, c) => s + c, 0);

  return (
    <AppShell>
      <div className="mx-auto flex h-full min-h-0 max-w-6xl flex-col p-4 sm:p-6">
        <div className="mb-6 flex-shrink-0 space-y-1">
          <h1 className="text-2xl font-bold text-deep-navy sm:text-3xl">NDPR Compliance</h1>
          <p className="text-sm text-cool-grey">
            Monitor audit logs, data access, and regulatory compliance.
          </p>
        </div>

        <div className="mb-6 flex-shrink-0 grid grid-cols-2 gap-3 sm:grid-cols-4">
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

        <div className="mb-6 flex-shrink-0 grid gap-4 md:grid-cols-2">
          <Card className="border-slate/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm text-deep-navy">
                <Activity className="h-4 w-4 text-clinical-teal" />
                Actions Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(data.actionCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([action, count]) => {
                    const Icon = ACTION_ICONS[action] ?? Activity;
                    const colors = ACTION_COLORS[action] ?? "text-slate bg-slate/10";
                    return (
                      <div key={action} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`rounded-md p-1.5 ${colors}`}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-sm text-slate capitalize">{action}</span>
                        </div>
                        <span className="text-sm font-semibold text-slate">{count}</span>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm text-deep-navy">
                <Shield className="h-4 w-4 text-clinical-teal" />
                NDPR 2019 Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-clinical-teal shrink-0" />
                <span>Audit trail — 100% of actions logged</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-clinical-teal shrink-0" />
                <span>Audit log immutability — UPDATE/DELETE blocked</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-clinical-teal shrink-0" />
                <span>Role-based access control — server-side enforced</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-clinical-teal shrink-0" />
                <span>Data residency — Nigerian-hosted infrastructure</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-clinical-teal shrink-0" />
                <span>Consent management — patient data processed lawfully</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="flex min-h-0 flex-1 flex-col border-slate/10">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="flex items-center gap-2 text-sm text-deep-navy">
              <Activity className="h-4 w-4 text-clinical-teal" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col min-h-0 flex-1 overflow-hidden p-0">
            <div className="flex-1 min-h-0 overflow-auto">
              <div className="space-y-3 p-4 sm:hidden">
                {data.recentActivity.length === 0 ? (
                  <div className="rounded-lg border border-slate/10 bg-white p-8 text-center text-sm text-cool-grey">
                    No recent activity.
                  </div>
                ) : (
                  data.recentActivity.map((r) => {
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
              <div className="hidden sm:block">
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
                      {data.recentActivity.length === 0 ? (
                        <tr><td colSpan={4} className="px-3 py-8 text-center text-cool-grey sm:px-4">No recent activity.</td></tr>
                      ) : (
                        data.recentActivity.map((r, i) => {
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
