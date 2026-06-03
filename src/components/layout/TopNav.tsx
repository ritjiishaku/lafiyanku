"use client";

import { Menu } from "lucide-react";
import { useRole } from "@/hooks/useRole";

interface TopNavProps {
  onToggleSidebar?: () => void;
}

export function TopNav({ onToggleSidebar }: TopNavProps) {
  const { userName, role, isLoading } = useRole();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-pure-white px-4 sm:px-6">
      <button
        onClick={onToggleSidebar}
        className="touch-target-min inline-flex items-center justify-center rounded-lg p-2 text-slate hover:text-clinical-teal transition-colors md:hidden"
        aria-label="Toggle navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2 ml-auto">
        {isLoading ? (
          <span className="text-sm text-cool-grey">Loading...</span>
        ) : (
          <>
            <span className="truncate text-sm font-medium text-slate max-w-[120px] sm:max-w-none">{userName ?? "User"}</span>
            {role && (
              <span className="rounded-full bg-clinical-teal/10 px-2.5 py-0.5 text-xs font-medium text-clinical-teal shrink-0">
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </span>
            )}
          </>
        )}
      </div>
    </header>
  );
}
