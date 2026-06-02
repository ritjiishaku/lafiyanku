import { validateEnv } from "@/lib/env-validation";

export function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      validateEnv();
    } catch (err) {
      console.error("[CareFlow] Environment validation failed:", err);
      process.exit(1);
    }
  }
}
