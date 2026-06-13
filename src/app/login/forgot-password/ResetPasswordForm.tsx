"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Eye, EyeOff } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { resetPasswordSchema } from "@/lib/validations";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

type FieldErrors = Partial<Record<"password" | "confirmPassword", string>>;

export function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        // User has arrived via the reset link
      }
    });
  }, []);

  function validateField(name: string, value: string): string | undefined {
    const fieldSchema = name === "password"
      ? resetPasswordSchema.shape.password
      : resetPasswordSchema.shape.confirmPassword;
    const otherValue = name === "password" ? confirmPassword : password;
    const data = name === "password" ? { password: value, confirmPassword: otherValue } : { password: otherValue, confirmPassword: value };
    const result = resetPasswordSchema.safeParse(data);
    if (result.success) return undefined;
    const issue = result.error.issues.find((i) => i.path[0] === name);
    return issue?.message;
  }

  function handleBlur(name: string) {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const value = name === "password" ? password : confirmPassword;
    const err = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: err }));
  }

  function validate(): boolean {
    const result = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (result.success) { setErrors({}); return true; }
    const fieldErrors: FieldErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as string;
      if (!fieldErrors[field as keyof FieldErrors]) {
        fieldErrors[field as keyof FieldErrors] = issue.message;
      }
    }
    setErrors(fieldErrors);
    return false;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setServerError(error.message);
        setIsLoading(false);
        return;
      }
      setSuccess(true);
      setIsLoading(false);
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      setServerError("Network error. Please try again.");
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md rounded-2xl bg-pure-white p-8 shadow-xl shadow-slate-200/60 border border-slate-100 text-center">
        <h1 className="text-xl font-bold text-deep-navy mb-2">Password updated</h1>
        <p className="text-sm text-cool-grey">Redirecting you to sign in...</p>
      </div>
    );
  }

  const showPasswordError = touched.password && errors.password;
  const showConfirmError = touched.confirmPassword && errors.confirmPassword;

  return (
    <div className="w-full max-w-md rounded-2xl bg-pure-white px-7 py-8 shadow-xl shadow-slate-200/50 border border-slate-100">
      <h1 className="text-xl font-bold text-deep-navy mb-1">Choose a new password</h1>
      <p className="text-sm text-cool-grey mb-5">Make it at least 8 characters.</p>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-1">
          <Label htmlFor="password" className="text-sm font-medium text-slate/90">
            New password <span className="text-warm-amber">*</span>
          </Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cool-grey/60" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (touched.password) handleBlur("password"); }}
              onBlur={() => handleBlur("password")}
              autoComplete="new-password"
              className="pl-10 pr-10 h-11"
              aria-invalid={!!showPasswordError}
              aria-describedby={showPasswordError ? "password-error" : undefined}
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
          {showPasswordError && <p id="password-error" className="text-[11px] text-warm-amber">{errors.password}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate/90">
            Confirm new password <span className="text-warm-amber">*</span>
          </Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cool-grey/60" />
            <Input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); if (touched.confirmPassword) handleBlur("confirmPassword"); }}
              onBlur={() => handleBlur("confirmPassword")}
              autoComplete="new-password"
              className="pl-10 pr-10 h-11"
              aria-invalid={!!showConfirmError}
              aria-describedby={showConfirmError ? "confirm-error" : undefined}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-cool-grey/60 hover:text-cool-grey transition-colors"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {showConfirmError && <p id="confirm-error" className="text-[11px] text-warm-amber">{errors.confirmPassword}</p>}
        </div>

        {serverError && (
          <Alert variant="destructive" className="rounded-lg border-red-200 bg-red-50 text-red-700 py-2.5">
            <AlertDescription className="text-xs">{serverError}</AlertDescription>
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
              Updating...
            </span>
          ) : (
            "Reset password"
          )}
        </Button>
      </form>
    </div>
  );
}
