# CareFlow — 7-Day Implementation Plan
# Document ID: CFW-PLAN-002 v1.0
# PRD Reference: CFW-PRD-001 v1.0
# Date: 2026-06-03

---

## Build Order

| Day | Focus | Phases | Output |
|-----|-------|--------|--------|
| 1 | Bootstrap + Scaffold | 0–1 | Running Next.js app, all folders, schemas, error codes, UI components |
| 2 | Data Layer + Auth | 2–3 | Supabase clients, audit service, env validation, NextAuth + middleware + login + role gate |
| 3 | PatientInput Form + AI Engine | 4–5 | 19-field form with Zod, medication rows, language selector, offline cache, DeepSeek integration, generate route |
| 4 | Output Display + Record Lifecycle | 6–7 | Side-by-side output viewer, inline editing, finalise/archive workflows, status badges, warning banners |
| 5 | Translation + Export/Print | 8–9 | Translate/retranslate UI, browser print (patient handout), WhatsApp share, PDF export route |
| 6 | Audit + Pages/Navigation | 10–11 | Audit log API + table, dashboard with search/filter, settings, detail page, role-aware sidebar |
| 7 | Testing + Deployment + Bug Fixes | 12–13 | 4 unit test files (28 tests), vitest config, vercel.json, env var template, comprehensive bug audit fixes |

---

## Day 1 — Bootstrap + Scaffold

### 1.1 Create Next.js app
```bash
npx create-next-app@latest careflow --typescript --tailwind --app --eslint --src-dir --import-alias "@/*"
```

### 1.2 Install dependencies
```bash
npx shadcn-ui@latest init -d
npx shadcn-ui@latest add button card input label select textarea tabs dialog alert
npx shadcn-ui@latest add form toast badge table separator skeleton

npm install react-hook-form zod @hookform/resolvers
npm install @supabase/supabase-js @supabase/ssr
npm install date-fns uuid
npm install --save-dev @types/uuid
npm install next-auth @auth/core
npm install lucide-react next-themes
npm install class-variance-authority clsx tailwind-merge
```

### 1.3 Supabase init + migrations
```bash
supabase init
supabase start
```
- Create `supabase/migrations/{ts}_initial_schema.sql` with 6 tables + enums + triggers + indexes
- Create `supabase/migrations/{ts}_rls_policies.sql` with RLS helper functions + policies
- Create `supabase/seed.sql` with 3 facilities + 3 users (bcrypt)

### 1.4 Env vars + design tokens
- Create `.env.local` with 15+ vars (Supabase URL/keys, DeepSeek key, AUTH_SECRET)
- Update globals.css: Plus Jakarta Sans import, brand colour tokens (`clinicalTeal: #0B6E6E`, `deepNavy: #0D2B4E`, `warmAmber: #B45309`), `.touch-target-min` utility

### 1.5 Create folder structure + schemas + error codes
```
app/api/health/route.ts
app/api/discharge/generate/route.ts
app/api/discharge/[id]/route.ts
app/api/discharge/[id]/finalise/route.ts
app/api/discharge/[id]/archive/route.ts
app/api/discharge/[id]/export/route.ts
app/api/translation/request/route.ts
app/api/audit/[recordId]/route.ts

app/page.tsx, /dashboard, /discharge/new, /discharge/[id], /discharge/[id]/output
app/audit/[recordId], /auth/login, /settings

src/components/forms/PatientInputForm, MedicationRow, LanguageSelector
src/components/outputs/ClinicalSummaryPanel, PatientInstructionsPanel, TranslationPanel
src/components/outputs/MissingFieldsBanner, FlaggedIssuesBanner
src/components/actions/GenerateButton, FinaliseButton, PrintButton, WhatsAppShareButton
src/components/layout/AppShell, Sidebar, TopNav, RoleGate
src/components/shared/StatusBadge, AuditLogTable, ConfirmModal, OfflineBanner, LoadingSpinner

src/services/ai-provider.ts, supabase-client.ts, supabase-server.ts, audit-log.ts
src/lib/env-validation.ts, utils.ts, error-codes.ts
src/hooks/useOfflineDraft.ts, useRole.ts
src/types/schemas.ts
```
- `src/types/schemas.ts`: 6 enums + 5 interfaces
- `src/lib/error-codes.ts`: 22 error codes from `.agents/api/error-codes.md`

### 1.6 Build verification
```bash
npm run build  # Must pass cleanly
```

---

## Day 2 — Data Layer + Auth

### 2.1 Supabase clients
- `src/services/supabase-client.ts`: `createBrowserClient()` from `@supabase/ssr`
- `src/services/supabase-server.ts`: `createServiceClient()` with service role key for server-side writes

