"use client";

import { useState } from "react";
import { PatientInputForm, type PatientInputFormData } from "@/components/forms/PatientInputForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft } from "lucide-react";

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
        setError(json.error?.message ?? "Generation failed. Please try again.");
        setIsGenerating(false);
        return;
      }
      onNavigate({ name: "output", id: json.data.recordId });
    } catch {
      setError("Network error. Please check your connection and try again.");
      setIsGenerating(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 pb-20 sm:p-6 sm:pb-6">
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => onNavigate({ name: "list" })} className="touch-target-min flex items-center justify-center h-9 w-9 rounded-lg border border-slate/20 bg-white text-cool-grey hover:text-deep-navy hover:border-slate/30 transition-all shadow-sm">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-deep-navy sm:text-2xl">New Discharge Record</h1>
          <p className="mt-0.5 text-sm text-cool-grey">Fill in the patient information below to generate a discharge summary.</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <PatientInputForm onSubmit={handleSubmit} isGenerating={isGenerating} />
    </div>
  );
}
