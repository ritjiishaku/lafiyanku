"use client";

import { PatientInputForm, type PatientInputFormData } from "@/components/forms/PatientInputForm";
import { AppShell } from "@/components/layout/AppShell";

export default function NewDischargePage() {
  function handleSubmit(data: PatientInputFormData) {
    // Phase 5 will wire this to the AI generation API
    console.log("Form submitted:", data);
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6 p-4 pb-20 sm:p-6 sm:pb-6">
        <div>
          <h1 className="text-2xl font-bold text-deep-navy sm:text-3xl">New Discharge Record</h1>
          <p className="mt-1 text-sm text-cool-grey">
            Fill in the patient information below to generate a discharge summary.
          </p>
        </div>
        <PatientInputForm onSubmit={handleSubmit} />
      </div>
    </AppShell>
  );
}
