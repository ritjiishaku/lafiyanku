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
| Finalise / Archive / Unarchive lifecycle | ✅ |
| Print-optimised patient handout | ✅ |
| WhatsApp share (deep link / clipboard) | ✅ |
| PDF export | ✅ |
| Role-based access (Doctor / Nurse / Admin) | ✅ |
| Audit log (immutable, paginated, facility-scoped) | ✅ |
| Offline draft caching | ✅ |
| Server-side draft persistence | ✅ |
| FHIR conversion endpoint | ✅ |

### Security

| Feature | Status |
|---------|--------|
| Rate-limited login (5 attempts / 10 min) | ✅ |
| Rate-limited AI generation (10 requests / user / hr) | ✅ |
| Rate-limited password reset (3 requests / email / hr) | ✅ |
| Supabase-backed distributed rate limiting | ✅ |
| Input length validation (50k max on edits) | ✅ |
| ILIKE wildcard escaping on search | ✅ |
| Cross-tenant audit log isolation (RLS + API) | ✅ |
| Removed hardcoded credentials from seed script | ✅ |
| Server-side RBAC enforced on every API route | ✅ |
| Middleware redirect for unauthenticated users | ✅ |
| TLS 1.3 (via Vercel/Infrastructure) | ✅ |
| NDPR-compliant audit logging | ✅ |

### Accessibility (WCAG AA)

| Feature | Status |
|---------|--------|
| Skip-to-content link on all layouts | ✅ |
| aria-required on all required form fields | ✅ |
| aria-live regions on error/info/status banners | ✅ |
| prefers-reduced-motion CSS support | ✅ |
| ARIA labels on modals, error, and loading pages | ✅ |
| Role=menu on sidebar user menu | ✅ |
| Touch targets ≥ 44px on all interactive elements | ✅ |
| Escape key handling on mobile menus and modals | ✅ |
| Focus return management on mobile nav | ✅ |

### Mobile-First Design

| Feature | Status |
|---------|--------|
| Dual-layout tables (cards on mobile, table on desktop) | ✅ |
| Responsive textarea heights | ✅ |
| Responsive grid layouts throughout | ✅ |
| Full-width buttons on mobile dialogs | ✅ |
| Slide-out sidebar drawer with overlay | ✅ |
| Popover user menu (floats above trigger) | ✅ |
| Translation UI integrated into patient tab | ✅ |

### Landing Page

| Feature | Status |
|---------|--------|
| 9 sections: Hero, Problem, How It Works, Features, Comparison, Social Proof, Trust, FAQ, Demo | ✅ |
| Comparison table (Lafiyanku vs manual) | ✅ |
| Social proof section (testimonials) | ✅ |
| FAQ accordion (single-open) | ✅ |
| 3-column footer with legal links | ✅ |
| Page-level metadata | ✅ |
| SVG OG image | ✅ |
| SEO metadata on all marketing pages | ✅ |
| Updated sitemap and robots.txt | ✅ |

### Guardrails

- Never invents clinical information not in the input
- Never generates diagnoses not provided by the clinician
- Never prescribes new medications or alters existing doses
- Always includes Red Flag Warnings in Mode 1
- Always includes Discharged By in Mode 1
- All outputs are drafts until a Doctor finalises them
- Low-confidence translations default to English with warning
- Missing medication dosage/frequency clearly stated

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
| UI | shadcn/ui v4 + Tailwind CSS v4 + Base UI |
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
cp .env.local.example .env.local
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
NEXT_PUBLIC_WHATSAPP_NUMBER=2348000000000
CFW_AI_PROMPT_VERSION=v2.0
CFW_AI_MODEL_VERSION=deepseek-chat

