"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LoginForm } from "./login/LoginForm";
import { SignUpForm } from "./signup/SignUpForm";
import { ForgotPasswordForm } from "./forgot-password/ForgotPasswordForm";
import { ResetPasswordForm } from "./forgot-password/ResetPasswordForm";

type AuthView = "login" | "signup" | "forgot-password" | "reset-password";

function AuthContent() {
  const searchParams = useSearchParams();
  const initialView = (searchParams.get("view") as AuthView) || "login";
  const [view, setView] = useState<AuthView>(initialView);

  return (
    <div className="flex h-dvh items-center justify-center bg-gradient-to-br from-clinical-teal/5 via-cool-off-white to-cool-off-white px-4 py-8" style={{ paddingBottom: "env(safe-area-inset-bottom, 1rem)" }}>
      <div className="w-full max-w-md max-h-full overflow-y-auto">
        {view === "login" && (
          <LoginForm
            onSwitchToSignup={() => setView("signup")}
            onSwitchToForgotPassword={() => setView("forgot-password")}
          />
        )}
        {view === "signup" && (
          <SignUpForm onSwitchToLogin={() => setView("login")} />
        )}
        {view === "forgot-password" && (
          <ForgotPasswordForm onSwitchToLogin={() => setView("login")} />
        )}
        {view === "reset-password" && (
          <ResetPasswordForm onSwitchToLogin={() => setView("login")} />
        )}
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="flex min-h-dvh items-center justify-center bg-cool-off-white p-4">Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}
