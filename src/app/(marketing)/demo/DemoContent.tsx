"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Sparkles } from "lucide-react";
import { toast } from "sonner";

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
      notes: "Continue daily"
    },
    {
      name: "Amlodipine",
      dosage: "5mg",
      frequency: "once daily",
      timing: "morning",
      duration: "ongoing",
      notes: "Monitor BP"
    }
  ],
  followUpInstructions: "Check blood glucose TID. Follow up at Medical Outpatient Clinic in 2 weeks.",
  additionalNotes: "Patient educated on insulin adherence and dietary modifications.",
  languageRequested: "en",
  dischargedBy: "Dr. Chidi Obi",
  clinicianLicenseNo: "MDCN-12345"
};

export function DemoContent() {
  useEffect(() => {
    document.title = "AI Playground — Lafiyanku";
  }, []);

  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<{
    clinicalSummary: string;
    patientFriendlyOutput: string;
  } | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/demo/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(SAMPLE_DATA),
      });

      if (res.status === 429) {
        toast.error("Rate limit exceeded. Please try again in an hour.");
        return;
      }

      if (!res.ok) throw new Error();

      const data = await res.json();
      setOutput({
        clinicalSummary: data.clinicalSummary,
        patientFriendlyOutput: data.patientFriendlyOutput
      });
      toast.success("Demo discharge generated!");
    } catch {
      toast.error("Generation failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-deep-navy sm:text-4xl">
          Lafiyanku Playground
        </h1>
        <p className="text-lg text-slate-600">
          Experience our dual-engine generation pipeline first-hand using sandbox patient data.
        </p>
      </div>

      <Alert className="bg-warm-amber/10 border-warm-amber/20 text-warm-amber rounded-xl">
        <Info className="h-5 w-5 text-warm-amber" />
        <AlertTitle className="font-bold">Sandbox Environment Banner</AlertTitle>
        <AlertDescription className="text-sm">
          This is a live demo using sample patient data. Do not upload or insert real patient information.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-slate-200 shadow-sm rounded-xl">
            <CardHeader className="bg-slate-50 border-b border-slate-200">
              <CardTitle className="text-lg font-bold text-deep-navy">Sandbox Patient Input</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4 text-sm">
              <div>
                <span className="font-semibold text-slate-500 block">Patient Name:</span>
                <span className="text-slate-800">{SAMPLE_DATA.patientName} ({SAMPLE_DATA.age}y {SAMPLE_DATA.gender})</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500 block">Primary Diagnosis:</span>
                <span className="text-slate-800">{SAMPLE_DATA.diagnosis}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500 block">Medications Submitted:</span>
                <div className="mt-1 space-y-1">
                  {SAMPLE_DATA.medications.map((med, idx) => (
                    <div key={idx} className="bg-slate-50 p-2 rounded border border-slate-100">
                      <strong>{med.name}</strong> - {med.dosage} ({med.frequency})
                    </div>
                  ))}
                </div>
              </div>
              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-clinical-teal hover:bg-clinical-teal/90 text-white py-6 flex items-center justify-center gap-2 rounded-lg"
              >
                <Sparkles className="h-5 w-5" />
                {loading ? "Generating..." : "Generate Sample Discharge"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
          {output ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="bg-slate-900 border-b border-slate-800 text-white py-3">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-clinical-teal">
                    Mode 1 — Clinical Record
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 text-xs font-mono whitespace-pre-wrap leading-relaxed text-slate-800">
                  {output.clinicalSummary}
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="bg-slate-900 border-b border-slate-800 text-white py-3">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-amber-500">
                    Mode 2 — Patient Handout
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 text-sm whitespace-pre-wrap leading-relaxed text-slate-800">
                  {output.patientFriendlyOutput}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl h-[350px] text-center p-6 bg-slate-50">
              <p className="text-slate-400 font-medium">
                Click the generate button on the left to see the AI output render here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
