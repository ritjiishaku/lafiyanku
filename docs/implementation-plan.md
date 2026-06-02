# CareFlow AI — Implementation Plan
# Document ID: CFW-PLAN-001 v1.0
# PRD Reference: CFW-PRD-001 v1.0
# Date: 2026-06-02

---

## Build Order

Build strictly per AGENTS.md milestones. Do not skip ahead.

| Milestone | Scope | Phase(s) | Target |
|-----------|-------|----------|--------|
| M1 | System prompt locked; schemas approved; UI wireframes done | 0–2 | Week 2 |
| M2 | PatientInput form + AI generation + output display; no auth | 4–6 | Week 4 |
| M3 | Auth + roles + translation + audit + export/print | 3, 7–10 | Week 7 |
| M4 | Pilot onboarding | 13 | Week 10 |

---

## Phase 0 — Environment Bootstrap

### Step 0.1 — Create Next.js app
```bash
npx create-next-app@latest careflow --typescript --tailwind --app --eslint --src-dir --import-alias "@/*"
```

### Step 0.2 — Install dependencies
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
npm install --save-dev @types/node @types/react @types/react-dom
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npm install --save-dev typescript eslint prettier
```

### Step 0.3 — Set up Supabase locally
```bash
supabase init
supabase start
# Copy local API URL + anon key + service role key to .env.local
```

### Step 0.4 — Database migrations
- Create `supabase/migrations/{timestamp}_initial_schema.sql` from `.agents/database/schema.sql`
- Create `supabase/migrations/{timestamp}_rls_policies.sql` from `.agents/database/rls-policies.sql`
- Create `supabase/seed.sql` from `.agents/database/seed.sql`
- Run: `supabase db push` (x2) then `supabase db reset`

### Step 0.5 — Environment variables
Create `.env.local` from template in `.agents/environment.md`. Add to `.gitignore`.

### Step 0.6 — Design tokens
- Update `tailwind.config.ts` with brand colours from `.agents/design-system.md`:
  `clinicalTeal: "#0B6E6E"`, `deepNavy: "#0D2B4E"`, `warmAmber: "#B45309"`, etc.
- Update `app/globals.css` with Plus Jakarta Sans import + M3 semantic tokens from `.tokens/tokens.css`
- Add utility: `.touch-target-min { min-width: 44px; min-height: 44px; }`

---

## Phase 1 — Project Scaffold

### Step 1.1 — Create folder structure

```
app/api/health/route.ts
app/api/discharge/generate/route.ts
app/api/discharge/[id]/route.ts
app/api/discharge/[id]/finalise/route.ts
app/api/discharge/[id]/archive/route.ts
app/api/discharge/[id]/export/route.ts
app/api/translation/request/route.ts
app/api/audit/[recordId]/route.ts

app/page.tsx                          # Landing page
app/dashboard/page.tsx
app/discharge/new/page.tsx
app/discharge/[id]/page.tsx
app/discharge/[id]/output/page.tsx
app/audit/[recordId]/page.tsx
app/auth/login/page.tsx
app/settings/page.tsx

src/components/forms/PatientInputForm.tsx
src/components/forms/MedicationRow.tsx
src/components/forms/LanguageSelector.tsx
src/components/outputs/ClinicalSummaryPanel.tsx
src/components/outputs/PatientInstructionsPanel.tsx
src/components/outputs/TranslationPanel.tsx
src/components/outputs/MissingFieldsBanner.tsx
src/components/outputs/FlaggedIssuesBanner.tsx
src/components/actions/GenerateButton.tsx
src/components/actions/FinaliseButton.tsx
src/components/actions/PrintButton.tsx
src/components/actions/WhatsAppShareButton.tsx
src/components/actions/ExportPDFButton.tsx
src/components/layout/AppShell.tsx
src/components/layout/Sidebar.tsx
src/components/layout/TopNav.tsx
src/components/layout/RoleGate.tsx
src/components/shared/StatusBadge.tsx
src/components/shared/AuditLogTable.tsx
src/components/shared/ConfirmModal.tsx
src/components/shared/OfflineBanner.tsx
src/components/shared/LoadingSpinner.tsx

