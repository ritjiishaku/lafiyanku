import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col bg-cool-off-white p-8 space-y-6" role="status" aria-label="Loading page">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48 rounded-lg bg-slate-200" />
        <Skeleton className="h-10 w-32 rounded-lg bg-slate-200" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-4">
          <Skeleton className="h-[250px] w-full rounded-xl bg-slate-200" />
        </div>
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-[350px] w-full rounded-xl bg-slate-200" />
            <Skeleton className="h-[350px] w-full rounded-xl bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
