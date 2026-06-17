"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Info,
  Sparkles,
  RotateCcw,
  FileText,
  Languages,
  User,
  Stethoscope,
  AlertTriangle,
  Check,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { DischargeOutput } from "./DischargeOutput";

const SAMPLE_DATA = {
  facilityName: "Lagos University Teaching Hospital",
  facilityCode: "LUTH-001",
  wardName: "Male Medical Ward",
  admissionDate: "2026-05-10",
  dischargeDate: "2026-05-15",
  patientName: "John Doe",
  age: 45,
  gender: "Male",
  hospitalNumber: "H-998877",
  nhisNumber: "NHIS-112233",
  diagnosis: "Severe Malaria with diabetic ketoacidosis (resolved)",
  treatmentGiven: "IV Artemether/Lumefantrine, IV fluids, insulin infusion protocol",
  proceduresPerformed: ["Intravenous cannulation", "Continuous blood glucose monitoring"],
  medications: [
    {
      name: "Metformin",
      dosage: "500mg",
      frequency: "twice daily",
      timing: "with meals",
      duration: "ongoing",
      notes: "Continue daily",
    },
    {
      name: "Amlodipine",
      dosage: "5mg",
      frequency: "once daily",
      timing: "morning",
      duration: "ongoing",
      notes: "Monitor BP",
    },
  ],
  followUpInstructions: "Check blood glucose TID. Follow up at Medical Outpatient Clinic in 2 weeks.",
  additionalNotes: "Patient educated on insulin adherence and dietary modifications.",
  languageRequested: "en",
  dischargedBy: "Dr. Chidi Obi",
  clinicianLicenseNo: "MDCN-12345",
};

const SAMPLE_OUTPUT = {
  clinicalSummary: `──────────────────────────────────────────
CLINICAL DISCHARGE SUMMARY
──────────────────────────────────────────

Facility
Name:       Lagos University Teaching Hospital
FMOH Code:  LUTH-001
Ward:       Male Medical Ward

Patient information
Name:              John Doe
Age:               45 years
Gender:            Male
Hospital No.:      H-998877
NHIS No.:          NHIS-112233
Date of admission: 2026-05-10
Date of discharge: 2026-05-15

Diagnosis
Severe Malaria with diabetic ketoacidosis (resolved)

Treatment provided
IV Artemether/Lumefantrine, IV fluids, insulin infusion protocol

Procedures performed
- Intravenous cannulation
- Continuous blood glucose monitoring

Medications
| Medication  | Dosage | Frequency    | Timing     | Duration | Notes          |
|-------------|--------|--------------|------------|----------|----------------|
| Metformin   | 500mg  | twice daily  | with meals | ongoing  | Continue daily |
| Amlodipine  | 5mg    | once daily   | morning    | ongoing  | Monitor BP     |

Follow-up instructions
Check blood glucose TID. Follow up at Medical Outpatient Clinic in 2 weeks.

Red flag warnings
- Return immediately if blood glucose drops below 4 mmol/L or exceeds 14 mmol/L
- Seek urgent care if patient develops persistent vomiting, confusion, or inability to tolerate fluids
- Watch for signs of severe malaria recurrence: high fever, chills, rigors

Discharged by
Name:              Dr. Chidi Obi
MDCN Licence No.:  MDCN-12345
──────────────────────────────────────────`,

  patientFriendlyOutput: `──────────────────────────────────────────
PATIENT DISCHARGE INSTRUCTIONS
──────────────────────────────────────────

What happened
You were admitted to the hospital because you had severe malaria and a problem with your blood sugar called diabetic ketoacidosis. Both conditions have been treated and are now under control.

Treatment you received
You were given medicine through a drip (IV) to treat the malaria. You also received fluids and insulin to bring your blood sugar back to normal.

Your medications
- Metformin 500mg: Take one tablet twice a day with your meals.
- Amlodipine 5mg: Take one tablet once every morning.

Important home care instructions
- Check your blood sugar three times a day using your glucometer.
- Continue your diabetes medicines every day, even when you feel well.
- Eat balanced meals and avoid sugary drinks and foods.
- Drink plenty of water throughout the day.

When to return to the hospital
Go to the hospital immediately if:
- Your blood sugar drops below 4 mmol/L or goes above 14 mmol/L
- You have persistent vomiting or cannot keep fluids down
- You feel confused or very drowsy
- You develop high fever with chills and shaking

Your follow-up appointment
Visit the Medical Outpatient Clinic in 2 weeks. Bring your blood sugar logbook.
──────────────────────────────────────────`,
};