src/services/ai-provider.ts
src/services/supabase-client.ts
src/services/supabase-server.ts
src/services/audit-log.ts
src/lib/env-validation.ts
src/lib/utils.ts
src/hooks/useOfflineDraft.ts
src/hooks/useRole.ts
src/types/schemas.ts
```

### Step 1.2 — TypeScript types
Create `src/types/schemas.ts` — interfaces mirroring every schema from `.agents/schemas/`:
- `PatientInput` (camelCase, all fields + Medication sub-array)
- `DischargeRecord`
- `AuditLog`
- `TranslationRequest`
- `Medication` (sub-type)
- Enums: `UserRole`, `RecordStatus`, `AuditAction`, `Language`, `TranslationConfidence`, `Gender`

### Step 1.3 — Error codes
Create a constants file `src/lib/error-codes.ts` mapping all 22 error codes from `.agents/api/error-codes.md`.

---

## Phase 2 — Data Layer (Services)

### Step 2.1 — Supabase clients
- `src/services/supabase-client.ts`: `createBrowserClient()` from `@supabase/ssr`
- `src/services/supabase-server.ts`: `createServerClient()` with service role key for server-side writes

### Step 2.2 — Audit log service
`src/services/audit-log.ts`:
- `writeAuditLog(entry)` — always include `ipAddress`, always write before returning
- Critical: if write fails, throw `AUDIT_LOG_WRITE_FAILED` — never proceed silently
- `changesDiff` required for `edit`, `finalise`, `archive` actions; null otherwise

### Step 2.3 — Env validation
`src/lib/env-validation.ts`:
- Check required server vars: `SUPABASE_SERVICE_ROLE_KEY`, `DEEPSEEK_API_KEY`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- Check required public vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`
- Call from `instrumentation.ts` or `middleware.ts` to fail fast

---

## Phase 3 — Authentication & Role System (M3)

### Step 3.1 — NextAuth.js setup
- `app/api/auth/[...nextauth]/route.ts` — Supabase adapter, credentials/email provider
- Session expiry: 8 hours (one clinical shift)
- Failed login rate limit: 5 attempts in 10 minutes → lockout

### Step 3.2 — Middleware
`middleware.ts`:
- Refresh Supabase session on every request
- Protect all `/dashboard`, `/discharge/*`, `/audit/*`, `/settings` routes
- Redirect unauthenticated users to `/auth/login`

### Step 3.3 — Role gate
`src/components/layout/RoleGate.tsx`:
- Props: `allowedRoles: UserRole[]`, `fallback?: ReactNode`
- Server-side enforcement in every API route via `requireRole()` helper
- Client-side: wraps UI elements for UX (never security boundary)

### Step 3.4 — Login page
`app/auth/login/page.tsx`:
- NDPR consent notice
- Email/password (with password reset)
- Deep Navy heading, Clinical Teal primary button

---

## Phase 4 — Patient Input Form (M2, FR-01 to FR-08)

### Step 4.1 — Form component
`src/components/forms/PatientInputForm.tsx`:
- 19 fields in exact order from `.agents/skills/patient-input-form.md`
- `react-hook-form` + Zod resolver
- Field-specific error messages on blur (red border `#C0392B`)
- All errors shown simultaneously on Generate click → scroll to first error
- Optional fields labelled `(optional)` in Cool Grey (`#64748B`)
- Required fields marked with red `*`

### Step 4.2 — Medication rows
`src/components/forms/MedicationRow.tsx`:
- Repeating rows: name, dosage, frequency (required) + timing, duration, notes (optional)
- Add button: "＋ Add medication" — 44×44px tap target
- Remove button per row (hidden on row 1 — min 1 row always present)
- Tab order: all fields in row 1 → row 2 → ...

