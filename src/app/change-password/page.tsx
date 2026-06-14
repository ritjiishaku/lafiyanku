"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { changePasswordSchema } from "@/lib/validations";

export default function ChangePasswordPage() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

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

  async function handleSubmit(e: React.FormEvent) {
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
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccess(true);
        setTimeout(async () => {
          await signOut({ redirect: false });
          window.location.href = "/login";
        }, 2000);
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

  if (success) {
    return (
      <AuthShell>
        <div className="rounded-2xl bg-pure-white p-8 shadow-xl shadow-slate-200/60 border border-slate-100 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-clinical-teal/10 mb-5">
            <Lock className="h-8 w-8 text-clinical-teal" />
          </div>
          <h1 className="text-xl font-bold text-deep-navy">Password updated</h1>
          <p className="mt-1.5 text-sm text-cool-grey">
            Your password has been changed. You will be signed out to sign in with your new password.
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
    <AuthShell>
      <div className="rounded-2xl bg-pure-white px-7 py-8 shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-warm-amber/10 mb-4">
          <Lock className="h-6 w-6 text-warm-amber" />
        </div>
        <h1 className="text-xl font-bold text-deep-navy text-center mb-1">Change your password</h1>
        <p className="text-sm text-cool-grey text-center mb-6">
          Your account requires a password change before you can continue.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
                placeholder="Enter your current password"
                autoComplete="current-password"
                className="pl-10 pr-10 h-11"
                aria-invalid={!!touched.currentPassword && !!errors.currentPassword}
                aria-describedby={errors.currentPassword ? "currentPassword-error" : undefined}
              />
              <button type="button" tabIndex={-1} onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-cool-grey/60 hover:text-cool-grey transition-colors" aria-label={showCurrent ? "Hide password" : "Show password"}>
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {touched.currentPassword && errors.currentPassword && <p id="currentPassword-error" className="text-[11px] text-warm-amber">{errors.currentPassword}</p>}
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
                aria-describedby={errors.newPassword ? "newPassword-error" : undefined}
              />
              <button type="button" tabIndex={-1} onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-cool-grey/60 hover:text-cool-grey transition-colors" aria-label={showNew ? "Hide password" : "Show password"}>
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {touched.newPassword && errors.newPassword && <p id="newPassword-error" className="text-[11px] text-warm-amber">{errors.newPassword}</p>}
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
                aria-describedby={errors.confirmNewPassword ? "confirmNewPassword-error" : undefined}
              />
              <button type="button" tabIndex={-1} onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-cool-grey/60 hover:text-cool-grey transition-colors" aria-label={showConfirm ? "Hide password" : "Show password"}>
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {touched.confirmNewPassword && errors.confirmNewPassword && <p id="confirmNewPassword-error" className="text-[11px] text-warm-amber">{errors.confirmNewPassword}</p>}
          </div>

          {serverError && (
            <Alert variant="destructive" className="rounded-lg border-red-200 bg-red-50 text-red-700 py-2.5">
              <AlertDescription className="text-xs">{serverError}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-lg text-sm font-bold hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-clinical-teal/20 transition-all duration-150 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Updating...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                Update password
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}
