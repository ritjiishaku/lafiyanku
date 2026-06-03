import Link from "next/link";

export default async function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cool-off-white px-4">
      <div className="w-full max-w-lg text-center">
        <h1 className="text-4xl font-bold text-deep-navy sm:text-5xl">
          CareFlow <span className="text-clinical-teal">AI</span>
        </h1>
        <p className="mt-3 text-lg text-cool-grey">
          Clinical Discharge Documentation for Nigerian Hospitals
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/auth/login"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-clinical-teal px-8 text-sm font-medium text-pure-white transition-colors hover:bg-clinical-teal/90"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-cool-grey/30 px-8 text-sm font-medium text-slate transition-colors hover:bg-cool-off-white"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
