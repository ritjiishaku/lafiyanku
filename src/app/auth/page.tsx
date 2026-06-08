"use client";

import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "./login/LoginForm";
import { ForgotPasswordForm } from "./forgot-password/ForgotPasswordForm";
import { ResetPasswordForm } from "./forgot-password/ResetPasswordForm";

type AuthView = "login" | "forgot-password" | "reset-password";

export default function AuthPage() {
  const [view, setView] = useState<AuthView>("login");

  return (
    <AuthShell>
      {view === "login" && (
        <LoginForm onSwitchToForgotPassword={() => setView("forgot-password")} />
      )}
      {view === "forgot-password" && (
        <ForgotPasswordForm onSwitchToLogin={() => setView("login")} />
      )}
      {view === "reset-password" && (
        <ResetPasswordForm />
      )}
    </AuthShell>
  );
}
