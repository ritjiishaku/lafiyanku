"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/hooks/useRole";
import {
  LayoutDashboard,
  FilePlus,
  Settings,
  ClipboardList,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useRole();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["doctor", "nurse", "admin"] },
    { href: "/discharge/new", label: "New Discharge", icon: FilePlus, roles: ["doctor", "nurse"] },
    { href: "/audit", label: "Audit Log", icon: ClipboardList, roles: ["admin"] },
    { href: "/settings", label: "Settings", icon: Settings, roles: ["doctor", "nurse", "admin"] },
  ];

  const visibleLinks = links.filter((l) => l.roles.includes(role ?? ""));

  return (
    <aside className="flex w-64 flex-col bg-deep-navy text-pure-white">
      <div className="flex items-center gap-2 border-b border-white/10 px-6 py-4">
        <span className="text-xl font-bold">CareFlow</span>
      </div>
      <nav className="flex flex-col gap-1 p-4">
        {visibleLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-clinical-teal/20 text-clinical-teal"
                  : "text-pure-white/70 hover:bg-white/10 hover:text-pure-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
