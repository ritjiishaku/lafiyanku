````md
# File: .agents/bootstrap.md

# Version: 1.0

# Last updated: 2026-06-02

# PRD reference: CFW-PRD-001 v1.0

# Purpose: Exact step-by-step commands to go from zero to a running local dev environment.

## Prerequisites

| Requirement  | Minimum Version | Verification Command                      |
| ------------ | --------------- | ----------------------------------------- |
| Node.js      | v20.x or higher | `node --version`                          |
| npm          | v10.x or higher | `npm --version`                           |
| Git          | v2.x or higher  | `git --version`                           |
| Supabase CLI | Latest          | `supabase --version` (install if missing) |

### Install Supabase CLI (macOS/Linux)

```bash
brew install supabase/tap/supabase
```
````

### Install Supabase CLI (Windows)

```bash
npm install -g supabase
```

---

## Step 1: Create Next.js Application

```bash
# Create the project with all defaults
npx create-next-app@latest careflow --typescript --tailwind --app --eslint --src-dir --import-alias "@/*"

# Navigate into the project
cd careflow
```

---

## Step 2: Install Dependencies

### Core Dependencies

```bash
# UI components and styling
npx shadcn-ui@latest init -d
npx shadcn-ui@latest add button card input label select textarea tabs dialog alert
npx shadcn-ui@latest add form toast badge table separator skeleton

# Form handling and validation
npm install react-hook-form zod @hookform/resolvers

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# Date handling
npm install date-fns

# UUID generation
npm install uuid
npm install --save-dev @types/uuid

# Authentication (NextAuth.js)
npm install next-auth @auth/core

# Icons
npm install lucide-react

# Themes
npm install next-themes

# Utilities
npm install class-variance-authority clsx tailwind-merge
```

### Dev Dependencies

```bash
npm install --save-dev @types/node @types/react @types/react-dom
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npm install --save-dev typescript eslint prettier
```

---

## Step 3: Setup Supabase Locally

### Initialize Supabase

```bash
supabase init
```

This creates a `supabase` folder in your project root with `config.toml`.

### Start Supabase Local Stack

```bash
supabase start
```

**Expected output:**

```
Started supabase local development setup.
API URL: http://localhost:54321
DB URL: postgresql://postgres:postgres@localhost:54322/postgres
Studio URL: http://localhost:54323
```

### Copy Local Environment Variables

```bash
# Get the local anon key
supabase status
```

Copy the output values into `.env.local` (see `.agents/environment.md` for template).

---

## Step 4: Create Database Schema

### Create Migrations Folder

```bash
mkdir -p supabase/migrations
```

### Create Migration File

```bash
# Create a timestamped migration
touch supabase/migrations/$(date +%Y%m%d%H%M%S)_initial_schema.sql
```

### Run the Schema Migration

Copy the contents from `.agents/database/schema.sql` into the migration file, then:

```bash
supabase db push
```

### Run RLS Policies Migration

Create a second migration file:

```bash
touch supabase/migrations/$(date +%Y%m%d%H%M%S)_rls_policies.sql
```

Copy the contents from `.agents/database/rls-policies.sql` into this file, then:

```bash
supabase db push
```

### Seed the Database

Create a seed file:

```bash
touch supabase/seed.sql
```

Copy the contents from `.agents/database/seed.sql` into this file, then:

```bash
supabase db reset
```

---

## Step 5: Configure NextAuth.js for Supabase

### Create Auth Route

```bash
mkdir -p app/api/auth/[...nextauth]
touch app/api/auth/[...nextauth]/route.ts
```

Add the NextAuth configuration (see `.agents/api/route-map.md` for full implementation).

### Create Middleware for Session Refresh

```bash
touch middleware.ts
```

Configure middleware to refresh Supabase session (see `.agents/integrations/supabase.md` for full implementation).

---

## Step 6: Create Folder Structure

### API Routes

```bash
mkdir -p app/api/health
mkdir -p app/api/discharge
mkdir -p app/api/translation
mkdir -p app/api/audit

touch app/api/health/route.ts
touch app/api/discharge/generate/route.ts
touch app/api/discharge/[id]/route.ts
touch app/api/discharge/[id]/finalise/route.ts
touch app/api/discharge/[id]/archive/route.ts
touch app/api/discharge/[id]/export/route.ts
touch app/api/translation/request/route.ts
touch app/api/audit/[recordId]/route.ts
```

### Frontend Pages

```bash
mkdir -p app/dashboard
mkdir -p app/discharge/new
mkdir -p app/discharge/[id]
mkdir -p app/discharge/[id]/output
mkdir -p app/audit/[recordId]
mkdir -p app/auth/login
mkdir -p app/settings

touch app/page.tsx
touch app/dashboard/page.tsx
touch app/discharge/new/page.tsx
touch app/discharge/[id]/page.tsx
touch app/discharge/[id]/output/page.tsx
touch app/audit/[recordId]/page.tsx
touch app/auth/login/page.tsx
touch app/settings/page.tsx
```

### Components Library

