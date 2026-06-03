"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global UI Error captured:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cool-off-white p-6 text-center space-y-6">
      <div className="rounded-full bg-red-100 p-6 text-red-600">
        ⚠
      </div>
      <h1 className="text-3xl font-extrabold text-deep-navy">Something went wrong</h1>
      <p className="text-slate max-w-md">
        An unexpected error occurred in the application interface. No patient data has been compromised.
      </p>
      <Button
        onClick={() => reset()}
        className="bg-clinical-teal hover:bg-clinical-teal/90 text-white px-6 py-3 rounded-lg"
      >
        Try Again
      </Button>
    </div>
  );
}
