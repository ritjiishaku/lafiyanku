# CareFlow

**AI-powered clinical discharge documentation for Nigerian hospitals.**

CareFlow converts structured clinical input into two outputs simultaneously — a professional clinical discharge summary (Mode 1) and plain-language patient-friendly instructions (Mode 2) — with optional translation into Hausa, Yoruba, or Igbo.

> ⚕️ Every generated record is draft-first, clinician-reviewed, and audit-logged. The AI assists documentation — it never replaces clinical judgement.

---

## Problem

Clinicians in Nigeria discharge patients under time pressure and produce incomplete summaries in clinical language that patients — many of whom speak Hausa, Yoruba, or Igbo as their first language — cannot read or understand.

## Solution

CareFlow solves this by providing a structured form that clinicians fill in, then:

1. **Mode 1 — Clinical Discharge Summary**: A professional, structured document for hospital records
2. **Mode 2 — Patient-Friendly Instructions**: Plain-language explanation the patient or caregiver can act on
3. **Translation**: Mode 2 translated into Hausa, Yoruba, or Igbo on request

---

## Features

### Core

| Feature | Status |
|---------|--------|
| Structured PatientInput form with Zod validation | ✅ |
| AI-generated Mode 1 (Clinical Discharge Summary) | ✅ |
| AI-generated Mode 2 (Patient-Friendly Instructions) | ✅ |
| Language translation (Hausa / Yoruba / Igbo) | ✅ |
| Side-by-side output viewer (tabs on mobile) | ✅ |
| Inline editing before finalisation | ✅ |
| Finalise / Archive lifecycle | ✅ |
| Print-optimised patient handout | ✅ |
| WhatsApp share (deep link / clipboard) | ✅ |
| PDF export | ✅ |
| Role-based access (Doctor / Nurse / Admin) | ✅ |
| Audit log (immutable, paginated) | ✅ |
| Offline draft caching | ✅ |
| Rate-limited login (5 attempts / 10 min) | ✅ |

### Guardrails

- Never invents clinical information not in the input
- Never generates diagnoses not provided by the clinician
- Never prescribes new medications or alters existing doses
- Always includes Red Flag Warnings in Mode 1
- Always includes Discharged By in Mode 1
- All outputs are drafts until a Doctor finalises them

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js 16 (App Router)               │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │  Input Form  │  │  AI Engine   │  │  Output/Delivery│  │
│  │  (Patient)   │→ │  (DeepSeek)  │→ │  (View/Print/  │  │
│  │              │  │              │  │   Share/Export)│  │
│  └─────────────┘  └──────────────┘  └────────────────┘  │
│         │                │                  │            │
│         ▼                ▼                  ▼            │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              Supabase (PostgreSQL)                   │ │
│  │  patient_inputs → discharge_records → audit_logs    │ │
│  │               translation_requests                   │ │
│  └─────────────────────────────────────────────────────┘ │
│         │                                                │
│  ┌──────┴──────┐  ┌──────────┐  ┌──────────────────┐    │
│  │ NextAuth v5 │  │ RoleGate │  │ RLS (Row-Level   │    │
│  │ (JWT)       │  │ (RBAC)   │  │  Security)       │    │
│  └─────────────┘  └──────────┘  └──────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Three-Layer Architecture

| Layer | Description |
|-------|-------------|
| **Input** | Structured PatientInput form (19 fields, Zod validation, offline caching) |
| **AI Generation** | DeepSeek API with system prompt v2.0, input/output guardrails, timeout handling |
| **Output** | Side-by-side viewer, inline editing, print, WhatsApp share, PDF export, translation |

### Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16.2.7 (App Router) |
| Language | TypeScript |
| UI | shadcn/ui v4 + Tailwind CSS v4 |
| Design | Plus Jakarta Sans, M3 tokens, WCAG AA min contrast |
| Auth | NextAuth v5 (Credentials) + Supabase Auth |
| Database | Supabase (PostgreSQL 15) with RLS |
| AI | DeepSeek Chat API |
| Testing | Vitest + React Testing Library |
| Package | npm |

---

## Roles & Access

| Action | Doctor | Nurse | Admin |
|--------|--------|-------|-------|
| Submit form / trigger AI | ✅ | ✅ | ❌ |
| View clinical summary | ✅ | ✅ | ❌ |
| View patient-friendly output | ✅ | ✅ | ✅ |
| Edit generated output | ✅ | ✅ | ❌ |
| Finalise a discharge record | ✅ | ❌ | ❌ |
| Archive a record | ✅ | ❌ | ✅ |
| Export or print | ✅ | ✅ | ❌ |
| View audit log | ❌ | ❌ | ✅ |

