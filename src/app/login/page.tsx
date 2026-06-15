"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { LoginForm } from "./login/LoginForm";
import { ForgotPasswordForm } from "./forgot-password/ForgotPasswordForm";
import { ResetPasswordForm } from "./forgot-password/ResetPasswordForm";

type AuthView = "login" | "forgot-password" | "reset-password";

export default function AuthPage() {
  const [view, setView] = useState<AuthView>("login");
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (session?.user) {
      const user = session.user as { role?: string; mustChangePassword?: boolean };
      if (user.mustChangePassword) {
        router.push(user.role === "admin" ? "/onboarding/admin" : "/onboarding/clinician");
      } else if (user.role === "admin" && !localStorage.getItem("lafiyanku-admin-onboarded")) {
        router.push("/onboarding/admin");
      } else {
        router.push(user.role === "admin" ? "/admin" : "/dashboard");
      }
    }
  }, [session, status, router]);

  if (status === "loading" || session?.user) {
    return (
      <AuthShell>
        <div className="flex min-h-[200px] items-center justify-center">
          <LoadingSpinner />
        </div>
      </AuthShell>
    );
  }

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
