# Architecture Overview
# File: /.agents/architecture.md
# Version: 1.0
# Last Updated: June 2026
# PRD Reference: CFW-PRD-001 v1.0
# Purpose: System architecture, data flow, layer definitions, performance targets, and delivery channels.

---

## 1. Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 1 — INPUT                                                │
│  PatientInput Form (Doctor / Nurse)                             │
│  - Structured form fields                                       │
│  - Client-side validation (UX only)                             │
│  - Offline-first draft caching                                  │
│  - Server-side validation before generation trigger             │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Validated PatientInput payload
┌──────────────────────────▼──────────────────────────────────────┐
│  LAYER 2 — AI GENERATION ENGINE                                 │
│  - Receives validated PatientInput                              │
│  - Sends structured payload to AI model (prompt v2.0)          │
│  - Returns: Mode 1 (clinicalSummary) + Mode 2 (patientFriendlyOutput) │
│  - Triggers TranslationRequest if languageRequested is set      │
│  - Writes DischargeRecord (status: draft)                       │
│  - Writes AuditLog (action: generate)                           │
└──────────────────────────┬──────────────────────────────────────┘
                           │ DischargeRecord (draft)
┌──────────────────────────▼──────────────────────────────────────┐
│  LAYER 3 — OUTPUT / DELIVERY                                    │
│  - Screen: Mode 1 + Mode 2 side-by-side / tabbed                │
│  - Clinician edits output inline (AuditLog: edit)               │
│  - Doctor finalises (status: finalised) (AuditLog: finalise)    │
│  - Export: PDF / printable (AuditLog: print / export)           │
│  - WhatsApp: Mode 2 plain text only (AuditLog: export)          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Flow

```
PatientInput (form submission)
       │
       ▼
[Server-side validation]
       │
       ├── Required fields missing? → Return error to UI; do not proceed
       │
       ▼
[AI Generation Engine]
       │
       ├── Writes: DischargeRecord { status: "draft", clinicalSummary, patientFriendlyOutput }
       ├── Writes: AuditLog { action: "generate", userId, userRole, timestamp }
       │
       ├── languageRequested set?
       │       ├── Yes → TranslationRequest { sourceText: patientFriendlyOutput, targetLanguage }
       │       │           └── confidence: high → store translatedOutput in DischargeRecord
       │       │           └── confidence: low/failed → fallbackUsed: true; notify clinician
       │       └── No  → skip translation
       │
       ▼
[Output Display — Layer 3]
       │
       ├── Clinician edits?
       │       └── Writes: AuditLog { action: "edit", changesDiff }
       │           Updates: DischargeRecord { lastEditedAt, lastEditedByUserId }
       │
       ├── Doctor finalises?
       │       └── Writes: AuditLog { action: "finalise" }
       │           Updates: DischargeRecord { status: "finalised" }
       │
       ├── Print / Export?
       │       └── Writes: AuditLog { action: "print" or "export" }
       │
       └── WhatsApp share?
               └── Writes: AuditLog { action: "export" }
                   Sends: Mode 2 plain text only
```

---

## 3. Role Enforcement Boundary

**Server-side only. Never client-side only.**

Every API endpoint that performs a role-sensitive action must:
1. Extract the authenticated user's role from the session / token
2. Validate the role against the permitted roles for that action
3. Return HTTP 403 Forbidden if the role is not permitted
4. Write an AuditLog entry on the attempt if applicable

| Endpoint Action             | Permitted Roles   |
|-----------------------------|-------------------|
| POST /discharge/new         | doctor, nurse     |
| GET /discharge/:id/mode1    | doctor, nurse     |
| GET /discharge/:id/mode2    | doctor, nurse, admin |
| PUT /discharge/:id/edit     | doctor, nurse     |
| POST /discharge/:id/finalise| doctor            |
| POST /discharge/:id/archive | doctor, admin     |
| GET /discharge/:id/export   | doctor, nurse     |
| GET /audit/:recordId        | admin             |
| GET /discharge/:id/translation | doctor, nurse, admin |

**Client-side role checks are for UX only** (showing/hiding buttons).
They are never the security boundary.

---

## 4. Offline-First Form Caching

Nigerian hospitals frequently have intermittent power and internet. The input
form must handle connectivity loss gracefully.

**Requirements:**
- The form must cache its current state locally on the device after every
  field change
- If the connection drops mid-form, the cached state must survive a page
  reload or app restart
- When connectivity is restored, the form must resume from the cached state
  without data loss
- The "Generate" button must be disabled and clearly labelled when offline
- The form must never silently discard data on connectivity loss
- Cache must be cleared after successful submission and record creation

**Offline states the UI must handle:**

| State               | UI Behaviour                                                    |
|---------------------|-----------------------------------------------------------------|
| Online              | Normal — all actions available                                  |
| Offline (drafting)  | Form available; Generate button disabled; banner: "You are offline — form is saved locally" |
| Reconnected         | Banner: "Connection restored — your draft is ready to submit"  |
| Submit while offline| Block submission; show: "Please reconnect to generate the discharge record" |

---

## 5. Output Delivery Channels

### 5.1 Screen / In-App Display
- Mode 1 and Mode 2 displayed side-by-side (desktop) or as switchable tabs (mobile)
- Translated output shown as a third tab if available
- Amber warning banner if any fields were flagged as missing or inconsistent

### 5.2 Printable PDF / Paper Handout
- Primary printable output: **Mode 2 only** — not Mode 1
- Header: facility name · patient name · discharge date · clinician name
- Translated version printed below English version on the same sheet
- Generous line spacing; short paragraphs; suitable for A4 paper
- Mode 1 available as a separate clinical PDF for Doctor role only

### 5.3 WhatsApp / SMS
- **Mode 2 only** — Mode 1 must never be sent via unencrypted messaging
- Strip all section separator lines (`──────`)
- Plain paragraph breaks only
- Max 3–4 lines per section
- Medications as numbered plain-text list, one per line
- Always end with the red flag / when-to-return message
- AuditLog entry required on every share action (action: `export`)

---

## 6. Performance and Reliability Targets

| Metric                                  | Target                                    |
|-----------------------------------------|-------------------------------------------|
| AI generation time (Mode 1 + Mode 2)    | Under 15 seconds on a 4G connection       |
| Form submission → output render         | Under 20 seconds end-to-end               |
| System uptime (operating hours)         | ≥99% during 06:00–22:00 WAT               |
| Minimum supported device                | Android 8.0, 2GB RAM, 3G/4G connection    |
| Concurrent users per hospital instance  | ≥50 without degradation                   |
| Form cache survival (connectivity loss) | 100% — no data loss on reconnect          |

---

## 7. Security Architecture (Summary)

Full specification: `.agents/security.md`

- All patient data encrypted in transit: TLS 1.3 minimum
- All patient data encrypted at rest: AES-256 minimum
- Role-based access control: server-side only
- NDPR 2019: data residency within Nigeria required
- IP address logged on every AuditLog entry
- Generation metadata stored in DischargeRecord; never exposed in patient output

---

## Constraints

- Do not implement EHR integration (v1.1 scope)
- Do not implement ambient voice capture (v1.1 scope)
- Do not enforce role-based access on the client side only
- Do not send Mode 1 via WhatsApp or any unencrypted channel
- Do not allow form submission when offline
- Do not skip AuditLog entries for any delivery channel action
- Do not merge Mode 1 and Mode 2 into a single output document

---

*CareFlow AI — Architecture Overview v1.0*
*Internal use only.*
