````md
# File: .agents/environment.md

# Version: 1.0

# Last updated: 2026-06-02

# PRD reference: CFW-PRD-001 v1.0

# Purpose: Every environment variable for the entire project — exact names, where to get values, environment scope, public/secret status, and what breaks if missing.

## Environment Variable Categories

| Category   | Variables   | Scope                       |
| ---------- | ----------- | --------------------------- |
| Supabase   | 3 variables | Database + Auth             |
| DeepSeek   | 6 variables | AI Generation + Translation |
| App Config | 4 variables | Application settings        |
| Security   | 2 variables | Authentication              |

---

## Supabase Environment Variables

### `NEXT_PUBLIC_SUPABASE_URL`

| Property                   | Value                                                                      |
| -------------------------- | -------------------------------------------------------------------------- |
| **Where to get**           | Supabase dashboard → Project Settings → API → Project URL                  |
| **Environment**            | local, preview, production                                                 |
| **Public/Secret**          | Public (NEXT*PUBLIC*)                                                      |
| **What breaks if missing** | Frontend cannot connect to Supabase; all database queries fail; auth fails |

### `NEXT_PUBLIC_SUPABASE_ANON_KEY`

| Property                   | Value                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------- |
| **Where to get**           | Supabase dashboard → Project Settings → API → anon public key                         |
| **Environment**            | local, preview, production                                                            |
| **Public/Secret**          | Public (NEXT*PUBLIC*) — this key is safe for browser use because RLS restricts access |
| **What breaks if missing** | Client-side Supabase queries fail; auth login/registration fails                      |

### `SUPABASE_SERVICE_ROLE_KEY`

| Property                   | Value                                                                                    |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| **Where to get**           | Supabase dashboard → Project Settings → API → service_role key                           |
| **Environment**            | local, preview, production                                                               |
| **Public/Secret**          | **Secret** — never expose to browser                                                     |
| **What breaks if missing** | API routes cannot bypass RLS to write AuditLog entries; generation and finalisation fail |
| **Security note**          | Store in Vercel environment variables only; never commit to repository                   |

---

## DeepSeek Environment Variables

### `DEEPSEEK_API_KEY`

| Property                   | Value                                                                       |
| -------------------------- | --------------------------------------------------------------------------- |
| **Where to get**           | DeepSeek console → API Keys → Create new key                                |
| **Environment**            | local, preview, production                                                  |
| **Public/Secret**          | **Secret** — never expose to browser                                        |
| **What breaks if missing** | AI generation fails completely; translation fails completely                |
| **Free credits**           | DeepSeek gives 5 million free tokens on signup (approx 500-1000 discharges) |

### `DEEPSEEK_API_URL`

| Property                   | Value                                                           |
| -------------------------- | --------------------------------------------------------------- |
| **Where to get**           | Hardcoded — DeepSeek documentation                              |
| **Environment**            | local, preview, production                                      |
| **Public/Secret**          | Public (NEXT*PUBLIC* optional — used only in server API routes) |
| **Value**                  | `https://api.deepseek.com/v1/chat/completions`                  |
| **What breaks if missing** | API route cannot call DeepSeek; generation fails                |

### `DEEPSEEK_MODEL`

| Property                   | Value                                                       |
| -------------------------- | ----------------------------------------------------------- |
| **Where to get**           | Hardcoded — DeepSeek documentation                          |
| **Environment**            | local, preview, production                                  |
| **Public/Secret**          | Public                                                      |
| **Value**                  | `deepseek-chat` (default) or `deepseek-reasoner` (fallback) |
| **What breaks if missing** | Uses default; no breakage                                   |

### `DEEPSEEK_MAX_TOKENS`

| Property                   | Value                                     |
| -------------------------- | ----------------------------------------- |
| **Where to get**           | Configuration                             |
| **Environment**            | local, preview, production                |
| **Public/Secret**          | Public                                    |
| **Value**                  | `4000`                                    |
| **What breaks if missing** | Uses DeepSeek default (4096); no breakage |

### `DEEPSEEK_TEMPERATURE`

| Property                   | Value                                                                             |
| -------------------------- | --------------------------------------------------------------------------------- |
| **Where to get**           | Configuration                                                                     |
| **Environment**            | local, preview, production                                                        |
| **Public/Secret**          | Public                                                                            |
| **Value**                  | `0.3`                                                                             |
| **What breaks if missing** | Uses DeepSeek default (1.0) — higher hallucination risk; clinical safety degraded |

### `DEEPSEEK_TIMEOUT_MS`

| Property                   | Value                                                   |
| -------------------------- | ------------------------------------------------------- |
| **Where to get**           | Configuration                                           |
| **Environment**            | local, preview, production                              |
| **Public/Secret**          | Public                                                  |
| **Value**                  | `25000` (25 seconds)                                    |
| **What breaks if missing** | Request may hang indefinitely; user experience degraded |

---

## App Configuration Variables

### `NEXT_PUBLIC_APP_URL`

| Property                   | Value                                                                                  |
| -------------------------- | -------------------------------------------------------------------------------------- |
| **Where to get**           | Deployment URL                                                                         |
| **Environment**            | local: `http://localhost:3000`; preview: Vercel preview URL; production: custom domain |
| **Public/Secret**          | Public (NEXT*PUBLIC*)                                                                  |
| **What breaks if missing** | OAuth callbacks fail; email links broken; WhatsApp share metadata missing              |

### `CFW_AI_PROMPT_VERSION`

