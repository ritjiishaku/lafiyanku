"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, ArrowRight, ArrowLeft, Lock, Eye, EyeOff, FilePlus, Languages, Shield } from "lucide-react";
import { changePasswordSchema } from "@/lib/validations";

const ONBOARDED_KEY = "lafiyanku-clinician-onboarded";

const STEPS = [
  { num: 1, label: "Welcome" },
  { num: 2, label: "Change password" },
  { num: 3, label: "Overview" },
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

export default function ClinicianOnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [step, setStep] = useState(1);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(ONBOARDED_KEY)) {
      router.replace("/dashboard");
    }
  }, [router]);

  useEffect(() => {
    if (status === "authenticated") {
      const user = session?.user as { mustChangePassword?: boolean; role?: string };
      if (!user.mustChangePassword) {
        router.replace("/dashboard");
      } else if (user.role === "admin") {
        router.replace("/onboarding/admin");
      }
    }
  }, [session, status, router]);

  function validateField(name: string) {
    const result = changePasswordSchema.safeParse(form);
    if (result.success) { setErrors({}); return; }
    const issue = result.error.issues.find((i) => i.path[0] === name);
    setErrors((prev) => ({ ...prev, [name]: issue?.message }));
  }

  function handleBlur(name: string) {
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name);
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    const result = changePasswordSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof typeof form, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        if (!fieldErrors[field as keyof typeof form]) {
          fieldErrors[field as keyof typeof form] = issue.message;
        }
      }
      setErrors(fieldErrors);
      setTouched({ currentPassword: true, newPassword: true, confirmNewPassword: true });
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/settings/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword, confirmNewPassword: form.confirmNewPassword }),
      });
      const json = await res.json();
      if (json.success) {
        setPasswordChanged(true);
        setStep(3);
      } else {
        const errMsg = json.error?.message ?? json.error ?? "Failed to change password";
        setServerError(typeof errMsg === "string" ? errMsg : "Failed to change password");
      }
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleComplete() {
    localStorage.setItem(ONBOARDED_KEY, "true");
    signOut({ redirect: false }).then(() => {
      window.location.href = "/login";
    });
  }

  const userName = (session?.user as { name?: string })?.name ?? "Clinician";
  const roleName = ((session?.user as { role?: string })?.role ?? "clinician");
  const displayName = roleName.charAt(0).toUpperCase() + roleName.slice(1);

  return (
    <AuthShell>
      <div className="rounded-2xl bg-pure-white px-7 py-8 shadow-xl shadow-slate-200/50 border border-slate-100">
        <ProgressIndicator currentStep={step} />

        {step === 1 && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-clinical-teal/10 mb-4">
                <span className="text-2xl font-bold text-clinical-teal">{userName.charAt(0)?.toUpperCase()}</span>
              </div>
              <h1 className="text-xl font-bold text-deep-navy">Welcome, {userName.split(" ")[0]}</h1>
              <p className="mt-1.5 text-sm text-cool-grey">
                <span className="inline-block rounded-full bg-clinical-teal/10 px-2 py-0.5 text-xs font-semibold text-clinical-teal mr-1">{displayName}</span>
                account ready
              </p>
            </div>

            <div className="rounded-xl bg-warm-amber/5 border border-warm-amber/20 p-4">
              <p className="text-xs font-medium text-warm-amber leading-relaxed">
                Your admin has created your account with a temporary password. You must change it before continuing.
              </p>
            </div>

            <Button
              onClick={() => setStep(2)}
              className="w-full h-11 rounded-lg text-sm font-bold hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-clinical-teal/20 transition-all duration-150"
            >
              <span className="inline-flex items-center gap-2">
                Change password
                <ArrowRight className="h-4 w-4" />
              </span>
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-clinical-teal/10 mb-4">
                <Lock className="h-7 w-7 text-clinical-teal" />
              </div>
              <h1 className="text-xl font-bold text-deep-navy">Set your password</h1>
              <p className="mt-1.5 text-sm text-cool-grey">Choose a strong password you will remember.</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4" noValidate>
              <div className="space-y-1">
                <Label htmlFor="currentPassword" className="text-sm font-medium text-slate/90">
                  Current password <span className="text-warm-amber">*</span>
                </Label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Lock className="h-4 w-4 text-cool-grey/60" />
                  </div>
                  <Input
                    id="currentPassword"
                    type={showCurrent ? "text" : "password"}
                    value={form.currentPassword}
                    onChange={(e) => { setForm({ ...form, currentPassword: e.target.value }); if (touched.currentPassword) validateField("currentPassword"); }}
                    onBlur={() => handleBlur("currentPassword")}
                    placeholder="Enter the temporary password"
                    autoComplete="current-password"
                    className="pl-10 pr-10 h-11"
                    aria-invalid={!!touched.currentPassword && !!errors.currentPassword}
                    aria-describedby={errors.currentPassword ? "cp-err" : undefined}
                  />
                  <button type="button" tabIndex={-1} onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-cool-grey/60 hover:text-cool-grey transition-colors">
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {touched.currentPassword && errors.currentPassword && <p id="cp-err" className="text-[11px] text-warm-amber">{errors.currentPassword}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="newPassword" className="text-sm font-medium text-slate/90">
                  New password <span className="text-warm-amber">*</span>
                </Label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Lock className="h-4 w-4 text-cool-grey/60" />
                  </div>
                  <Input
                    id="newPassword"
                    type={showNew ? "text" : "password"}
                    value={form.newPassword}
                    onChange={(e) => { setForm({ ...form, newPassword: e.target.value }); if (touched.newPassword) validateField("newPassword"); }}
                    onBlur={() => handleBlur("newPassword")}
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    className="pl-10 pr-10 h-11"
                    aria-invalid={!!touched.newPassword && !!errors.newPassword}
                    aria-describedby={errors.newPassword ? "np-err" : undefined}
                  />
                  <button type="button" tabIndex={-1} onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-cool-grey/60 hover:text-cool-grey transition-colors">
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {touched.newPassword && errors.newPassword && <p id="np-err" className="text-[11px] text-warm-amber">{errors.newPassword}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirmNewPassword" className="text-sm font-medium text-slate/90">
                  Confirm new password <span className="text-warm-amber">*</span>
                </Label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Lock className="h-4 w-4 text-cool-grey/60" />
                  </div>
                  <Input
                    id="confirmNewPassword"
                    type={showConfirm ? "text" : "password"}
                    value={form.confirmNewPassword}
                    onChange={(e) => { setForm({ ...form, confirmNewPassword: e.target.value }); if (touched.confirmNewPassword) validateField("confirmNewPassword"); }}
                    onBlur={() => handleBlur("confirmNewPassword")}
                    placeholder="Re-enter your new password"
                    autoComplete="new-password"
                    className="pl-10 pr-10 h-11"
                    aria-invalid={!!touched.confirmNewPassword && !!errors.confirmNewPassword}
                    aria-describedby={errors.confirmNewPassword ? "cnp-err" : undefined}
                  />
                  <button type="button" tabIndex={-1} onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-cool-grey/60 hover:text-cool-grey transition-colors">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {touched.confirmNewPassword && errors.confirmNewPassword && <p id="cnp-err" className="text-[11px] text-warm-amber">{errors.confirmNewPassword}</p>}
              </div>

              {serverError && (
                <Alert variant="destructive" className="rounded-lg border-red-200 bg-red-50 text-red-700 py-2.5">
                  <AlertDescription className="text-xs">{serverError}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(1)} disabled={isSubmitting} className="h-11 rounded-lg text-sm font-medium flex-1">
                  <span className="inline-flex items-center gap-2"><ArrowLeft className="h-4 w-4" />Back</span>
                </Button>
                <Button type="submit" disabled={isSubmitting} className="h-11 rounded-lg text-sm font-bold hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-clinical-teal/20 transition-all duration-150 disabled:opacity-50 disabled:hover:translate-y-0 flex-[2]">
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Updating...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">Update password<ArrowRight className="h-4 w-4" /></span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-clinical-teal/10 mb-4">
                <Check className="h-7 w-7 text-clinical-teal" />
              </div>
              <h1 className="text-xl font-bold text-deep-navy">
                {passwordChanged ? "Password updated" : "You are all set"}
              </h1>
              <p className="mt-1.5 text-sm text-cool-grey leading-relaxed">
                {passwordChanged
                  ? "Your password has been changed. Here is what you can do with Lafiyanku."
                  : "Here is what you can do with Lafiyanku."}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-xl border border-slate/10 bg-cool-off-white p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-clinical-teal/10 shrink-0">
                  <FilePlus className="h-5 w-5 text-clinical-teal" />
                </div>
                <div>
                  <p className="text-sm font-bold text-deep-navy">Create discharge records</p>
                  <p className="text-xs text-cool-grey mt-0.5">Fill in the patient form and the AI generates both a clinical summary and patient-friendly instructions</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-slate/10 bg-cool-off-white p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-clinical-teal/10 shrink-0">
                  <Languages className="h-5 w-5 text-clinical-teal" />
                </div>
                <div>
                  <p className="text-sm font-bold text-deep-navy">Translate to local languages</p>
                  <p className="text-xs text-cool-grey mt-0.5">Convert patient instructions into Hausa, Yoruba, or Igbo so every patient understands their discharge</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-slate/10 bg-cool-off-white p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-clinical-teal/10 shrink-0">
                  <Shield className="h-5 w-5 text-clinical-teal" />
                </div>
                <div>
                  <p className="text-sm font-bold text-deep-navy">NDPR compliant</p>
                  <p className="text-xs text-cool-grey mt-0.5">Every action is audit-logged and patient data is processed in accordance with NDPR 2019</p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleComplete}
              className="w-full h-11 rounded-lg text-sm font-bold hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-clinical-teal/20 transition-all duration-150"
            >
              <span className="inline-flex items-center gap-2">
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </span>
            </Button>
          </div>
        )}
      </div>
    </AuthShell>
  );
}
