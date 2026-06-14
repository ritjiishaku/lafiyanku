"use client";

import { Suspense, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardList } from "./DashboardList";
import { NewDischargeView } from "./NewDischargeView";
import { DischargeDetailView } from "./DischargeDetailView";
import { DischargeOutputView } from "./DischargeOutputView";

function AnimatedView({ children }: { children: React.ReactNode }) {
  return <div className="animate-in fade-in slide-in-from-right-2 duration-300">{children}</div>;
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") || "list";
  const id = searchParams.get("id") || "";

  useEffect(() => {
    const titles: Record<string, string> = {
      list: "Lafiyanku — Dashboard",
      new: "Lafiyanku — New Discharge",
      output: "Lafiyanku — Discharge Output",
      detail: "Lafiyanku — Record Detail",
    };
    document.title = titles[view] ?? "Lafiyanku";
  }, [view]);

  const navigate = useCallback((v: { name: string; id?: string }) => {
    if (v.name === "output" && v.id) {
      router.push(`/discharge/${v.id}`);
      return;
    }
    const params = new URLSearchParams();
    if (v.name !== "list") params.set("view", v.name);
    if (v.id) params.set("id", v.id);
    router.push(`/dashboard${params.toString() ? `?${params}` : ""}`);
  }, [router]);

  return (
    <AppShell>
      {view === "list" && (
        <AnimatedView key="list">
          <DashboardList onNavigate={navigate} />
        </AnimatedView>
      )}
      {view === "new" && (
        <AnimatedView key="new">
          <NewDischargeView onNavigate={navigate} />
        </AnimatedView>
      )}
      {view === "detail" && id && (
        <AnimatedView key="detail">
          <DischargeDetailView id={id} onNavigate={navigate} />
        </AnimatedView>
      )}
      {view === "output" && id && (
        <AnimatedView key="output">
          <DischargeOutputView id={id} />
        </AnimatedView>
      )}
    </AppShell>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-cool-off-white p-4"><div className="h-8 w-8 animate-spin rounded-full border-4 border-clinical-teal border-t-transparent" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