# Seeding (optional — used by scripts/seed-users.mjs)
SEED_TEST_PASSWORD=Lafiyanku@2026
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
│   ├── (marketing)/
│   │   ├── page.tsx                     # Landing page (9 sections)
│   │   ├── contact/                     # Contact form
│   │   ├── demo/                        # Live demo page
│   │   ├── ndpr/                        # NDPR compliance page
│   │   ├── privacy/                     # Privacy policy
│   │   ├── terms/                       # Terms of service
│   │   └── layout.tsx                   # Marketing layout
│   ├── api/
│   │   ├── admin/
│   │   │   ├── clinicians/              # Clinician management (Admin)
│   │   │   ├── compliance/              # Compliance dashboard (Admin)
│   │   │   └── demo-requests/           # Demo request list (Admin)
│   │   ├── audit/[recordId]/route.ts    # Audit log API (Admin)
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts   # NextAuth handler
│   │   │   └── forgot-password/route.ts # Password reset (rate-limited)
│   │   ├── contact/demo-request/route.ts
│   │   ├── dashboard/metrics/route.ts
│   │   ├── discharge/
│   │   │   ├── route.ts                 # List records (search/filter)
│   │   │   ├── [id]/route.ts            # GET/PUT record
│   │   │   ├── [id]/archive/route.ts
│   │   │   ├── [id]/export/route.ts
│   │   │   ├── [id]/finalise/route.ts
│   │   │   ├── [id]/unarchive/route.ts
│   │   │   ├── draft/route.ts           # Server-side draft persistence
│   │   │   └── generate/route.ts        # AI generation (rate-limited)
│   │   ├── facilities/                  # Facility registry
│   │   ├── fhir/                        # FHIR conversion
│   │   ├── health/route.ts              # Health check
│   │   ├── register/route.ts            # User registration
│   │   ├── settings/change-password/route.ts
│   │   └── translation/request/route.ts
│   ├── admin/                           # Admin pages
│   ├── audit/                           # Audit log pages
│   ├── dashboard/
│   │   ├── NewDischargeView.tsx          # Lazy-loaded form wrapper
│   │   ├── DischargeOutputView.tsx       # Discharge output viewer
│   │   ├── DashboardList.tsx             # Record list/tiles
│   │   └── page.tsx                      # Dashboard page
│   ├── discharge/[id]/page.tsx
│   ├── login/
│   │   ├── page.tsx                      # Login page (session guard)
│   │   └── login/LoginForm.tsx
│   ├── layout.tsx                        # Root layout
│   └── page.tsx                          # Redirect to /login
├── components/
│   ├── forms/
│   │   ├── PatientInputForm.tsx           # 19-field form (lazy-loaded)
│   │   ├── MedicationRow.tsx              # Medication sub-form
│   │   └── LanguageSelector.tsx           # Language picker
│   ├── layout/
│   │   ├── AppShell.tsx                   # App shell layout
│   │   ├── Sidebar.tsx                    # Role-aware sidebar + popover menu
│   │   ├── TopNav.tsx                     # Top navigation
│   │   └── RoleGate.tsx                   # Role-based gate
│   ├── marketing/
│   │   ├── HeroSection.tsx
│   │   ├── ProblemSection.tsx
│   │   ├── HowItWorksSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── ComparisonTable.tsx            # Lafiyanku vs manual
│   │   ├── SocialProofSection.tsx         # Testimonials
│   │   ├── TrustSection.tsx
│   │   ├── FaqSection.tsx                 # Accordion
│   │   ├── DemoSection.tsx
│   │   ├── MarketingNav.tsx
│   │   ├── Footer.tsx
│   │   └── DemoRequestForm.tsx
│   ├── outputs/
│   │   ├── ClinicalSummaryPanel.tsx       # Mode 1 (dual-layout table)
│   │   ├── PatientInstructionsPanel.tsx   # Mode 2
│   │   ├── TranslationPanel.tsx           # Translation display
│   │   ├── MissingFieldsBanner.tsx
│   │   └── FlaggedIssuesBanner.tsx
│   ├── pdf/
│   │   └── DischargePdf.tsx              # @react-pdf/renderer doc
│   ├── shared/
│   │   ├── StatusBadge.tsx
│   │   ├── AuditLogTable.tsx              # Paginated audit table
│   │   ├── ConfirmModal.tsx               # Confirmation dialog
│   │   ├── PrintButton.tsx
│   │   ├── WhatsAppShareButton.tsx
│   │   ├── OfflineBanner.tsx
│   │   └── LoadingSpinner.tsx
│   └── ui/                               # shadcn/ui components
├── lib/
│   ├── auth.ts                            # NextAuth config
│   ├── env-validation.ts
│   ├── error-codes.ts                     # 18 error codes
│   ├── require-role.ts
│   ├── utils.ts
│   └── validations.ts                     # Zod schemas
├── services/
│   ├── ai-provider.ts                     # DeepSeek integration
│   ├── audit-log.ts
│   ├── rate-limit.ts                      # Distributed rate limiting
│   ├── supabase-client.ts
│   └── supabase-server.ts
├── hooks/
│   └── useRole.ts                         # Session role hook
├── types/
│   ├── schemas.ts                         # TS interfaces + enums
│   └── database.ts                        # Generated Supabase types
├── proxy.ts                               # Auth redirect middleware
└── test-setup.ts                          # Vitest setup
supabase/
├── migrations/                            # 21 migration files
└── seed.sql                               # Seed data
```

---

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/[...nextauth]` | - | NextAuth handler |
| GET | `/api/health` | - | Health check |
| POST | `/api/register` | - | User registration |
| POST | `/api/auth/forgot-password` | - | Password reset (3/email/hr) |
| POST | `/api/contact/demo-request` | - | Submit demo request |
| POST | `/api/facilities/register` | - | Register facility |
| GET | `/api/discharge` | Any | List records (search, filter, paginate) |
| POST | `/api/discharge/generate` | Doctor/Nurse | Generate discharge (10/user/hr) |
| GET | `/api/discharge/draft` | Doctor/Nurse | Get saved draft |
| POST | `/api/discharge/draft` | Doctor/Nurse | Save draft |
| DELETE | `/api/discharge/draft` | Doctor/Nurse | Clear draft |
| GET | `/api/discharge/[id]` | Any | Get single record |
| PUT | `/api/discharge/[id]` | Doctor/Nurse | Edit record (50k char max) |
| POST | `/api/discharge/[id]/finalise` | Doctor | Finalise record |
| POST | `/api/discharge/[id]/archive` | Doctor/Admin | Archive record |
| POST | `/api/discharge/[id]/unarchive` | Doctor/Admin | Unarchive record |
| GET | `/api/discharge/[id]/export` | Doctor/Nurse | Export record (JSON/PDF) |
| POST | `/api/translation/request` | Doctor/Nurse | Request translation |
| GET | `/api/audit/[recordId]` | Admin | Get audit log entries (facility-scoped) |
| GET | `/api/dashboard/metrics` | Any | Dashboard metrics |
| GET | `/api/admin/clinicians` | Admin | List clinicians |
| POST | `/api/admin/clinicians` | Admin | Add clinician |
| PUT | `/api/admin/clinicians/[id]` | Admin | Edit clinician |
| DELETE | `/api/admin/clinicians/[id]` | Admin | Remove clinician |
| POST | `/api/admin/clinicians/[id]/regenerate-password` | Admin | Reset clinician password |
| GET | `/api/admin/compliance` | Admin | Compliance report |
| GET | `/api/admin/demo-requests` | Admin | List demo requests |
| POST | `/api/settings/change-password` | Any | Change own password |
| POST | `/api/fhir/convert` | Any | Convert to FHIR format |
| GET | `/api/fhir/test` | Any | FHIR test endpoint |

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
- Audit logs are facility-scoped (cross-tenant isolation fixed in migration)
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

