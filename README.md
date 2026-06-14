# Lafiyanku

**AI-powered clinical discharge documentation for Nigerian hospitals.**

Lafiyanku converts structured clinical input into two outputs simultaneously — a professional clinical discharge summary (Mode 1) and plain-language patient-friendly instructions (Mode 2) — with optional translation into Hausa, Yoruba, or Igbo.

> ⚕️ Every generated record is draft-first, clinician-reviewed, and audit-logged. The AI assists documentation — it never replaces clinical judgement.

---

## Problem

Clinicians in Nigeria discharge patients under time pressure and produce incomplete summaries in clinical language that patients — many of whom speak Hausa, Yoruba, or Igbo as their first language — cannot read or understand.

## Solution

Lafiyanku solves this by providing a structured form that clinicians fill in, then:

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
| Server-side draft persistence | ✅ |
| Rate-limited login (5 attempts / 10 min) | ✅ |
| Supabase-backed rate limiting (all endpoints) | ✅ |
| Bundle-optimised lazy-loaded form | ✅ |
| PDF export (@react-pdf/renderer) | ✅ |
| FHIR conversion endpoint | ✅ |
| Unarchive action | ✅ |

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
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 16 (App Router)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Input Form   │  │  AI Engine   │  │  Output/Delivery  │   │
│  │  (Patient)    │→ │  (DeepSeek)  │→ │  (View/Print/    │   │
│  │  + Drafts     │  │              │  │   Share/Export/  │   │
│  │               │  │              │  │   PDF)           │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
│         │                │                  │                │
│         ▼                ▼                  ▼                │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Supabase (PostgreSQL)                       │ │
│  │  patient_inputs → discharge_records → audit_logs       │ │
│  │  translation_requests → rate_limits → form_drafts      │ │
│  └─────────────────────────────────────────────────────────┘ │
│         │                                                    │
│  ┌──────┴──────┐  ┌──────────┐  ┌──────────────────────┐    │
│  │ proxy.ts    │  │ RoleGate │  │ RLS (Row-Level        │    │
│  │ (middleware)│  │ (RBAC)   │  │  Security)            │    │
│  └─────────────┘  └──────────┘  └──────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
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
git clone https://github.com/ritjiishaku/lafiyanku.git
cd lafiyanku

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
AUTH_TRUST_HOST=true

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
CFW_AI_PROMPT_VERSION=v2.0
CFW_AI_MODEL_VERSION=deepseek-chat
```

### Seed Users

After running `supabase db reset`, the following accounts are available:

| Email | Password | Role |
|-------|----------|------|
| `dr.emeka@lafiyanku.dev` | `Lafiyanku@2026` | Doctor |
| `fatima.bello@lafiyanku.dev` | `Lafiyanku@2026` | Nurse |
| `chidi.okonkwo@lafiyanku.dev` | `Lafiyanku@2026` | Admin |

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   ├── clinicians/               # Clinician management (Admin)
│   │   │   ├── compliance/               # Compliance dashboard (Admin)
│   │   │   └── demo-requests/            # Demo request list (Admin)
│   │   ├── audit/[recordId]/route.ts     # Audit log API (Admin)
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts    # NextAuth handler
│   │   │   └── forgot-password/route.ts  # Password reset
│   │   ├── contact/demo-request/route.ts # Public demo request
│   │   ├── dashboard/metrics/route.ts    # Dashboard metrics
│   │   ├── demo/generate/route.ts        # Demo AI generation
│   │   ├── discharge/
│   │   │   ├── route.ts                  # List records
│   │   │   ├── [id]/route.ts             # GET/PUT record
│   │   │   ├── [id]/archive/route.ts     # Archive (Doctor/Admin)
│   │   │   ├── [id]/export/route.ts      # Export data (JSON/PDF)
│   │   │   ├── [id]/finalise/route.ts    # Finalise (Doctor)
│   │   │   ├── [id]/unarchive/route.ts   # Unarchive (Doctor/Admin)
│   │   │   ├── draft/route.ts            # Server-side draft persistence
│   │   │   └── generate/route.ts         # AI generation
│   │   ├── facilities/                   # Facility registry
│   │   ├── fhir/convert/route.ts         # FHIR conversion
│   │   ├── health/route.ts               # Health check
│   │   └── translation/request/route.ts  # Translation API
│   ├── admin/                            # Admin pages
│   ├── audit/                            # Audit log pages
│   ├── auth/
│   │   ├── page.tsx                      # Login page
│   │   └── login/LoginForm.tsx           # Login form component
│   ├── contact/                          # Contact/demo page
│   ├── dashboard/
│   │   ├── NewDischargeView.tsx           # Lazy-loaded form wrapper
│   │   ├── DischargeOutputView.tsx        # Discharge output viewer
│   │   ├── RecordList.tsx                 # Record list/tiles
│   │   └── page.tsx                       # Dashboard page
│   ├── discharge/[id]/page.tsx            # Record detail
│   ├── settings/page.tsx                  # Settings
│   ├── layout.tsx                         # Root layout
│   └── page.tsx                           # Landing page
├── components/
│   ├── forms/
│   │   ├── PatientInputForm.tsx           # 19-field form (lazy-loaded)
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
│   ├── pdf/
│   │   └── DischargePdf.tsx              # @react-pdf/renderer doc
│   ├── shared/
│   │   ├── StatusBadge.tsx                # Draft/Finalised/Archived
│   │   ├── AuditLogTable.tsx              # Paginated audit table
│   │   ├── ConfirmModal.tsx               # Confirmation dialog
│   │   ├── PrintButton.tsx                # Print-optimised HTML
│   │   ├── WhatsAppShareButton.tsx        # WhatsApp share
│   │   ├── OfflineBanner.tsx              # Offline indicator
│   │   └── LoadingSpinner.tsx             # Loading indicator
│   └── ui/                               # shadcn/ui components
├── lib/
│   ├── auth.ts                            # NextAuth config (lazy Supabase)
│   ├── env-validation.ts                  # Env var checker
│   ├── error-codes.ts                     # 18 error codes
│   ├── require-role.ts                    # Role check helper
│   └── utils.ts                           # Utilities
├── services/
│   ├── ai-provider.ts                     # DeepSeek integration
│   ├── audit-log.ts                       # Audit log writer/reader
│   ├── supabase-client.ts                 # Browser Supabase client
│   └── supabase-server.ts                 # Server Supabase client
├── types/
│   ├── schemas.ts                         # TS interfaces + enums
│   └── database.ts                        # Generated Supabase types
├── proxy.ts                               # Auth redirect middleware
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
| GET | `/api/discharge/draft` | Doctor/Nurse | Get saved draft |
| POST | `/api/discharge/draft` | Doctor/Nurse | Save draft |
| DELETE | `/api/discharge/draft` | Doctor/Nurse | Clear draft |
| GET | `/api/discharge/[id]` | Any | Get single record |
| PUT | `/api/discharge/[id]` | Doctor/Nurse | Edit record |
| POST | `/api/discharge/[id]/finalise` | Doctor | Finalise record |
| POST | `/api/discharge/[id]/archive` | Doctor/Admin | Archive record |
| POST | `/api/discharge/[id]/unarchive` | Doctor/Admin | Unarchive record |
| GET | `/api/discharge/[id]/export` | Doctor/Nurse | Export record (JSON/PDF) |
| POST | `/api/translation/request` | Doctor/Nurse | Request translation |
| GET | `/api/audit/[recordId]` | Admin | Get audit log entries |
| GET | `/api/admin/clinicians` | Admin | List clinicians |
| POST | `/api/admin/clinicians` | Admin | Add clinician |
| DELETE | `/api/admin/clinicians/[id]` | Admin | Remove clinician |
| GET | `/api/admin/compliance` | Admin | Compliance report |
| GET | `/api/admin/demo-requests` | Admin | List demo requests |
| POST | `/api/facilities/register` | - | Register facility |
| POST | `/api/fhir/convert` | Any | Convert to FHIR format |
| GET | `/api/dashboard/metrics` | Any | Dashboard metrics |

---

## Database Schema

Eight tables with Row-Level Security:

| Table | Purpose |
|-------|---------|
| `facilities` | Hospital/clinic registry |
| `user_profiles` | User roles and facility assignment |
| `patient_inputs` | Clinician-submitted form data |
| `discharge_records` | AI-generated output + metadata |
| `translation_requests` | Translation job tracking |
| `audit_logs` | Immutable action log (NDPR 2019) |
| `rate_limits` | Distributed rate limiting (replaces in-memory maps) |
| `form_drafts` | Server-side form draft persistence per user |

Key constraints:
- `discharge_date >= admission_date` (enforced at DB level)
- `audit_logs.changes_diff` only for `edit` actions
- `translation_requests.completed_at` required when `output_text` is present
- Foreign keys with `ON DELETE RESTRICT` on clinical data
- Every sensitive API route is auth-guarded server-side; role check never relies on client

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

Test coverage (53 tests across 15 files):

| File | Focus |
|------|-------|
| `ai-provider.test.ts` | Input validation, output validation, section completeness |
| `PatientInputForm.test.tsx` | Zod schema: required fields, age bounds, date ordering, medications |
| `RoleGate.test.tsx` | Role-based rendering, fallback, undefined role |
| `StatusBadge.test.tsx` | Draft/finalised/archived styling |
| `ClinicianManagement.test.tsx` | Admin clinician CRUD |
| `ContactPage.test.tsx` | Contact form validation + submission |
| `auth.test.ts` | Auth config, rate limiting, password hashing |
| `audit-log.test.ts` | Audit log write/read/pagination |
| `compliance.test.ts` | Compliance report endpoint |
| `demo-requests.test.ts` | Demo request lifecycle |
| `discharge-generate.test.ts` | AI generation endpoint as black box |
| `edit-record.test.ts` | Record edit endpoint (PUT) |
| `export-record.test.ts` | JSON export format completeness |
| `register-facility.test.ts` | Facility registration validation |
| `translation-request.test.ts` | Translation API via Supabase |

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

Set all environment variables in Vercel dashboard across 3 environments (production, preview, development). Note: `NEXTAUTH_URL` was removed — Auth.js v5 auto-detects the host. Add `AUTH_TRUST_HOST=true` instead.

### Domain

- Custom domain: e.g. `lafiyanku.ng` or `app.lafiyanku.health`
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

## Build Milestones

| Milestone | Scope | Status |
|-----------|-------|--------|
| M1 | System prompt locked; schemas approved; UI wireframes done | ✅ |
| M2 | PatientInput form + AI generation (Mode 1 + Mode 2) + output display; no auth yet | ✅ |
| M3 | Auth + role system; translation (ha / yo / ig); audit logging; export/print; PDF; FHIR | ✅ |
| M4 | 2 partner hospitals onboarded for pilot; clinician training | ⏳ |
| M5 | Pilot feedback integrated; NDPR audit complete; v1.0 public release | ⏳ |
| M6 | WhatsApp send; Pidgin UI; EHR scoping; additional languages (v1.1) | ⏳ |

---

## License

Internal use. Not for clinical distribution without verification.

---

*Lafiyanku — Built for Nigerian hospitals, clinics, and telemedicine providers.*
