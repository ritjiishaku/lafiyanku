"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, ArrowLeft, ArrowRight } from "lucide-react";
import { forgotPasswordSchema } from "@/lib/validations";

interface ForgotPasswordFormProps {
  onSwitchToLogin?: () => void;
}

export function ForgotPasswordForm({ onSwitchToLogin }: ForgotPasswordFormProps = {}) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function handleBlur() {
    setTouched(true);
    const result = forgotPasswordSchema.shape.email.safeParse(email);
    setFieldError(result.success ? undefined : result.error.issues[0]?.message);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setTouched(true);
    const result = forgotPasswordSchema.shape.email.safeParse(email);
    if (!result.success) {
      setFieldError(result.error.issues[0]?.message);
      return;
    }
    setFieldError(undefined);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setIsLoading(false);
        return;
      }
      setSent(true);
      setIsLoading(false);
    } catch {
      setError("Network error. Please try again.");
      setIsLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="w-full max-w-md rounded-2xl bg-pure-white p-8 shadow-xl shadow-slate-200/60 border border-slate-100 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-clinical-teal/10 mb-5">
          <Mail className="h-8 w-8 text-clinical-teal" />
        </div>
        <h1 className="text-xl font-bold text-deep-navy mb-2">Check your email</h1>
        <p className="text-sm text-cool-grey mb-6 leading-relaxed">
          If an account exists for <strong>{email}</strong>, we&apos;ve sent password reset instructions.
        </p>
        <button type="button" onClick={onSwitchToLogin} className="text-sm font-medium text-clinical-teal hover:text-clinical-teal/80 transition-colors">
          Back to sign in
        </button>
      </div>
    );
  }

  const showError = touched && fieldError;

  return (
    <div className="w-full max-w-md">
      <button type="button" onClick={onSwitchToLogin} className="inline-flex items-center gap-1.5 text-sm text-cool-grey hover:text-clinical-teal transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </button>

      <div className="rounded-2xl bg-pure-white px-7 py-8 shadow-xl shadow-slate-200/50 border border-slate-100">
        <h1 className="text-xl font-bold text-deep-navy mb-1">Forgot your password?</h1>
        <p className="text-sm text-cool-grey mb-5">No worries. Enter your email and we&apos;ll send you a reset link.</p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1">
            <Label htmlFor="email" className="text-sm font-medium text-slate/90">
              Email <span className="text-warm-amber">*</span>
            </Label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <Mail className="h-4 w-4 text-cool-grey/60" />
              </div>
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoCapitalize="off"
                placeholder="clinician@hospital.ng"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (touched) handleBlur(); }}
                onBlur={handleBlur}
                autoComplete="email"
                className="pl-10 h-11"
                aria-invalid={!!showError}
                aria-describedby={showError ? "email-error" : undefined}
              />
            </div>
            {showError && <p id="email-error" className="text-[11px] text-warm-amber">{fieldError}</p>}
          </div>

          {error && (
            <Alert variant="destructive" className="rounded-lg border-red-200 bg-red-50 text-red-700 py-2.5">
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-lg text-sm font-bold hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-clinical-teal/20 transition-all duration-150 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Sending...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                Send reset link
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