| File | Tests | Focus |
|------|-------|-------|
| `ai-provider.test.ts` | 10 | Input validation, output validation, section completeness |
| `PatientInputForm.test.tsx` | 10 | Zod schema: required fields, age bounds, date ordering, medications |
| `TranslationPanel.test.tsx` | 6 | Translation display, confidence banners, retranslate |
| `ClinicalSummaryPanel.test.tsx` | 3 | Mode 1 display, missing fields, responsive layout |
| `PatientInstructionsPanel.test.tsx` | 3 | Mode 2 display, content rendering |
| `MedicationRow.test.tsx` | 3 | Medication sub-form, add/remove rows |
| `LanguageSelector.test.tsx` | 3 | Language picker, default value, combobox role |
| `MissingFieldsBanner.test.tsx` | 3 | Missing field warnings display |
| `FlaggedIssuesBanner.test.tsx` | 2 | Flagged issues display |
| `StatusBadge.test.tsx` | 3 | Draft/finalised/archived styling |
| `LoadingSpinner.test.tsx` | 3 | Loading indicator rendering |
| `ConfirmModal.test.tsx` | 1 | Modal title and description |
| `AuditLogTable.test.tsx` | 1 | Audit log table rendering |
| `OfflineBanner.test.tsx` | 1 | Offline indicator |
| `fhir-adapter.test.ts` | 1 | FHIR conversion |

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
| NDPR 2019 (Nigeria) | Lawful processing, data residency, breach notification | Full audit log, consent on login, IP logging, cross-tenant isolation |
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
| M4 | Mobile-first design, accessibility audit, security hardening, landing page, translation UX | ✅ |
| M4 | 2 partner hospitals onboarded for pilot; clinician training | ⏳ |
| M5 | Pilot feedback integrated; NDPR audit complete; v1.0 public release | ⏳ |
| M6 | WhatsApp send; Pidgin UI; EHR scoping; additional languages (v1.1) | ⏳ |

---

## License

Internal use. Not for clinical distribution without verification.

---

*Lafiyanku — Built for Nigerian hospitals, clinics, and telemedicine providers.*