### Step 4.3 — Language selector
`src/components/forms/LanguageSelector.tsx`:
- Label: "Output language for patient instructions"
- Options: English (default), Hausa, Yoruba, Igbo
- Stored as ISO code: `en` | `ha` | `yo` | `ig`

### Step 4.4 — Offline caching
`src/hooks/useOfflineDraft.ts`:
- Cache form state debounced at 500ms per field change
- Survives page reload (localStorage, scoped to user)
- Amber banner when offline: "You are offline — your form is saved locally."
- Block Generate button when offline
- Restore cached draft on form load if available

### Step 4.5 — Save-as-draft (FR-07, Should have)
- "Save draft" secondary button below form
- No validation required — saves raw state
- Success toast: "Draft saved successfully."

---

## Phase 5 — AI Generation Engine (M2, FR-09 to FR-20)

### Step 5.1 — AI provider service
`src/services/ai-provider.ts`:
- `generateDischarge(input)` → calls DeepSeek with system prompt v2.0
- `translateText(input)` → separate DeepSeek call at temperature 0.2
- Timeout: AbortController at 25s server-side
- Split response at "PATIENT DISCHARGE INSTRUCTIONS" marker into Mode 1 / Mode 2
- Validate: Red Flag Warnings present, Discharged By present, When to return present
- Error mapping per `.agents/api/error-codes.md`
- Abstract interface — swap provider by changing one file

### Step 5.2 — Generate API route
`POST /api/discharge/generate`:
1. Server-side validate all required PatientInput fields
2. Call `generateDischarge()` (with translation if `languageRequested !== "en"`)
3. Write `DischargeRecord` (status: `draft`)
4. Write `TranslationRequest` row if translation was requested
5. Write `AuditLog` entry (action: `generate`)
6. Return output + missingFieldsLog + flaggedIssues
7. On failure: no DB writes, return error code, re-enable form

### Step 5.3 — Guardrails enforced
- Never invent clinical data (FR-11)
- Never generate diagnoses not provided (FR-12)
- Never prescribe new medications or alter doses (FR-13)
- Missing medication dosage/frequency → flag explicitly
- Missing follow-up → state "No follow-up instructions provided."
- Always include Red Flag Warnings and Discharged By (guardrails 7–8)
- Generation metadata stored on record, never in patient-facing output

---

## Phase 6 — Output Display (M2, FR-21 to FR-22)

### Step 6.1 — Output viewer page
`app/discharge/[id]/output/page.tsx`:
- Mode 1 (clinical) and Mode 2 (patient) as switchable tabs on mobile, side-by-side on desktop
- Mode 1 gated: Admin cannot see (404 or hidden)

### Step 6.2 — Output panels
- `ClinicalSummaryPanel`: renders Mode 1 with all 9 sections per template from AGENTS.md
- `PatientInstructionsPanel`: renders Mode 2 with all 6 sections
- `TranslationPanel`: third tab when translation exists, amber `⚠ Fallback` badge if low confidence

### Step 6.3 — Warning banners
- `MissingFieldsBanner` — amber banner listing absent optional fields
- `FlaggedIssuesBanner` — amber banner listing input inconsistencies
- Both styled per `.agents/design-system.md`: amber bg `#FFF8E1`, amber left border `#B45309`

### Step 6.4 — Inline editing
- Clinician can edit output text fields directly
- On save: `PUT /api/discharge/[id]` → updates DischargeRecord + writes AuditLog with changesDiff
- Doctor editing a finalised record → status reverts to `draft` automatically

---

## Phase 7 — Record Lifecycle (M3)

