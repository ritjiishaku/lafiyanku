"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useRole } from "@/hooks/useRole";
import { MessageSquare, Search } from "lucide-react";

interface DemoRequest {
  id: string;
  full_name: string;
  role: string;
  facility_name: string;
  whatsapp_number: string;
  email: string;
  created_at: string;
}

export default function DemoRequestsPage() {
  const { role } = useRole();
  const [requests, setRequests] = useState<DemoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/demo-requests")
      .then((r) => r.json())
      .then((d) => { if (d.success) setRequests(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = requests.filter((r) => {
    const q = search.toLowerCase();
    return !q || r.full_name.toLowerCase().includes(q) || r.facility_name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q);
  });

  if (role !== "admin") {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center text-cool-grey">
          Access restricted to Admin users.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto flex h-full min-h-0 max-w-5xl flex-col p-4 sm:p-6">
        <div className="mb-6 flex-shrink-0 space-y-1">
          <h1 className="text-2xl font-bold text-deep-navy sm:text-3xl">Demo Requests</h1>
          <p className="text-sm text-cool-grey">Leads captured from the marketing site</p>
        </div>

        {!loading && requests.length > 0 && (
          <div className="mb-4 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cool-grey" />
              <input
                type="text"
                aria-label="Search demo requests"
                placeholder="Search by name, facility, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate/30 bg-white px-3.5 pl-10 text-sm text-slate placeholder:text-cool-grey focus:border-clinical-teal focus:outline-none focus:ring-1 focus:ring-clinical-teal h-11"
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-lg border border-slate/10 bg-white p-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-cool-grey/50" />
            <p className="mt-4 text-lg font-medium text-deep-navy">No demo requests yet</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-slate/10 bg-white p-12 text-center">
            <p className="text-lg font-medium text-deep-navy">No matching requests</p>
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-auto rounded-lg border border-slate/10">
            <div className="space-y-3 p-4 sm:hidden">
            {filtered.map((r) => (
                <div key={r.id} className="rounded-lg border border-slate/10 bg-white p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate">{r.full_name}</p>
                      <p className="text-xs text-cool-grey">{r.role}</p>
                    </div>
                    <span className="shrink-0 text-xs text-cool-grey font-mono">
                      {new Date(r.created_at).toLocaleDateString("en-NG")}
                    </span>
                  </div>
                  <div className="mt-2 border-t border-slate/10 pt-2 text-xs text-cool-grey space-y-1">
                    <p><span className="text-xs text-cool-grey/70">Facility:</span> {r.facility_name}</p>
                    <p><span className="text-xs text-cool-grey/70">WhatsApp:</span> {r.whatsapp_number}</p>
                    <p><span className="text-xs text-cool-grey/70">Email:</span> {r.email}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden sm:block">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 z-10 bg-cool-off-white">
                    <tr className="border-b border-slate/10">
                      <th scope="col" className="px-3 py-2 font-semibold text-deep-navy sm:px-4 sm:py-3">Name</th>
                      <th scope="col" className="px-3 py-2 font-semibold text-deep-navy sm:px-4 sm:py-3">Role</th>
                      <th scope="col" className="px-3 py-2 font-semibold text-deep-navy sm:px-4 sm:py-3">Facility</th>
                      <th scope="col" className="px-3 py-2 font-semibold text-deep-navy sm:px-4 sm:py-3">WhatsApp</th>
                      <th scope="col" className="px-3 py-2 font-semibold text-deep-navy sm:px-4 sm:py-3">Email</th>
                      <th scope="col" className="px-3 py-2 font-semibold text-deep-navy sm:px-4 sm:py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r, i) => (
                      <tr key={r.id} className={`border-b border-slate/10 ${i % 2 === 0 ? "bg-white" : "bg-cool-off-white/50"}`}>
                        <td className="px-3 py-2 font-medium text-slate sm:px-4 sm:py-3">{r.full_name}</td>
                        <td className="px-3 py-2 text-cool-grey sm:px-4 sm:py-3">{r.role}</td>
                        <td className="px-3 py-2 text-cool-grey sm:px-4 sm:py-3">{r.facility_name}</td>
                        <td className="px-3 py-2 text-cool-grey sm:px-4 sm:py-3">{r.whatsapp_number}</td>
                        <td className="px-3 py-2 text-cool-grey sm:px-4 sm:py-3">{r.email}</td>
                        <td className="whitespace-nowrap px-3 py-2 text-xs text-cool-grey font-mono sm:px-4 sm:py-3">
                          {new Date(r.created_at).toLocaleDateString("en-NG")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
