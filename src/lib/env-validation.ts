const requiredServerVars = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "DEEPSEEK_API_KEY",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
];

const requiredPublicVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_APP_URL",
];

export function validateEnv() {
  const missingServer = requiredServerVars.filter((v) => !process.env[v]);
  const missingPublic = requiredPublicVars.filter(
    (v) => !process.env["NEXT_PUBLIC_" + v.replace("NEXT_PUBLIC_", "")],
  );

  const actualPublic = requiredPublicVars.filter((v) => !process.env[v]);

  if (missingServer.length > 0) {
    throw new Error(`Missing server env vars: ${missingServer.join(", ")}`);
  }
  if (actualPublic.length > 0) {
    throw new Error(`Missing public env vars: ${actualPublic.join(", ")}`);
  }
}