| Property                   | Value                                                                     |
| -------------------------- | ------------------------------------------------------------------------- |
| **Where to get**           | Configuration (set during deployment)                                     |
| **Environment**            | local, preview, production                                                |
| **Public/Secret**          | Public (server-side only)                                                 |
| **Value**                  | `v2.0`                                                                    |
| **What breaks if missing** | DischargeRecord.promptVersion stored as null; compliance audit incomplete |

### `CFW_AI_MODEL_VERSION`

| Property                   | Value                                                                    |
| -------------------------- | ------------------------------------------------------------------------ |
| **Where to get**           | Configuration (set during deployment)                                    |
| **Environment**            | local, preview, production                                               |
| **Public/Secret**          | Public (server-side only)                                                |
| **Value**                  | `deepseek-chat`                                                          |
| **What breaks if missing** | DischargeRecord.modelVersion stored as null; compliance audit incomplete |

### `CFW_ENVIRONMENT`

| Property                   | Value                                                              |
| -------------------------- | ------------------------------------------------------------------ |
| **Where to get**           | Vercel automatically sets; manual for local                        |
| **Environment**            | local: `development`; preview: `preview`; production: `production` |
| **Public/Secret**          | Public (server-side only)                                          |
| **What breaks if missing** | Logging and error handling behave incorrectly                      |

---

## Security Variables

### `NEXTAUTH_SECRET`

| Property                   | Value                                                                |
| -------------------------- | -------------------------------------------------------------------- |
| **Where to get**           | Generate with `openssl rand -base64 32`                              |
| **Environment**            | local, preview, production                                           |
| **Public/Secret**          | **Secret** — never expose to browser                                 |
| **What breaks if missing** | NextAuth.js JWT signing fails; sessions invalid; users cannot log in |

### `NEXTAUTH_URL`

| Property                   | Value                                                                                  |
| -------------------------- | -------------------------------------------------------------------------------------- |
| **Where to get**           | Deployment URL                                                                         |
| **Environment**            | local: `http://localhost:3000`; preview: Vercel preview URL; production: custom domain |
| **Public/Secret**          | **Secret** (server-side only)                                                          |
| **What breaks if missing** | OAuth redirects fail; users stuck on login page                                        |

---

## Complete `.env.local` Template

Copy this to `.env.local` for local development:

```bash
# ============================================
# CareFlow — Local Development Environment
# ============================================

# Supabase (get from https://supabase.com/dashboard/project/_/settings/api)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# DeepSeek (get from https://platform.deepseek.com/api_keys)
DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_MAX_TOKENS=4000
DEEPSEEK_TEMPERATURE=0.3
DEEPSEEK_TIMEOUT_MS=25000

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
CFW_AI_PROMPT_VERSION=v2.0
CFW_AI_MODEL_VERSION=deepseek-chat
CFW_ENVIRONMENT=development

# Security (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=generate-a-random-secret-here-minimum-32-chars
NEXTAUTH_URL=http://localhost:3000
```
````

---

## Environment Variable Validation (Startup Check)

The application must validate required variables on startup. Create `src/lib/env-validation.ts`:

```ts
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
  const missingPublic = requiredPublicVars.filter((v) => !process.env[v]);

  if (missingServer.length > 0) {
    throw new Error(`Missing server env vars: ${missingServer.join(", ")}`);
  }
  if (missingPublic.length > 0) {
    throw new Error(`Missing public env vars: ${missingPublic.join(", ")}`);
  }
}
```

Call `validateEnv()` in `instrumentation.ts` or `middleware.ts` to fail fast on startup.

---

## Vercel Environment Variable Setup (Production)

When deploying to Vercel, set these variables in the dashboard:

| Variable                        | Environment                                 | Required |
| ------------------------------- | ------------------------------------------- | -------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Production + Preview + Development          | Yes      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production + Preview + Development          | Yes      |
| `SUPABASE_SERVICE_ROLE_KEY`     | Production + Preview + Development          | Yes      |
| `DEEPSEEK_API_KEY`              | Production + Preview + Development          | Yes      |
| `DEEPSEEK_API_URL`              | Production + Preview + Development          | Yes      |
| `DEEPSEEK_MODEL`                | Production + Preview + Development          | No       |
| `DEEPSEEK_MAX_TOKENS`           | Production + Preview + Development          | No       |
| `DEEPSEEK_TEMPERATURE`          | Production + Preview + Development          | No       |
| `DEEPSEEK_TIMEOUT_MS`           | Production + Preview + Development          | No       |
| `NEXT_PUBLIC_APP_URL`           | Production (custom domain) + Preview (auto) | Yes      |
| `CFW_AI_PROMPT_VERSION`         | Production + Preview + Development          | Yes      |
| `CFW_AI_MODEL_VERSION`          | Production + Preview + Development          | Yes      |
| `CFW_ENVIRONMENT`               | Set per environment automatically           | No       |
| `NEXTAUTH_SECRET`               | Production + Preview + Development          | Yes      |
| `NEXTAUTH_URL`                  | Production (custom domain) + Preview (auto) | Yes      |

---

## Constraints for this file

- **Never commit `.env` or `.env.local` to version control** — add to `.gitignore`
- **Never expose `SUPABASE_SERVICE_ROLE_KEY` or `DEEPSEEK_API_KEY` to the browser** — use only in server API routes
- **Never hardcode secrets in source code** — always use environment variables
- **Never skip validation** — app must fail clearly if required variables are missing
- **Never use production keys in local development** — create separate Supabase and DeepSeek projects for dev