### Step 7.1 — Finalise workflow
`POST /api/discharge/[id]/finalise` (per `.agents/workflows/finalise-record.md`):
- Server-side role check: Doctor only
- Record existence + facility check
- Status check: must be `draft`
- Pre-finalisation completeness check: warn if sections incomplete, never hard-block
- Confirmation modal before execution
- Update status to `finalised`
- Write AuditLog with changesDiff `{ status: { before: "draft", after: "finalised" } }`
- Enable print/export/share buttons

### Step 7.2 — Archive workflow
`POST /api/discharge/[id]/archive`:
- Doctor or Admin only
- Terminal state: no transitions out of `archived`

### Step 7.3 — Status badge
`StatusBadge` — amber (draft), green/success (finalised), grey (archived) per design system

---

## Phase 8 — Translation (M3, FR-18 to FR-19)

### Step 8.1 — Translation API
`POST /api/translation/request`:
- Role check: Doctor or Nurse
- Language validation: only `ha` | `yo` | `ig`
- Call `translateText()` with the source Mode 2 text
- Confidence heuristic: similarity + length checks
- Update DischargeRecord + write TranslationRequest row + write AuditLog

### Step 8.2 — Translation UI
- "Translate" button on output panel when no translation exists
- "Retranslate" button when confidence was `low` or `failed`
- Language selector modal (ha/yo/ig)
- Amber warning banner on low confidence:
  "Translation into [language] could not be completed with sufficient confidence."

---

## Phase 9 — Export & Print (M3, FR-24 to FR-27)

### Step 9.1 — Browser print (patient handout)
- `PrintButton` → builds print-optimised HTML with facility header (FR-27), Mode 2 only
- Translated version below English if confidence high (FR-26)
- If low confidence: English only + footnote
- Calls `window.print()`

### Step 9.2 — PDF export (clinical)
`GET /api/discharge/[id]/export`:
- Doctor only for clinical PDF (Mode 1)
- Nurse can export patient handout (Mode 2)
- Server-side PDF generation (low-bandwidth: max 500KB, no large images)
- Metadata in footer only (promptVersion, modelVersion, generatedAt, recordId)
- File naming: `DischargeSummary_[patientName]_[dischargeDate].pdf`

### Step 9.3 — WhatsApp share
`WhatsAppShareButton` (per `.agents/skills/whatsapp-share.md`):
- Mode 2 only — **never share Mode 1**
- Strip separator lines (`──────`), convert medication tables to numbered list
- Max 1500 characters, red flags always last section
- Mobile: `https://wa.me/?text=[encoded]` deep link
- Desktop: clipboard copy + toast
- Write AuditLog (action: `export`)

---

## Phase 10 — Audit Log (M3)

### Step 10.1 — Audit log API
`GET /api/audit/[recordId]`:
- Admin only (Doctor/Nurse get 403)
- Paginated response per `.agents/api/route-map.md`
- Returns: logId, recordId, userId, userRole, action, timestamp, ipAddress, changesDiff, notes

### Step 10.2 — Audit log page
`app/audit/[recordId]/page.tsx`:
- `AuditLogTable` — paginated, shows all entries for a record
- Columns: Timestamp, User, Role, Action, IP Address, Changes, Notes
- Read-only — no edit/delete actions (immutability enforced at DB level)

---

## Phase 11 — Pages & Navigation

| Route | Page | Role Access | Key Content |
|-------|------|-------------|-------------|
| `/` | Landing | All | Redirect to /dashboard if authed, /auth/login if not |
| `/auth/login` | Login | Unauthenticated | Email/password form, NDPR consent notice |
| `/dashboard` | Dashboard | Doctor, Nurse, Admin | Record list, search/filter, create-new button, role-aware actions |
| `/discharge/new` | New Discharge | Doctor, Nurse | PatientInputForm |
| `/discharge/[id]` | Record View | Doctor, Nurse, Admin | Summary header, status badge, output panels, action buttons |
| `/discharge/[id]/output` | Output Viewer | Doctor, Nurse | Mode 1/2 tabs, translation tab, banners, inline edit |
| `/audit/[recordId]` | Audit Log | Admin | AuditLogTable |
| `/settings` | Settings | Doctor, Nurse, Admin | Facility profile, user management (role-dependent) |

