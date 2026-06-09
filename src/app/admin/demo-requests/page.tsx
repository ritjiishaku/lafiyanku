"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useRole } from "@/hooks/useRole";
import { MessageSquare } from "lucide-react";

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

  useEffect(() => {
    fetch("/api/admin/demo-requests")
      .then((r) => r.json())
      .then((d) => { if (d.success) setRequests(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
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

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-deep-navy sm:text-3xl">Demo Requests</h1>
          <p className="text-sm text-cool-grey">Leads captured from the marketing site</p>
        </div>

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-lg border border-slate/10 bg-white p-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-cool-grey/50" />
            <p className="mt-4 text-lg font-medium text-deep-navy">No demo requests yet</p>
          </div>
        ) : (
          <div className="overflow-auto rounded-lg border border-slate/10">
            <div className="inline-block min-w-full align-middle">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 z-10 bg-cool-off-white">
                  <tr className="border-b border-slate/10">
                    <th scope="col" className="px-3 py-2 font-semibold text-deep-navy sm:px-4 sm:py-3">Name</th>
                    <th scope="col" className="px-3 py-2 font-semibold text-deep-navy sm:px-4 sm:py-3">Role</th>
                    <th scope="col" className="px-3 py-2 font-semibold text-deep-navy sm:px-4 sm:py-3">Facility</th>
                    <th scope="col" className="px-3 py-2 font-semibold text-deep-navy sm:px-4 sm:py-3">WhatsApp</th>
                    <th scope="col" className="hidden px-3 py-2 font-semibold text-deep-navy sm:table-cell sm:px-4 sm:py-3">Email</th>
                    <th scope="col" className="px-3 py-2 font-semibold text-deep-navy sm:px-4 sm:py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r, i) => (
                    <tr key={r.id} className={`border-b border-slate/10 ${i % 2 === 0 ? "bg-white" : "bg-cool-off-white/50"}`}>
                      <td className="px-3 py-2 font-medium text-slate sm:px-4 sm:py-3">{r.full_name}</td>
                      <td className="px-3 py-2 text-cool-grey sm:px-4 sm:py-3">{r.role}</td>
                      <td className="px-3 py-2 text-cool-grey sm:px-4 sm:py-3">{r.facility_name}</td>
                      <td className="px-3 py-2 text-cool-grey sm:px-4 sm:py-3">{r.whatsapp_number}</td>
                      <td className="hidden px-3 py-2 text-cool-grey sm:table-cell sm:px-4 sm:py-3">{r.email}</td>
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