### 2.2 Audit log service
`src/services/audit-log.ts`:
- `writeAuditLog(entry)` — always include `ipAddress`, always write before returning
- `getAuditLogs(recordId, { page, limit })` — paginated, ordered by timestamp desc

### 2.3 Env validation
`src/lib/env-validation.ts`: check required server + public env vars, fail fast

### 2.4 NextAuth.js v5
- `src/lib/auth.ts`: Credentials provider + Supabase Auth, session expiry 8 hours, rate limit (5 attempts/10 min)
- `app/api/auth/[...nextauth]/route.ts` — thin wrapper exporting handlers
- `src/middleware.ts` — protects `/dashboard`, `/discharge/*`, `/audit/*`, `/settings`, `/api/discharge/*`, `/api/audit/*`, `/api/translation/*`

### 2.5 Auth fixes (from bug audit)
- All API routes use `const session = await auth()` from NextAuth — never read userId/userRole from request body or headers
- Removes client-side auth bypass vulnerability

### 2.6 Role gate + login page
- `RoleGate.tsx`: allowedRoles prop, fallback render, server-side enforce via `auth()` everywhere
- `AuthProvider.tsx`: SessionProvider wrapper
- `app/auth/login/page.tsx` + `LoginForm.tsx`: email/password, NDPR consent, loading/error states

### 2.7 Build + verify
```bash
npm run build
```

---

## Day 3 — PatientInput Form + AI Engine

### 3.1 Zod schemas
```
medicationSchema: name, dosage, frequency (required) + timing, duration, notes (optional)
patientInputSchema: 19 fields + .refine(dischargeDate >= admissionDate)
```

### 3.2 PatientInputForm component
- 19 fields in order: facilityName, facilityCode, wardName, admissionDate, dischargeDate, patientName, age, gender, hospitalNumber, nhisNumber, diagnosis, treatmentGiven, proceduresPerformed, medications[], followUpInstructions, additionalNotes, languageRequested, dischargedBy, clinicianLicenseNo
- Field-specific errors on blur, all errors on Generate click, scroll to first error
- Optional fields labelled `(optional)` in Cool Grey, required marked with red `*`

### 3.3 MedicationRow + LanguageSelector
- Repeating rows with Add/Remove (min 1), 44px tap targets
- Language dropdown: English (default) / Hausa / Yoruba / Igbo

### 3.4 Offline draft (useOfflineDraft)
- Debounced 500ms auto-save to localStorage
- Online/offline detection via `navigator.onLine`
- Amber OfflineBanner when offline, block Generate
- Restore cached draft on mount

### 3.5 AI provider service
`src/services/ai-provider.ts`:
- `generateDischarge(input)` → DeepSeek with system prompt v2.0, AbortController 25s timeout
- `translateText(source, target)` → separate DeepSeek call at temperature 0.1
- `validateInput()` — 11 required fields + medication dosage/frequency + date contradictions
- `validateOutput()` — checks Red Flag Warnings, Discharged By, When to Return, Follow-Up Appointment present

### 3.6 Generate API route
`POST /api/discharge/generate`:
1. Auth via `auth()` → role check Doctor/Nurse
2. Validate `languageRequested` against `["en", "ha", "yo", "ig"]`
3. Call `generateDischarge()`, then `translateText()` if requested
4. Insert `discharge_records` first, then `translation_requests` (FK order)
5. Write AuditLog (action: `generate`)
6. Return output + missingFieldsLog + flaggedIssues

### 3.7 Bug fix: generate route guardrails
- `languageRequested` validated before use (fixes unhandled enum values)
- `translation_requests` only written when confidence !== "failed" (matches CHECK constraint)

### 3.8 Build + verify
```bash
npm run build
```

---

## Day 4 — Output Display + Record Lifecycle

### 4.1 Output viewer page
`app/discharge/[id]/output/page.tsx`:
- Mobile: Tabs (Clinical / Patient / Translation)
- Desktop lg+: Side-by-side columns
- Mode 1 gated from Admin (role check)
- `GET /api/discharge/[id]` joins `patient_inputs` for patient/facility/clinician data

### 4.2 Output panels
- `ClinicalSummaryPanel`: renders Mode 1 with pre wrapper
- `PatientInstructionsPanel`: renders Mode 2
- `TranslationPanel`: shows translated output with confidence badge (high/none, low ⚠ Fallback, failed ⚠ Translation failed)
- `MissingFieldsBanner`: amber list of absent optional fields
- `FlaggedIssuesBanner`: amber list of input inconsistencies
- `LoadingSpinner`: centered spinner

