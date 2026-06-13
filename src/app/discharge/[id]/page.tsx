"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { DischargeOutputView } from "@/app/dashboard/DischargeOutputView";
import { ArrowLeft } from "lucide-react";

export default function DischargeOutputPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  return (
    <AppShell hideSidebar>
      <div className="mx-auto max-w-6xl space-y-4 p-4 pb-4 sm:p-6 sm:pb-6">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="inline-flex items-center gap-1.5 text-sm text-cool-grey hover:text-deep-navy transition-colors mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
        <DischargeOutputView id={id} />
      </div>
    </AppShell>
  );
}