type FormData = {
  patientName: string;
  age: string;
  gender: string;
  diagnosis: string;
  treatmentGiven: string;
  medications: { name: string; dosage: string; frequency: string }[];
  languageRequested: string;
  dischargedBy: string;
};

function buildPayload(data: FormData) {
  return {
    ...SAMPLE_DATA,
    patientName: data.patientName,
    age: parseInt(data.age, 10) || SAMPLE_DATA.age,
    gender: data.gender,
    diagnosis: data.diagnosis,
    treatmentGiven: data.treatmentGiven,
    medications: data.medications.map((m, i) => ({
      ...SAMPLE_DATA.medications[i],
      ...m,
    })),
    languageRequested: data.languageRequested,
    dischargedBy: data.dischargedBy,
  };
}

export function DemoContent() {
  useEffect(() => {
    document.title = "AI Playground — Lafiyanku";
  }, []);

  const [form, setForm] = useState<FormData>({
    patientName: SAMPLE_DATA.patientName,
    age: String(SAMPLE_DATA.age),
    gender: SAMPLE_DATA.gender,
    diagnosis: SAMPLE_DATA.diagnosis,
    treatmentGiven: SAMPLE_DATA.treatmentGiven,
    medications: SAMPLE_DATA.medications.map((m) => ({
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
    })),
    languageRequested: SAMPLE_DATA.languageRequested,
    dischargedBy: SAMPLE_DATA.dischargedBy,
  });

  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<{
    clinicalSummary: string;
    patientFriendlyOutput: string;
    translatedOutput: string | null;
    translationLanguage: string | null;
    translationConfidence: string | null;
  } | null>(null);

  const currentStep = output ? 3 : loading ? 2 : 1;

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    mode1: true,
    mode2: false,
    translation: false,
  });

  const toggleSection = useCallback((key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const updateField = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const updateMedication = useCallback(
    (index: number, field: keyof FormData["medications"][0], value: string) => {
      setForm((prev) => {
        const meds = [...prev.medications];
        meds[index] = { ...meds[index], [field]: value };
        return { ...prev, medications: meds };
      });
    },
    [],
  );

  const addMedication = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      medications: [...prev.medications, { name: "", dosage: "", frequency: "" }],
    }));
  }, []);

  const removeMedication = useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index),
    }));
  }, []);

  const resetForm = useCallback(() => {
    setForm({
      patientName: SAMPLE_DATA.patientName,
      age: String(SAMPLE_DATA.age),
      gender: SAMPLE_DATA.gender,
      diagnosis: SAMPLE_DATA.diagnosis,
      treatmentGiven: SAMPLE_DATA.treatmentGiven,
      medications: SAMPLE_DATA.medications.map((m) => ({
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
      })),
      languageRequested: SAMPLE_DATA.languageRequested,
      dischargedBy: SAMPLE_DATA.dischargedBy,
    });
    setLoading(false);
    setOutput(null);
  }, []);

  const handleGenerate = async () => {
    if (!form.patientName || !form.diagnosis || !form.dischargedBy) {
      toast.error("Please fill in patient name, diagnosis, and clinician name.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/demo/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(form)),
      });

      if (res.status === 429) {
        toast.error("Rate limit exceeded. Please try again in an hour.");
        return;
      }

      if (!res.ok) throw new Error();

      const data = await res.json();
      setOutput({
        clinicalSummary: data.data.clinicalSummary,
        patientFriendlyOutput: data.data.patientFriendlyOutput,
        translatedOutput: data.data.translatedOutput,
        translationLanguage: data.data.translationLanguage,
        translationConfidence: data.data.translationConfidence,
      });
      toast.success("Demo discharge generated!");
    } catch {
      toast.error("Generation failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="max-w-3xl mx-auto space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-deep-navy">
            Lafiyanku Playground
          </h1>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-warm-amber bg-warm-amber/10 border border-warm-amber/20 rounded-full px-3 py-1 self-start">
            <Info className="h-3.5 w-3.5" />
            Sandbox — sample data only
          </span>
        </div>
        <p className="text-base sm:text-lg text-cool-grey">
          See how Lafiyanku turns clinical input into a discharge summary and patient instructions — in seconds.
        </p>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
          {[
            { num: 1, label: "Enter details" },
            { num: 2, label: "AI generates" },
            { num: 3, label: "Output ready" },
          ].map((step, i) => {
            const state = output
              ? "completed"
              : currentStep === step.num
                ? "active"
                : currentStep > step.num
                  ? "completed"
                  : "inactive";
            return (
              <div key={step.num} className="flex items-center gap-1.5">
                <div
                  className={`flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full text-[10px] sm:text-xs font-bold transition-colors duration-300 ${
                    state === "active"
                      ? "bg-clinical-teal text-white"
                      : state === "completed"
                        ? "bg-clinical-teal text-white"
                        : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {state === "completed" ? <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> : step.num}
                </div>
                <span
                  className={`transition-colors duration-300 ${
                    state === "active"
                      ? "font-medium text-deep-navy"
                      : state === "completed"
                        ? "font-medium text-deep-navy"
                        : "text-slate-400"
                  }`}
                >
                  {step.label}
                </span>
                {i < 2 && (
                  <div
                    className={`h-px w-4 sm:w-6 transition-colors duration-300 ${
                      currentStep > step.num ? "bg-clinical-teal" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left — Editable Form */}
        <div className="lg:col-span-5">
          <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-200 py-3 px-4 sm:px-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg font-bold text-deep-navy flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 sm:h-5 sm:w-5 text-clinical-teal" />
                  Patient Input
                </CardTitle>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-deep-navy transition-colors px-2 py-1 rounded-md hover:bg-slate-100"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 px-4 sm:px-6 space-y-4">
              {/* Patient Section */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Patient</span>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Patient Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={form.patientName}
                      onChange={(e) => updateField("patientName", e.target.value)}
                      placeholder="Full name"
                      className="h-9 sm:h-10"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">
                        Age <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        min={0}
                        max={130}
                        value={form.age}
                        onChange={(e) => updateField("age", e.target.value)}
                        className="h-9 sm:h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <Select value={form.gender} onValueChange={(v) => v && updateField("gender", v)}>
                        <SelectTrigger className="h-9 sm:h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinical Section */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Clinical</span>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Diagnosis <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      value={form.diagnosis}
                      onChange={(e) => updateField("diagnosis", e.target.value)}
                      placeholder="Primary diagnosis and secondary conditions"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Treatment Given <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      value={form.treatmentGiven}
                      onChange={(e) => updateField("treatmentGiven", e.target.value)}
                      placeholder="Summary of treatment during admission"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-700">
                        Medications <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={addMedication}
                        className="text-xs text-clinical-teal hover:text-clinical-teal/80 font-medium transition-colors"
                      >
                        + Add
                      </button>
                    </div>
                    <div className="space-y-2">
                      {form.medications.map((med, i) => (
                        <div key={i} className="rounded-lg border border-slate-200 p-2.5 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-cool-grey">Med #{i + 1}</span>
                            {form.medications.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeMedication(i)}
                                className="text-xs text-red-500 hover:text-red-600 transition-colors"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <Input
                              value={med.name}
                              onChange={(e) => updateMedication(i, "name", e.target.value)}
                              placeholder="Name"
                              className="h-8 sm:h-9 text-xs"
                            />
                            <Input
                              value={med.dosage}
                              onChange={(e) => updateMedication(i, "dosage", e.target.value)}
                              placeholder="Dosage"
                              className="h-8 sm:h-9 text-xs"
                            />
                            <Input
                              value={med.frequency}
                              onChange={(e) => updateMedication(i, "frequency", e.target.value)}
                              placeholder="Frequency"
                              className="h-8 sm:h-9 text-xs"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Discharged By <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={form.dischargedBy}
                      onChange={(e) => updateField("dischargedBy", e.target.value)}
                      placeholder="Clinician full name"
                      className="h-9 sm:h-10"
                    />
                  </div>
                </div>
              </div>

              {/* Settings Section */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                  <Languages className="h-3 w-3" />
                  Translation
                </span>
                <Select value={form.languageRequested} onValueChange={(v) => v && updateField("languageRequested", v)}>
                  <SelectTrigger className="h-9 sm:h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English (no translation)</SelectItem>
                    <SelectItem value="ha">Hausa</SelectItem>
                    <SelectItem value="yo">Yoruba</SelectItem>
                    <SelectItem value="ig">Igbo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-clinical-teal hover:bg-clinical-teal/90 text-white py-5 sm:py-6 flex items-center justify-center gap-2 rounded-xl text-sm sm:text-base font-bold shadow-lg shadow-clinical-teal/20 hover:shadow-[0_0_25px_rgba(11,110,110,0.3)] transition-all duration-200"
              >
                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Generate Discharge
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right — Output */}
        <div className="lg:col-span-7 space-y-4 lg:space-y-6">
          {loading && !output ? (
            /* Loading Skeleton */
            <div className="space-y-4 lg:space-y-6">
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="h-10 bg-slate-900 animate-pulse" />
                <div className="p-6 space-y-3 bg-white">
                  <div className="h-4 bg-slate-100 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-slate-100 rounded w-1/2 animate-pulse" />
                  <div className="h-4 bg-slate-100 rounded w-5/6 animate-pulse" />
                  <div className="h-4 bg-slate-100 rounded w-2/3 animate-pulse" />
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="h-10 bg-slate-900 animate-pulse" />
                <div className="p-6 space-y-3 bg-white">
                  <div className="h-4 bg-slate-100 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-slate-100 rounded w-1/2 animate-pulse" />
                  <div className="h-4 bg-slate-100 rounded w-5/6 animate-pulse" />
                </div>
              </div>
            </div>
          ) : output ? (
            /* Generated Output */
            <div className="space-y-3 lg:space-y-6">
              {/* Mode 1 — Clinical Record */}
              <AccordionCard
                id="mode1"
                title="Mode 1 — Clinical Record"
                icon={<FileText className="h-4 w-4" />}
                iconColor="text-clinical-teal"
                expanded={expandedSections.mode1}
                onToggle={() => toggleSection("mode1")}
              >
                <DischargeOutput text={output.clinicalSummary} mode="clinical" />
              </AccordionCard>

              {/* Mode 2 — Patient Instructions */}
              <AccordionCard
                id="mode2"
                title="Mode 2 — Patient Instructions"
                icon={<User className="h-4 w-4" />}
                iconColor="text-amber-500"
                expanded={expandedSections.mode2}
                onToggle={() => toggleSection("mode2")}
              >
                <DischargeOutput text={output.patientFriendlyOutput} mode="patient" />
              </AccordionCard>

              {/* Translated Output */}
              {output.translatedOutput && (
                <AccordionCard
                  id="translation"
                  title="Translated Output"
                  icon={<Languages className="h-4 w-4" />}
                  iconColor="text-clinical-teal"
                  expanded={expandedSections.translation}
                  onToggle={() => toggleSection("translation")}
                  badge={
                    <span className="text-[10px] px-2 py-0.5 bg-clinical-teal/10 text-clinical-teal rounded-full border border-clinical-teal/20 font-semibold uppercase">
                      {output.translationLanguage === "ha"
                        ? "Hausa"
                        : output.translationLanguage === "yo"
                          ? "Yoruba"
                          : "Igbo"}
                    </span>
                  }
                >
                  <DischargeOutput text={output.translatedOutput} mode="translated" />
                </AccordionCard>
              )}

              {/* Flagged Issues */}
              {output.clinicalSummary && (
                <FlaggedIssues
                  content={output.clinicalSummary + "\n" + output.patientFriendlyOutput}
                />
              )}
            </div>
          ) : (
            /* Pre-filled Sample Output */
            <div className="space-y-3 lg:space-y-6">
              <div className="flex items-center gap-2 text-sm text-cool-grey">
                <Sparkles className="h-4 w-4 text-clinical-teal" />
                <span>Preview with sample data — edit the form or click Generate to create your own.</span>
              </div>

              <AccordionCard
                id="sample-mode1"
                title="Mode 1 — Clinical Record"
                icon={<FileText className="h-4 w-4" />}
                iconColor="text-clinical-teal"
                expanded={expandedSections.mode1}
                onToggle={() => toggleSection("mode1")}
              >
                <DischargeOutput text={SAMPLE_OUTPUT.clinicalSummary} mode="clinical" />
              </AccordionCard>

              <AccordionCard
                id="sample-mode2"
                title="Mode 2 — Patient Instructions"
                icon={<User className="h-4 w-4" />}
                iconColor="text-amber-500"
                expanded={expandedSections.mode2}
                onToggle={() => toggleSection("mode2")}
              >
                <DischargeOutput text={SAMPLE_OUTPUT.patientFriendlyOutput} mode="patient" />
              </AccordionCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface AccordionCardProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  iconColor: string;
  expanded: boolean;
  onToggle: () => void;
  badge?: React.ReactNode;
  children: React.ReactNode;
}

function AccordionCard({ title, icon, iconColor, expanded, onToggle, badge, children }: AccordionCardProps) {
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-2 bg-slate-900 py-3 px-4 sm:px-6 text-left transition-colors hover:bg-slate-800"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className={iconColor}>{icon}</span>
          <span className="text-sm font-bold uppercase tracking-wider text-white truncate">{title}</span>
          {badge}
        </div>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 flex-shrink-0 transition-transform duration-200 lg:hidden ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Desktop: always visible */}
      <div className="hidden lg:block pt-2 pb-6 px-4 sm:px-6">
        {children}
      </div>

      {/* Mobile: collapsible */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          expanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="pt-2 pb-6 px-4 sm:px-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function FlaggedIssues({ content }: { content: string }) {
  const issues: string[] = [];
  const lower = content.toLowerCase();
  if (!lower.includes("red flag")) {
    issues.push("Missing Red Flag Warnings section");
  }
  if (!lower.includes("discharged by")) {
    issues.push("Missing Discharged By section");
  }
  if (!lower.includes("when to return")) {
    issues.push("Missing When to Return section");
  }

  if (issues.length === 0) return null;

  return (
    <div className="rounded-xl border border-warm-amber/20 bg-warm-amber/5 p-4">
      <div className="flex items-center gap-2 text-warm-amber font-semibold text-sm mb-2">
        <AlertTriangle className="h-4 w-4" />
        Flagged for Review
      </div>
      <ul className="space-y-1">
        {issues.map((issue) => (
          <li key={issue} className="text-xs text-warm-amber/80 flex items-start gap-1.5">
            <span className="mt-1 h-1 w-1 rounded-full bg-warm-amber/50 flex-shrink-0" />
            {issue}
          </li>
        ))}
      </ul>
    </div>
  );
}
