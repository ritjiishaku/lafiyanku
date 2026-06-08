"use client";

import { Suspense, useState, useEffect, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

interface AppShellProps {
  children: ReactNode;
  hideSidebar?: boolean;
}

export function AppShell({ children, hideSidebar }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setSidebarOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

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
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
