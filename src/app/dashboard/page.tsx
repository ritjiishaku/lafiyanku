"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardList } from "./DashboardList";
import { NewDischargeView } from "./NewDischargeView";
import { DischargeDetailView } from "./DischargeDetailView";
import { DischargeOutputView } from "./DischargeOutputView";

function AnimatedView({ children }: { children: React.ReactNode }) {
  return <div className="animate-in fade-in slide-in-from-right-2 duration-300">{children}</div>;
}

function TransitionBar() {
  const [show, setShow] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    setShow(true);
    const timer = setTimeout(() => setShow(false), 400);
    return () => clearTimeout(timer);
  }, [searchParams]);

  if (!show) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-0.5">
      <div className="h-full bg-clinical-teal animate-[slide_0.4s_ease-out_forwards]" style={{ width: "100%" }} />
    </div>
  );
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
      <TransitionBar />
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