### 4.3 Inline editing
- Edit/Save/Cancel buttons
- `PUT /api/discharge/[id]` — Doctor/Nurse only, blocks archived + finalised records, writes AuditLog with changesDiff
- Bug fix: PUT no longer accepts `status` field in body (prevents bypassing finalise route)

### 4.4 Finalise workflow
`POST /api/discharge/[id]/finalise`:
- Auth → Doctor only (via `auth()`, not body)
- Status checks: must be `draft`, not `archived` or already `finalised`
- Update status → `finalised`
- AuditLog with notes (no changesDiff — constraint fix for non-edit actions)
- `ConfirmModal` before execution

### 4.5 Archive workflow
`POST /api/discharge/[id]/archive`:
- Auth → Doctor or Admin only
- Status check: not already `archived`
- Update status → `archived`
- AuditLog with notes (no changesDiff — constraint fix)

### 4.6 StatusBadge
- Amber → Draft, Teal → Finalised, Cool Grey → Archived

### 4.7 Build + verify
```bash
npm run build
```

---

## Day 5 — Translation + Export/Print

### 5.1 Translation API
`POST /api/translation/request`:
- Auth → Doctor/Nurse only
- Language validated: `ha` | `yo` | `ig`
- Calls `translateText()` with Mode 2 source text
- Writes `translation_requests` row + updates `discharge_records`
- Writes AuditLog with notes
- Bug fix: `completed_at` set to null only when confidence is "failed" (matches CHECK constraint)

### 5.2 Translation UI
- Language selector dropdown (Hausa / Yoruba / Igbo) on output page
- "Translate" button (no translation exists) / "Retranslate" button (low/failed confidence)
- Loading state while translating
- Updates local state on success so TranslationPanel renders immediately

### 5.3 PrintButton
- Opens new window with print-optimised HTML
- Facility header: name, patient name, discharge date, clinician (FR-27)
- Mode 2 patient-friendly output only
- Translated version below English when confidence is high or low (FR-26)
- Low confidence: footnote "Please verify with a fluent speaker"
- Failed translation: English only + failure message
- Clean print CSS with clinical-teal headers, proper margins, `@page` rules

### 5.4 WhatsAppShareButton
- Mobile: `https://wa.me/?text=` deep link
- Desktop: clipboard copy + green check toast
- Strips separator lines, removes medication table rows
- Truncates to 1500 chars preserving red flags as last section
- Mode 2 only — never shares Mode 1

### 5.5 Export API
`GET /api/discharge/[id]/export`:
- Auth → Doctor/Nurse only
- Joins `patient_inputs` for patient_name, facility_name, discharge_date, discharged_by
- Status check: must be `finalised`
- Returns export data object for PDF generation
- Writes AuditLog (action: `export`)

### 5.6 Build + verify
```bash
npm run build
```

---

## Day 6 — Audit + Pages/Navigation

### 6.1 Audit log API
`GET /api/audit/[recordId]`:
- Auth → Admin only (via `auth()`)
- Pagination via `?page=1&limit=20` (clamped max 50)
- Returns `{ data, pagination: { page, limit, total, totalPages } }`

### 6.2 Audit log page
`app/audit/[recordId]/page.tsx`:
- Client component: role check → non-Admin sees error
- Fetches from API with pagination
- Loading spinner, error state
- Renders `AuditLogTable` component

### 6.3 AuditLogTable component
- Styled table columns: Timestamp (WAT), User (truncated UUID), Role badge, Action, IP Address, Changes (JSON), Notes
- Alternating row backgrounds
- Prev/Next pagination with "Page X of Y"
- Empty state: "No audit log entries found"

### 6.4 Dashboard
`app/dashboard/page.tsx`:
- Record list fetched from `GET /api/discharge` with search + status filter
- "New Discharge" button (Doctor/Nurse only)
- Cards showing patient name, facility, date, clinician, StatusBadge
- View + detail arrow buttons
- Empty state with contextual messages
- Loading spinner

### 6.5 Discharge list API
`GET /api/discharge`:
- Auth (any role)
- `?search=` — two-step query (search patient_inputs by name, filter discharge_records by IDs)
- `?status=` — draft/finalised/archived filter
- Paginated response with `{ data, pagination }`

### 6.6 Discharge detail page
`app/discharge/[id]/page.tsx`:
- Patient name + facility header, StatusBadge
- Dates card (discharge date, generated at)
- Clinician card (discharged by, record ID)
- "View Full Output" + "Edit Record" buttons
- Back to Dashboard link

### 6.7 Settings page
`app/settings/page.tsx`:
- My Profile card (role, user ID — all roles)
- Facility Management card (admin only)
- NDPR Compliance card (admin only)

