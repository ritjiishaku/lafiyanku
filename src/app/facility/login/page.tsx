import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/app/login/login/LoginForm";

export default function FacilityLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  return (
    <Suspense>
      <FacilityLoginContent searchParams={searchParams} />
    </Suspense>
  );
}

async function FacilityLoginContent({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  const params = await searchParams;
  const facilityName = params.name
    ? decodeURIComponent(params.name)
    : undefined;

  return (
    <AuthShell variant="facility" facilityName={facilityName}>
      <LoginForm />
    </AuthShell>
  );
}
