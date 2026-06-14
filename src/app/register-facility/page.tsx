"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { facilityRegisterSchema, facilityRegisterStep1Schema } from "@/lib/validations";
import {
  Building, User, Mail, Lock, CheckCircle, ArrowRight, ArrowLeft,
  Eye, EyeOff, Check,
} from "lucide-react";

const STEPS = [
  { num: 1, label: "Facility details" },
  { num: 2, label: "Admin account" },
];

function Field({ label, id, error, children }: { label: string; id: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-sm font-medium text-slate/90">{label}</Label>
      {children}
      {error && <p className="text-[11px] text-warm-amber mt-0.5">{error}</p>}
    </div>
  );
}

function ProgressIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((s, i) => (
        <div key={s.num} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
                currentStep > s.num
                  ? "bg-clinical-teal text-white"
                  : currentStep === s.num
                  ? "bg-clinical-teal text-white ring-4 ring-clinical-teal/20"
                  : "bg-slate-100 text-cool-grey",
              )}
            >
              {currentStep > s.num ? <Check className="h-4 w-4" /> : s.num}
            </div>
            <span
              className={cn(
                "mt-1.5 text-[11px] font-semibold whitespace-nowrap transition-colors duration-300",
                currentStep >= s.num ? "text-deep-navy" : "text-cool-grey",
              )}
            >
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className="mx-3 mb-5 h-0.5 w-16 sm:w-28 rounded-full bg-slate-200 overflow-hidden">
              <div
                className={cn("h-full rounded-full bg-clinical-teal transition-all duration-500")}
                style={{ width: currentStep > i + 1 ? "100%" : currentStep === i + 1 ? "50%" : "0%" }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function RegisterFacilityPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [facilityName, setFacilityName] = useState("");
  const [facilityCode, setFacilityCode] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminConfirmPassword, setAdminConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function clearError() { setError(null); setFieldErrors({}); }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function validateStep(stepData: Record<string, unknown>, schema: any) {
    const result = schema.safeParse(stepData);
    if (result.success) { setFieldErrors({}); return true; }
    const errs: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as string;
      if (!errs[field]) errs[field] = issue.message;
    }
    setFieldErrors(errs);
    return false;
  }

  const handleNext = useCallback(() => {
    clearError();
    validateStep({ facilityName, facilityCode }, facilityRegisterStep1Schema);
    if (!fieldErrors.facilityName) setStep(2);
  }, [facilityName, facilityCode]);

  const handleBack = useCallback(() => {
    setStep(1);
    setFieldErrors({});
    setError(null);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    if (!validateStep({ facilityName, facilityCode, adminName, adminEmail, adminPassword, adminConfirmPassword }, facilityRegisterSchema)) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/facilities/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facilityName,
          facilityCode: facilityCode || undefined,
          adminName,
          adminEmail,
          adminPassword,
          adminConfirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const detail = data.error?.details?.detail as string | undefined;
        const baseMsg = data.error?.message ?? "Registration failed. Please try again.";
        const displayMsg = detail || (typeof baseMsg === "string" ? baseMsg : "Registration failed. Please try again.");
        setError(displayMsg);
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setIsLoading(false);
      setTimeout(() => router.push(`/facility/login?name=${encodeURIComponent(facilityName)}`), 3000);
    } catch {
      setError("Network error. Please try again.");
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <AuthShell>
        <div className="rounded-2xl bg-pure-white p-8 shadow-xl shadow-slate-200/60 border border-slate-100 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-clinical-teal/10 mb-5">
            <CheckCircle className="h-8 w-8 text-clinical-teal" />
          </div>
          <h1 className="text-xl font-bold text-deep-navy">Facility registered</h1>
          <p className="mt-1.5 text-sm text-cool-grey">
            Your facility has been created. You can now sign in as the administrator.
          </p>
          <div className="mt-6 h-1 w-full rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full w-2/3 rounded-full bg-clinical-teal animate-pulse" />
          </div>
          <p className="mt-3 text-xs text-cool-grey">Redirecting to sign in...</p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell variant="facility">
      <div className="rounded-2xl bg-pure-white px-7 py-8 shadow-xl shadow-slate-200/50 border border-slate-100">

        <ProgressIndicator currentStep={step} />

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ── Step 1: Facility details ── */}
          <div className={cn("space-y-4", step !== 1 && "hidden")}>
            <Field label="Facility name" id="facilityName" error={fieldErrors.facilityName}>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Building className="h-4 w-4 text-cool-grey/60" />
                </div>
                <Input
                  id="facilityName"
                  type="text"
                  placeholder="e.g. Kano General Hospital"
                  value={facilityName}
                  onChange={(e) => { setFacilityName(e.target.value); clearError(); }}
                  required
                  autoComplete="organization"
                  enterKeyHint="next"
                  className="pl-10 h-11"
                  aria-invalid={!!fieldErrors.facilityName}
                  aria-describedby={fieldErrors.facilityName ? "facilityName-error" : undefined}
                />
              </div>
            </Field>

            <Field label="Facility code (optional)" id="facilityCode">
              <Input
                id="facilityCode"
                type="text"
                placeholder="e.g. KGH-001"
                value={facilityCode}
                onChange={(e) => setFacilityCode(e.target.value)}
                autoComplete="off"
                enterKeyHint="next"
                className="h-11"
              />
            </Field>

            <div className="pt-2">
              <Button
                type="button"
                onClick={handleNext}
                className="w-full h-11 rounded-lg text-sm font-bold hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-clinical-teal/20 transition-all duration-150"
              >
                <span className="inline-flex items-center gap-2">
                  Next step
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Button>
            </div>
          </div>

          {/* ── Step 2: Admin account ── */}
          <div className={cn("space-y-4", step !== 2 && "hidden")}>
            <div className="rounded-xl bg-clinical-teal/5 border border-clinical-teal/10 px-4 py-3">
              <p className="text-xs font-medium text-clinical-teal/80">
                <span className="inline-flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5" />
                  {facilityName || "Your facility"}
                </span>
              </p>
            </div>

            <Field label="Admin full name" id="adminName" error={fieldErrors.adminName}>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <User className="h-4 w-4 text-cool-grey/60" />
                </div>
                <Input
                  id="adminName"
                  type="text"
                  placeholder="e.g. Dr. Ali Suleiman"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  required
                  autoComplete="name"
                  enterKeyHint="next"
                  className="pl-10 h-11"
                  aria-invalid={!!fieldErrors.adminName}
                  aria-describedby={fieldErrors.adminName ? "adminName-error" : undefined}
                />
              </div>
            </Field>

            <Field label="Admin email" id="adminEmail" error={fieldErrors.adminEmail}>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Mail className="h-4 w-4 text-cool-grey/60" />
                </div>
                <Input
                  id="adminEmail"
                  type="email"
                  inputMode="email"
                  autoCapitalize="off"
                  placeholder="admin@hospital.ng"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                  autoComplete="email"
                  enterKeyHint="next"
                  className="pl-10 h-11"
                  aria-invalid={!!fieldErrors.adminEmail}
                  aria-describedby={fieldErrors.adminEmail ? "adminEmail-error" : undefined}
                />
              </div>
            </Field>

            <Field label="Admin password" id="adminPassword" error={fieldErrors.adminPassword}>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Lock className="h-4 w-4 text-cool-grey/60" />
                </div>
                <Input
                  id="adminPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  enterKeyHint="next"
                  className="pl-10 pr-10 h-11"
                  aria-invalid={!!fieldErrors.adminPassword}
                  aria-describedby={fieldErrors.adminPassword ? "adminPassword-error" : undefined}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cool-grey/60 hover:text-cool-grey transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <Field label="Confirm admin password" id="adminConfirmPassword" error={fieldErrors.adminConfirmPassword}>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Lock className="h-4 w-4 text-cool-grey/60" />
                </div>
                <Input
                  id="adminConfirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={adminConfirmPassword}
                  onChange={(e) => setAdminConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  enterKeyHint="done"
                  className="pl-10 pr-10 h-11"
                  aria-invalid={!!fieldErrors.adminConfirmPassword}
                  aria-describedby={fieldErrors.adminConfirmPassword ? "adminConfirmPassword-error" : undefined}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cool-grey/60 hover:text-cool-grey transition-colors"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            {error && (
              <Alert variant="destructive" className="rounded-lg border-red-200 bg-red-50 text-red-700 py-2.5">
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isLoading}
                className="h-11 rounded-lg text-sm font-medium flex-1"
              >
                <span className="inline-flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </span>
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 rounded-lg text-sm font-bold hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-clinical-teal/20 transition-all duration-150 disabled:opacity-50 disabled:hover:translate-y-0 flex-[2]"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Registering...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    Register facility
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </div>
          </div>

        </form>
      </div>

      <div className="mt-5 space-y-2 text-center text-sm text-cool-grey">
        <p>
          Already registered?{" "}
          <Link href="/login" className="font-medium text-clinical-teal hover:text-clinical-teal/80 transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      <p className="mt-5 text-xs text-warm-amber leading-relaxed text-center">
        By continuing, you consent to the processing of patient data in accordance with NDPR 2019.
      </p>
    </AuthShell>
  );
}