Role-based access is enforced **server-side** on every API route via NextAuth session — never client-side only.

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Docker Desktop (for local Supabase)
- DeepSeek API key

### Installation

```bash
# Clone the repository
git clone https://github.com/ritjiishaku/careflow.git
cd careflow

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your keys (see below)

# Start Supabase locally
supabase start
supabase db reset  # applies migrations + seed data

# Run the development server
npm run dev
```

### Environment Variables

Create `.env.local` with these variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key-from-supabase-start>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# DeepSeek AI
DEEPSEEK_API_KEY=sk-your-key-here
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_MAX_TOKENS=4000
DEEPSEEK_TEMPERATURE=0.3
DEEPSEEK_TIMEOUT_MS=25000

# NextAuth
AUTH_SECRET=<generated-hex-string>
NEXTAUTH_URL=http://localhost:3000

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
CFW_AI_PROMPT_VERSION=v2.0
CFW_AI_MODEL_VERSION=deepseek-chat
```

### Seed Users

After running `supabase db reset`, the following accounts are available:

| Email | Password | Role |
|-------|----------|------|
| `dr.emeka@careflow.dev` | `CareFlow@2026` | Doctor |
| `fatima.bello@careflow.dev` | `CareFlow@2026` | Nurse |
| `chidi.okonkwo@careflow.dev` | `CareFlow@2026` | Admin |

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts    # NextAuth handler
│   │   ├── audit/[recordId]/route.ts      # Audit log API (Admin)
│   │   ├── discharge/
│   │   │   ├── route.ts                   # List records
│   │   │   ├── [id]/route.ts              # GET/PUT record
│   │   │   ├── [id]/finalise/route.ts     # Finalise (Doctor)
│   │   │   ├── [id]/archive/route.ts      # Archive (Doctor/Admin)
│   │   │   ├── [id]/export/route.ts       # Export data
│   │   │   └── generate/route.ts          # AI generation
│   │   ├── health/route.ts                # Health check
│   │   └── translation/request/route.ts   # Translation API
│   ├── audit/[recordId]/page.tsx          # Audit log page
│   ├── auth/login/page.tsx                # Login page
│   ├── dashboard/page.tsx                 # Dashboard
│   ├── discharge/
│   │   ├── new/page.tsx                   # New discharge form
│   │   ├── [id]/page.tsx                  # Record detail
│   │   └── [id]/output/page.tsx           # Output viewer
│   ├── settings/page.tsx                  # Settings
│   ├── layout.tsx                         # Root layout
│   └── page.tsx                           # Landing page
├── components/
│   ├── forms/
│   │   ├── PatientInputForm.tsx           # 19-field form
│   │   ├── MedicationRow.tsx              # Medication sub-form
│   │   └── LanguageSelector.tsx           # Language picker
│   ├── layout/
│   │   ├── AppShell.tsx                   # App shell layout
│   │   ├── Sidebar.tsx                    # Role-aware sidebar
│   │   ├── TopNav.tsx                     # Top navigation
│   │   └── RoleGate.tsx                   # Role-based gate
│   ├── outputs/
│   │   ├── ClinicalSummaryPanel.tsx       # Mode 1 display
│   │   ├── PatientInstructionsPanel.tsx   # Mode 2 display
│   │   ├── TranslationPanel.tsx           # Translation display
│   │   ├── MissingFieldsBanner.tsx        # Missing fields warning
│   │   └── FlaggedIssuesBanner.tsx        # Issues warning
│   ├── shared/
│   │   ├── StatusBadge.tsx                # Draft/Finalised/Archived
│   │   ├── AuditLogTable.tsx              # Paginated audit table
│   │   ├── ConfirmModal.tsx               # Confirmation dialog
│   │   ├── PrintButton.tsx                # Print-optimised HTML
│   │   ├── WhatsAppShareButton.tsx        # WhatsApp share
│   │   ├── OfflineBanner.tsx              # Offline indicator
│   │   └── LoadingSpinner.tsx             # Loading indicator
│   └── ui/                               # shadcn/ui components
├── hooks/
│   ├── useOfflineDraft.ts                 # Offline form caching
│   └── useRole.ts                         # Session role reader
├── lib/
│   ├── auth.ts                            # NextAuth config
│   ├── env-validation.ts                  # Env var checker
│   ├── error-codes.ts                     # 22 error codes
│   ├── require-role.ts                    # Role check helper
│   └── utils.ts                           # Utilities
├── services/
│   ├── ai-provider.ts                     # DeepSeek integration
│   ├── audit-log.ts                       # Audit log writer/reader
│   ├── supabase-client.ts                 # Browser Supabase client
│   └── supabase-server.ts                 # Server Supabase client
├── types/
│   └── schemas.ts                         # TypeScript interfaces
├── middleware.ts                          # Route protection
└── test-setup.ts                          # Vitest setup
supabase/
├── migrations/
│   ├── 20260602000001_initial_schema.sql  # 6 tables + enums
│   └── 20260602000002_rls_policies.sql    # RLS policies
└── seed.sql                               # Seed data
```