```bash
mkdir -p src/components/forms
mkdir -p src/components/outputs
mkdir -p src/components/actions
mkdir -p src/components/layout
mkdir -p src/components/shared

touch src/components/forms/PatientInputForm.tsx
touch src/components/forms/MedicationRow.tsx
touch src/components/forms/LanguageSelector.tsx
touch src/components/outputs/ClinicalSummaryPanel.tsx
touch src/components/outputs/PatientInstructionsPanel.tsx
touch src/components/outputs/TranslationPanel.tsx
touch src/components/outputs/MissingFieldsBanner.tsx
touch src/components/outputs/FlaggedIssuesBanner.tsx
touch src/components/actions/GenerateButton.tsx
touch src/components/actions/FinaliseButton.tsx
touch src/components/actions/PrintButton.tsx
touch src/components/actions/WhatsAppShareButton.tsx
touch src/components/actions/ExportPDFButton.tsx
touch src/components/layout/AppShell.tsx
touch src/components/layout/Sidebar.tsx
touch src/components/layout/TopNav.tsx
touch src/components/layout/RoleGate.tsx
touch src/components/shared/StatusBadge.tsx
touch src/components/shared/AuditLogTable.tsx
touch src/components/shared/ConfirmModal.tsx
touch src/components/shared/OfflineBanner.tsx
touch src/components/shared/LoadingSpinner.tsx
```

### Services and Utilities

```bash
mkdir -p src/services
mkdir -p src/lib
mkdir -p src/hooks
mkdir -p src/types

touch src/services/ai-provider.ts
touch src/services/supabase-client.ts
touch src/services/supabase-server.ts
touch src/services/audit-log.ts
touch src/lib/env-validation.ts
touch src/lib/utils.ts
touch src/hooks/useOfflineDraft.ts
touch src/hooks/useRole.ts
touch src/types/schemas.ts
```

---

## Step 7: Add Design Tokens to Tailwind

Update `tailwind.config.ts` with the design system colours:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        clinicalTeal: "#0B6E6E",
        deepNavy: "#0D2B4E",
        warmAmber: "#B45309",
        slate: "#1E293B",
        coolGrey: "#64748B",
        pureWhite: "#FFFFFF",
        coolOffWhite: "#F0F4F8",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## Step 8: Add Global CSS with Plus Jakarta Sans

Update `app/globals.css`:

```css
@import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap");

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 210 40% 98%;
    --foreground: 222.2 47.4% 11.2%;
    --primary: 180 80% 24%;
    --primary-foreground: 0 0% 100%;
  }
}

@layer utilities {
  .touch-target-min {
    min-width: 44px;
    min-height: 44px;
  }
}
```

---

## Step 9: Set All Environment Variables

Create `.env.local` with all required variables (see `.agents/environment.md` for complete template).

**Critical:** Never commit `.env.local` to version control. Add to `.gitignore`:

```bash
echo ".env.local" >> .gitignore
echo ".env" >> .gitignore
```

---

## Step 10: Run the Development Server

```bash
npm run dev
```

**Expected output:**

```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Environments: .env.local
```

---

## Step 11: Verify the Setup

### Health Check

```bash
curl http://localhost:3000/api/health
```

**Expected response:**

```json
{ "status": "ok", "timestamp": "2026-06-02T12:00:00Z" }
```

### Database Connection Check

```bash
supabase status
```

Verify that all migrations have been applied and the seed data is present.

### DeepSeek API Key Test

```bash
curl -X POST https://api.deepseek.com/v1/chat/completions \
  -H "Authorization: Bearer $DEEPSEEK_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "Say hello"}],
    "max_tokens": 10
  }'
```

**Expected:** A successful response with `choices[0].message.content`.

---

## Step 12: Git Initial Commit

```bash
git init
git add .
git commit -m "chore: initial CareFlow AI setup with Next.js + Supabase + DeepSeek"
```

---

## Step 13: Create GitHub Repository and Push

```bash
# Create repository on GitHub first via web UI, then:
git remote add origin https://github.com/your-username/careflow.git
git branch -M main
git push -u origin main
```

---

## Step 14: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts:
# - Set up and deploy: Y
# - Which scope: your account
# - Link to existing project: N
# - Project name: careflow
# - Directory: ./
# - Override settings: N

# Add environment variables from .env.local
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add DEEPSEEK_API_KEY production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production

# Redeploy with env vars
vercel --prod
```

---

## Troubleshooting Common Bootstrap Issues

| Issue                                        | Solution                                                                                 |
| -------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `supabase: command not found`                | Install Supabase CLI: `brew install supabase/tap/supabase`                               |
| `Port 54322 already in use`                  | Stop other Postgres instances: `sudo lsof -i :54322` then kill process                   |
| `DeepSeek API timeout`                       | Increase `DEEPSEEK_TIMEOUT_MS` to `30000` in `.env.local`                                |
| `NextAuth.js error: NEXTAUTH_SECRET missing` | Generate secret: `openssl rand -base64 32` and add to `.env.local`                       |
| `Supabase RLS policy violation`              | Check user role in `user_profiles` table; ensure RLS policies are applied                |
| `shadcn/ui init fails`                       | Run `npx shadcn-ui@latest init` with default options (TypeScript yes, CSS variables yes) |

---

## Bootstrap Complete Checklist

- [ ] Node.js v20+ installed
- [ ] Git installed
- [ ] Supabase CLI installed
- [ ] `npm run dev` runs without errors
- [ ] `http://localhost:3000` loads the Next.js default page
- [ ] Supabase local stack is running (`supabase status`)
- [ ] All migrations applied (`supabase db push`)
- [ ] Seed data inserted (`supabase db reset`)
- [ ] Environment variables set in `.env.local`
- [ ] Health check endpoint returns 200
- [ ] GitHub repository created and code pushed
- [ ] Vercel deployment successful
- [ ] Production environment variables set in Vercel dashboard

---

## Constraints for this file

- **Never skip the environment variable validation** — the app must fail fast if variables are missing
- **Never commit `.env.local` or `.env` to version control** — add to `.gitignore` before first commit
- **Never run `supabase db push` without a backup** — use `supabase db dump` for safety
- **Never use production API keys in local development** — create separate Supabase and DeepSeek projects
- **Never assume dependencies are installed** — verify with `npm list` before proceeding
