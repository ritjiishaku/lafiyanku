"use client";

import { Suspense, useState, useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { useRole } from "@/hooks/useRole";

interface AppShellProps {
  children: ReactNode;
  hideSidebar?: boolean;
  noMainScroll?: boolean;
}

const BYPASS_ROUTES = ["/change-password", "/onboarding"];

export function AppShell({ children, hideSidebar, noMainScroll }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { mustChangePassword, isLoading } = useRole();

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setSidebarOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    if (isLoading || !mustChangePassword) return;
    const isBypassRoute = BYPASS_ROUTES.some((r) => pathname.startsWith(r));
    if (!isBypassRoute) {
      router.replace("/change-password");
    }
  }, [mustChangePassword, isLoading, pathname, router]);

  const isBypassRoute = BYPASS_ROUTES.some((r) => pathname.startsWith(r));
  if (mustChangePassword && !isBypassRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cool-off-white p-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-clinical-teal border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-cool-off-white">
      {!hideSidebar && (
        <>
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar — drawer on mobile, fixed on desktop */}
          <div
            className={`
              fixed inset-y-0 left-0 z-50 md:static md:z-auto
              transition-transform duration-200 ease-in-out
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            `}
          >
            <Suspense fallback={null}>
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </Suspense>
          </div>
        </>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav onToggleSidebar={hideSidebar ? undefined : () => setSidebarOpen(!sidebarOpen)} />
        <main className={`flex-1 ${noMainScroll ? "overflow-hidden" : "overflow-y-auto"}`}>{children}</main>
      </div>
    </div>
  );
}