---

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/[...nextauth]` | - | NextAuth handler |
| GET | `/api/health` | - | Health check |
| GET | `/api/discharge` | Any | List records (search, filter, paginate) |
| POST | `/api/discharge/generate` | Doctor/Nurse | Generate discharge from input |
| GET | `/api/discharge/[id]` | Any | Get single record |
| PUT | `/api/discharge/[id]` | Doctor/Nurse | Edit record |
| POST | `/api/discharge/[id]/finalise` | Doctor | Finalise record |
| POST | `/api/discharge/[id]/archive` | Doctor/Admin | Archive record |
| GET | `/api/discharge/[id]/export` | Doctor/Nurse | Export record data |
| POST | `/api/translation/request` | Doctor/Nurse | Request translation |
| GET | `/api/audit/[recordId]` | Admin | Get audit log entries |

---

## Database Schema

Six tables with Row-Level Security:

| Table | Purpose |
|-------|---------|
| `facilities` | Hospital/clinic registry |
| `user_profiles` | User roles and facility assignment |
| `patient_inputs` | Clinician-submitted form data |
| `discharge_records` | AI-generated output + metadata |
| `translation_requests` | Translation job tracking |
| `audit_logs` | Immutable action log (NDPR 2019) |

Key constraints:
- `discharge_date >= admission_date` (enforced at DB level)
- `audit_logs.changes_diff` only for `edit` actions
- `translation_requests.completed_at` required when `output_text` is present
- Foreign keys with `ON DELETE RESTRICT` on clinical data

---

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Build check
npm run build
```

Test coverage (28 tests across 4 files):

| File | Focus |
|------|-------|
| `ai-provider.test.ts` | Input validation, output validation, section completeness |
| `PatientInputForm.test.tsx` | Zod schema: required fields, age bounds, date ordering, medications |
| `RoleGate.test.tsx` | Role-based rendering, fallback, undefined role |
| `StatusBadge.test.tsx` | Draft/finalised/archived styling |

---

## Deployment

### Vercel

```json
{
  "functions": {
    "app/api/discharge/generate/route.ts": { "maxDuration": 30 },
    "app/api/translation/request/route.ts": { "maxDuration": 30 },
    "app/api/**/*.ts": { "maxDuration": 10 }
  }
}
```

Set all 15 environment variables in Vercel dashboard across 3 environments (production, preview, development).

### Domain

- Custom domain: e.g. `careflow.ng` or `app.careflow.health`
- Auto SSL via Let's Encrypt (Vercel default)

---

## Compliance

| Standard | Requirement | Implementation |
|----------|-------------|----------------|
| NDPR 2019 (Nigeria) | Lawful processing, data residency, breach notification | Full audit log, consent on login, IP logging |
| FMOH Patient Record Standards | Dual dates, MDCN licence, standardised summary | `admissionDate` + `dischargeDate`, `clinicianLicenseNo`, structured Mode 1 |
| WHO International Patient Summary | Structured meds, follow-up, red flags | Medication table, follow-up section, Red Flag Warnings |
| MDCN Guidelines | Signed by licensed clinician | Doctor-only finalise, `dischargedBy` on every record |
| Clinical Safety | AI is draft until Doctor finalises | All records start `draft`, status badge, finalise workflow |

---

## 7-Day Implementation Plan

| Day | Focus |
|-----|-------|
| 1 | Bootstrap + Scaffold — Next.js, Supabase, schemas, error codes, folder structure |
| 2 | Data Layer + Auth — Supabase clients, audit service, NextAuth v5, middleware, login |
| 3 | PatientInput Form + AI Engine — 19-field form, DeepSeek integration, guardrails |
| 4 | Output Display + Record Lifecycle — Viewer, inline editing, finalise/archive |
| 5 | Translation + Export/Print — Translate button, print HTML, WhatsApp share, PDF |
| 6 | Audit + Pages/Navigation — Audit log table, dashboard, settings, sidebar |
| 7 | Testing + Deployment + Bug Fixes — 28 tests, bug audit (26 fixes), Vercel config |

---

## License

Internal use. Not for clinical distribution without verification.

---

*CareFlow — Built for Nigerian hospitals, clinics, and telemedicine providers.*
