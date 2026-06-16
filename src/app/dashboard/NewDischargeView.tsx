"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { PatientInputFormData } from "@/components/forms/PatientInputForm";
import { Alert, AlertDescription } from "@/components/ui/alert";


const PatientInputForm = dynamic(
  () => import("@/components/forms/PatientInputForm").then((m) => m.PatientInputForm),
  { loading: () => <div className="h-96 animate-pulse rounded-xl bg-slate-100" /> },
);

function toProceduresArray(value: string | undefined | null): string[] {
  if (!value) return [];
  return value.split(/\n|,/).map((s) => s.trim()).filter(Boolean);
}

interface NewDischargeViewProps {
  onNavigate: (view: { name: string; id?: string }) => void;
}

export function NewDischargeView({ onNavigate }: NewDischargeViewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(data: PatientInputFormData) {
    setError(null);
    setIsGenerating(true);
    try {
      const patientInput = {
        ...data,
        proceduresPerformed: toProceduresArray(data.proceduresPerformed),
        age: Number(data.age),
      };
      const res = await fetch("/api/discharge/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientInput }),
      });
      const json = await res.json();
      if (!res.ok) {
        const msg = json.error?.details
          ? `${json.error.message} (${json.error.details})`
          : json.error?.message ?? "Generation failed. Please try again.";
        setError(msg);
        setIsGenerating(false);
        return;
      }
      onNavigate({ name: "output", id: json.data.recordId });

      fetch("/api/discharge/draft", { method: "DELETE" }).catch(() => {});
      try { localStorage.removeItem("lafiyanku-discharge-draft"); } catch {}
    } catch {
      setError("Network error. Please check your connection and try again.");
      setIsGenerating(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 pb-20 sm:p-6 sm:pb-6">
      <div>
        <h1 className="text-xl font-bold text-deep-navy sm:text-2xl">New Discharge Record</h1>
        <p className="mt-0.5 text-sm text-cool-grey">Fill in the patient information below to generate a discharge summary.</p>
      </div>

      {error && (
        <Alert variant="destructive" role="alert" aria-live="assertive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <PatientInputForm onSubmit={handleSubmit} isGenerating={isGenerating} />
    </div>
  );
}
