"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useRole } from "@/hooks/useRole";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FilePlus,
  Settings,
  ClipboardList,
  LogOut,
  ChevronUp,
  MessageSquare,
} from "lucide-react";

function AvatarDisplay({ src, name }: { src: string | null; name?: string | null }) {
  const initial = name?.charAt(0)?.toUpperCase() ?? "U";
  return (
    <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-600 flex items-center justify-center ring-2 ring-white/10 shrink-0">
      {src ? (
        <img src={src} alt="Avatar" className="h-full w-full object-cover" />
      ) : (
        <span className="text-sm font-bold text-slate-400">{initial}</span>
      )}
    </div>
  );
}

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  doctor: { label: "Doctor", color: "bg-clinical-teal/20 text-clinical-teal" },
  nurse: { label: "Nurse", color: "bg-blue-500/20 text-blue-400" },
  admin: { label: "Admin", color: "bg-purple-500/20 text-purple-400" },
};

const AVATAR_KEY = "careflow-avatar";

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { role, userName } = useRole();
  const currentPath = pathname.split("?")[0];
  const currentView = searchParams.get("view");
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);

  useEffect(() => {
    setAvatarSrc(localStorage.getItem(AVATAR_KEY));
    function handleChange() {
      setAvatarSrc(localStorage.getItem(AVATAR_KEY));
    }
    window.addEventListener("storage", handleChange);
    window.addEventListener("avatar-updated", handleChange);
    return () => {
      window.removeEventListener("storage", handleChange);
      window.removeEventListener("avatar-updated", handleChange);
    };
  }, []);

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["doctor", "nurse", "admin"] },
    { href: "/dashboard?view=new", label: "New Discharge", icon: FilePlus, roles: ["doctor", "nurse"] },
    { href: "/audit", label: "Audit Log", icon: ClipboardList, roles: ["admin"] },
    { href: "/admin/demo-requests", label: "Demo Requests", icon: MessageSquare, roles: ["admin"] },
  ];

  const visibleLinks = links.filter((l) => l.roles.includes(role ?? ""));

  const roleInfo = role ? ROLE_LABELS[role] : null;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <aside className="flex h-screen w-64 flex-col bg-deep-navy text-pure-white sticky top-0">
      <Link href="/" onClick={onClose} className="flex items-center gap-2 border-b border-white/[0.06] px-6 py-4 shrink-0 hover:bg-white/5 transition-colors">
        <span className="text-xl font-bold tracking-tight text-white">CareFlow</span>
      </Link>

      <nav className="flex flex-col gap-1 p-4 flex-1 overflow-y-auto">
        {visibleLinks.map((link) => {
          const Icon = link.icon;
          const linkPath = link.href.split("?")[0];
          const linkView = Object.fromEntries(new URLSearchParams(link.href.split("?")[1] || "").entries()).view;
          const isActive = linkView
            ? currentPath === linkPath && currentView === linkView
            : currentPath.startsWith(linkPath) && (linkPath !== "/dashboard" || !currentView);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-clinical-teal/15 text-white"
                  : "text-white/50 hover:bg-white/10 hover:text-white"
              }`}
            >
              {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-clinical-teal" />}
              <Icon className={`h-4 w-4 shrink-0 transition-colors duration-150 ${isActive ? "text-clinical-teal" : "text-white/40 group-hover:text-white/70"}`} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/[0.06] shrink-0" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex w-full items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors"
        >
          <AvatarDisplay src={avatarSrc} name={userName} />
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm font-medium text-white/80">{userName ?? "User"}</p>
            {roleInfo && (
              <span className={`inline-block mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${roleInfo.color}`}>
                {roleInfo.label}
              </span>
            )}
          </div>
          <ChevronUp className={`h-4 w-4 text-pure-white/40 transition-transform duration-200 ${menuOpen ? "rotate-0" : "rotate-180"}`} />
        </button>

        {menuOpen && (
          <div className="px-3 pb-3 space-y-1 animate-in fade-in slide-in-from-bottom-1 duration-150">
            <Link
              href="/settings"
              onClick={() => { setMenuOpen(false); onClose?.(); }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-white/50 hover:bg-white/5 hover:text-white/80 transition-colors"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/auth" })}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
