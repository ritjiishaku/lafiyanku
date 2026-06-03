"use client";

import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-cool-off-white p-4">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