---

## Phase 12 — Testing

### Unit tests (Jest + React Testing Library)
| File | Tests |
|------|-------|
| `src/services/__tests__/ai-provider.test.ts` | Response splitting, section validation, missing section rejection |
| `src/components/forms/__tests__/PatientInputForm.test.tsx` | Required field validation, age range, date ordering, medication rows |
| `src/components/layout/__tests__/RoleGate.test.tsx` | Allowed/denied rendering, fallback |
| `src/components/shared/__tests__/StatusBadge.test.tsx` | Draft/finalised/archived styling |

### Integration tests
| File | Tests |
|------|-------|
| `tests/api/discharge/generate.test.ts` | Valid input → 200, missing field → 400, admin → 403 |
| `tests/api/discharge/finalise.test.ts` | Doctor → 200, Nurse → 403, already finalised → 400 |
| `tests/api/audit/audit.test.ts` | Admin → 200 with data, Doctor → 403 |

### RLS tests
`tests/database/rls.test.sql` — facility isolation, role-based access, audit log immutability

### Performance
- AI generation < 15s on 4G simulation
- k6 load test: 50 concurrent users, p95 < 20s

---

## Phase 13 — Deployment

### Vercel configuration
`vercel.json`:
- Function maxDuration: 30s for AI routes, 10s for CRUD routes
- Runtime: `nodejs20.x` on all API routes
- Security headers: HSTS, X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
- Redirect authenticated users from `/` to `/dashboard`

### Environment variables
Set in Vercel dashboard per `.agents/integrations/vercel.md` — 15 variables across 3 environments

### Domain
- Custom domain: e.g. `careflow.ng` or `app.careflow.health`
- Auto SSL via Let's Encrypt (Vercel default)

---

## Constraints Summary

From `.agents/code-style.md`:
- camelCase for all schema fields, lowercase string enums
- Never snake_case
- Client-side role checks are UX only — server always re-validates
- Never swallow errors — every error surfaces to user + logged server-side
- Never merge admissionDate and dischargeDate
- Never expose generation metadata in patient-facing output
- Never skip AuditLog entry — treat write failures as critical

From `.agents/security.md`:
- RBAC enforced server-side on every request
- Never allow Nurse or Admin to finalise
- Never allow Admin to view Mode 1
- Never allow cross-facility data access
- IP address logged on every AuditLog entry
- All patient data encrypted at rest (AES-256) and in transit (TLS 1.3)

From `.agents/design-system.md`:
- Amber-only for clinical warnings; red only for form validation errors
- Minimum body text: 14px; patient-facing output: 16px
- Plus Jakarta Sans throughout
- Focus ring: 3px `rgba(11,110,110,0.30)`
- Minimum tap target: 44×44px

From `.agents/ai-generation.md` and prompt v2.0:
- Never invent clinical data
- Never modify medication doses
- Always include Red Flag Warnings and Discharged By
- Status must always start as `draft`
- Never use Edge runtime for AI routes — Node.js only
- Never skip timeout handler (25s for generation, 10s for translation)

---

## Reference Files

| Document | ID | Path |
|----------|----|------|
| Product Requirements Document | CFW-PRD-001 v1.0 | `docs/CareFlow_PRD_v1.0.md` |
| AI System Prompt | CFW-PROMPT-002 v2.0 | `docs/CareFlow_AI_System_Prompt_v2.md` |
| Agent Workspace Context | CFW-AGENTS-001 v1.0 | `AGENTS.md` |
| Implementation Plan | CFW-PLAN-001 v1.0 | `docs/implementation-plan.md` |

---

*CareFlow AI — CFW-PLAN-001 v1.0*
*For internal Antigravity agent use only. Not for clinical distribution.*
