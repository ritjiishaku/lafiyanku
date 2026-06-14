"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, ArrowLeft, FilePlus, Building, Shield, ClipboardCheck } from "lucide-react";

const ONBOARDED_KEY = "lafiyanku-admin-onboarded";
const CONSENT_KEY = "lafiyanku-admin-consented";

const STEPS = [
  { num: 1, label: "Welcome" },
  { num: 2, label: "Your facility" },
  { num: 3, label: "Get started" },
];

function ProgressIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((s, i) => (
        <div key={s.num} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                currentStep > s.num
                  ? "bg-clinical-teal text-white"
                  : currentStep === s.num
                  ? "bg-clinical-teal text-white ring-4 ring-clinical-teal/20"
                  : "bg-slate-100 text-cool-grey"
              }`}
            >
              {currentStep > s.num ? <Check className="h-4 w-4" /> : s.num}
            </div>
            <span
              className={`mt-1.5 text-[11px] font-semibold whitespace-nowrap transition-colors duration-300 ${
                currentStep >= s.num ? "text-deep-navy" : "text-cool-grey"
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className="mx-3 mb-5 h-0.5 w-16 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-clinical-teal transition-all duration-500"
                style={{ width: currentStep > i + 1 ? "100%" : currentStep === i + 1 ? "50%" : "0%" }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function AdminOnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [step, setStep] = useState(1);
  const [consented, setConsented] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(CONSENT_KEY) === "true";
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(ONBOARDED_KEY)) {
      router.replace("/admin");
    }
  }, [router]);

  useEffect(() => {
    if (status === "authenticated") {
      const user = session?.user as { mustChangePassword?: boolean; role?: string };
      if (user.mustChangePassword) {
        router.replace("/onboarding/clinician");
      } else if (user.role !== "admin") {
        router.replace("/dashboard");
      }
    }
  }, [session, status, router]);

  function handleComplete() {
    localStorage.setItem(ONBOARDED_KEY, "true");
    localStorage.setItem(CONSENT_KEY, "true");
    router.push("/admin");
  }

  function handleSkip() {
    localStorage.setItem(ONBOARDED_KEY, "true");
    router.push("/admin");
  }

  const userName = (session?.user as { name?: string })?.name ?? "Admin";

  return (
    <AuthShell variant="facility">
      <div className="rounded-2xl bg-pure-white px-7 py-8 shadow-xl shadow-slate-200/50 border border-slate-100">
        <ProgressIndicator currentStep={step} />

        {step === 1 && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-clinical-teal/10 mb-4">
                <ClipboardCheck className="h-7 w-7 text-clinical-teal" />
              </div>
              <h1 className="text-xl font-bold text-deep-navy">Welcome to Lafiyanku, {userName.split(" ")[0]}</h1>
              <p className="mt-1.5 text-sm text-cool-grey leading-relaxed">
                AI-powered discharge documentation for Nigerian hospitals. Every patient receives instructions they can understand.
              </p>
            </div>

            <div className="space-y-3 rounded-xl bg-cool-off-white p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-clinical-teal" />
                <p className="text-sm text-slate">Clinical summary and patient-friendly instructions generated together</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-clinical-teal" />
                <p className="text-sm text-slate">Translate into Hausa, Yoruba, and Igbo</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-clinical-teal" />
                <p className="text-sm text-slate">NDPR 2019 compliant with full audit trail</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-clinical-teal" />
                <p className="text-sm text-slate">Aligned with FMOH patient record standards</p>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-slate/20 p-3 hover:bg-cool-off-white transition-colors">
              <input
                type="checkbox"
                checked={consented}
                onChange={(e) => setConsented(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-clinical-teal focus:ring-clinical-teal"
              />
              <span className="text-xs text-slate leading-relaxed">
                I consent to the processing of patient data in accordance with NDPR 2019. Patient data will be handled securely and used only for generating discharge documentation.
              </span>
            </label>

            <Button
              onClick={() => setStep(2)}
              disabled={!consented}
              className="w-full h-11 rounded-lg text-sm font-bold hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-clinical-teal/20 transition-all duration-150 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              <span className="inline-flex items-center gap-2">
                Continue
                <ArrowRight className="h-4 w-4" />
              </span>
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-clinical-teal/10 mb-4">
                <Building className="h-7 w-7 text-clinical-teal" />
              </div>
              <h1 className="text-xl font-bold text-deep-navy">Your facility is ready</h1>
              <p className="mt-1.5 text-sm text-cool-grey leading-relaxed">
                Your hospital or clinic has been registered. You can now add clinicians and start generating discharge records.
              </p>
            </div>

            <div className="rounded-xl border border-clinical-teal/20 bg-clinical-teal/5 p-4">
              <p className="text-xs font-medium text-clinical-teal/80 uppercase tracking-wider mb-2">What you can do next</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-clinical-teal/10 shrink-0">
                    <FilePlus className="h-4 w-4 text-clinical-teal" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-deep-navy">Add clinicians</p>
                    <p className="text-xs text-cool-grey">Create doctor and nurse accounts for your facility</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-clinical-teal/10 shrink-0">
                    <Shield className="h-4 w-4 text-clinical-teal" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-deep-navy">Monitor compliance</p>
                    <p className="text-xs text-cool-grey">View audit logs and ensure NDPR compliance</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="h-11 rounded-lg text-sm font-medium flex-1"
              >
                <span className="inline-flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </span>
              </Button>
              <Button
                onClick={() => setStep(3)}
                className="h-11 rounded-lg text-sm font-bold hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-clinical-teal/20 transition-all duration-150 flex-[2]"
              >
                <span className="inline-flex items-center gap-2">
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-clinical-teal/10 mb-4">
                <ArrowRight className="h-7 w-7 text-clinical-teal" />
              </div>
              <h1 className="text-xl font-bold text-deep-navy">You are all set</h1>
              <p className="mt-1.5 text-sm text-cool-grey leading-relaxed">
                Choose where to go next. You can always access these from the sidebar.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleComplete}
                className="w-full rounded-xl border border-slate/20 p-4 text-left transition-all hover:border-clinical-teal/30 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-clinical-teal/10 shrink-0">
                    <FilePlus className="h-5 w-5 text-clinical-teal" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-deep-navy">Add your first clinician</p>
                    <p className="text-xs text-cool-grey mt-0.5">Create a doctor or nurse account to start generating discharge records</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-cool-grey shrink-0" />
                </div>
              </button>

              <button
                onClick={handleSkip}
                className="w-full rounded-xl border border-slate/20 p-4 text-left transition-all hover:border-clinical-teal/30 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-deep-navy/10 shrink-0">
                    <Building className="h-5 w-5 text-deep-navy" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-deep-navy">Go to Facility Management</p>
                    <p className="text-xs text-cool-grey mt-0.5">View your facility details and settings</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-cool-grey shrink-0" />
                </div>
              </button>
            </div>

            <button
              onClick={handleSkip}
              className="w-full text-center text-xs font-medium text-cool-grey hover:text-clinical-teal transition-colors pt-2"
            >
              Skip for now
            </button>
          </div>
        )}
      </div>
    </AuthShell>
  );
}
