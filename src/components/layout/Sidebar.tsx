import Link from "next/link";

export function Sidebar() {
  return (
    <aside className="flex w-64 flex-col bg-deep-navy text-pure-white">
      <div className="flex items-center gap-2 border-b border-white/10 px-6 py-4">
        <span className="text-xl font-bold">CareFlow</span>
      </div>
      <nav className="flex flex-col gap-1 p-4">
        <Link
          href="/dashboard"
          className="rounded-md px-3 py-2 text-sm transition-colors hover:bg-white/10"
        >
          Dashboard
        </Link>
        <Link
          href="/discharge/new"
          className="rounded-md px-3 py-2 text-sm transition-colors hover:bg-white/10"
        >
          New Discharge
        </Link>
        <Link
          href="/settings"
          className="rounded-md px-3 py-2 text-sm transition-colors hover:bg-white/10"
        >
          Settings
        </Link>
      </nav>
    </aside>
  );
}