### 6.8 Role-aware Sidebar
- Converted to client component with `useRole()` + `usePathname()`
- Links conditional on role: Dashboard (all), New Discharge (Doctor/Nurse), Audit Log (Admin), Settings (all)
- Active state highlighting

### 6.9 Profile table fix
- `src/lib/auth.ts` queries `user_profiles` (not `profiles`) to match RLS migration

### 6.10 Build + verify
```bash
npm run build
```

---

## Day 7 — Testing + Deployment + Bug Fixes

### 7.1 Install test dependencies
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitejs/plugin-react
```

### 7.2 Vitest config
- `vitest.config.ts` with jsdom environment, `@/` path alias, globals: true
- `src/test-setup.ts` importing `@testing-library/jest-dom/vitest`

### 7.3 Unit tests (4 files, 28 tests)

| File | Tests |
|------|-------|
| `src/components/shared/__tests__/StatusBadge.test.tsx` | 3 — amber/teal/grey styling per status |
| `src/components/layout/__tests__/RoleGate.test.tsx` | 5 — allowed, denied + fallback, denied without fallback, undefined role, multiple roles |
| `src/services/__tests__/ai-provider.test.ts` | 9 — validateInput (valid, missing fields, missing follow-up, missing dosage, contradictory dates) + validateOutput (valid, missing red flags, missing discharged by, missing when to return, missing follow-up) |
| `src/components/forms/__tests__/PatientInputForm.test.tsx` | 11 — Zod schema: valid data, empty facilityName, age bounds, invalid gender, date ordering, empty medications, missing dosage, optional fields, all language codes |

### 7.4 Verify
```bash
npm test  # 28 passed
npm run build
```

### 7.5 Bug audit fixes (applied across Days 1–6)

| # | Severity | Bug | Fix |
|---|----------|-----|-----|
| 1–5 | Critical | Auth bypass via body/header userId/userRole | All routes use `auth()` from NextAuth |
| 6 | Critical | FK violation: translation_request before discharge_record | Insert discharge_record first |
| 7 | Critical | NOT NULL columns set to null | Accept null safely (patient_input_id, facility_id) |
| 8–9 | Critical | `translation_requests` CHECK constraint violated | Only insert when confidence !== "failed" |
| 10–11 | Critical | `changes_diff` on non-edit action violates constraint | Use `notes` instead of `changesDiff` for finalise/archive |
| 12 | Critical | Export route queries columns on wrong table | Added join with `patient_inputs` |
| 13 | Critical | `profiles` vs `user_profiles` table mismatch | auth.ts queries `user_profiles` |
| 14–15 | High | Missing role checks on PUT + export routes | Added Doctor/Nurse requireRole |
| 16 | High | Role from unverified body | Use `auth()` everywhere |
| 17–18 | High | PUT allowed editing finalised records + status bypass | Block finalised edits, remove `status` from update |
| 19 | High | Incorrect join filter syntax | Two-step query instead of dot-notation |
| 20 | High | `languageRequested` not validated | Validate against `["en", "ha", "yo", "ig"]` |
| 21–23 | High | Missing audit logs for GET, LIST, PUT | Added writeAuditLog calls |
| 24–26 | Medium | Missing validation for userId, rate limiting, orphaned records | userId validated, rate limit already in auth.ts, insert order fixed |

### 7.6 Vercel deployment config
`vercel.json`:
- Function maxDuration: 30s for AI routes, 10s for CRUD routes
- Runtime: `nodejs20.x` on all API routes
- Security headers: HSTS, X-Content-Type-Options, X-Frame-Options, X-XSS-Protection

### 7.7 Environment variables (Vercel dashboard)
Set 15 variables across 3 environments per `.agents/environment.md`

### 7.8 Domain
- Custom domain (e.g. `careflow.ng` or `app.careflow.health`)
- Auto SSL via Let's Encrypt (Vercel default)

---

## Reference Files

| Document | ID | Path |
|----------|----|------|
| Product Requirements Document | CFW-PRD-001 v1.0 | `docs/CareFlow_PRD_v1.0.md` |
| AI System Prompt | CFW-PROMPT-002 v2.0 | `docs/CareFlow_System_Prompt_v2.md` |
| Agent Workspace Context | CFW-AGENTS-001 v1.0 | `AGENTS.md` |
| Implementation Plan | CFW-PLAN-002 v1.0 | `docs/implementation-plan.md` |

---

*CareFlow — CFW-PLAN-002 v1.0*
*7-Day Implementation Plan — For internal Antigravity agent use only.*
