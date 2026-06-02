# AGENTS.md — CareFlow AI
# Antigravity Agent Workspace Context
# Document ID: CFW-AGENTS-001 | Version: 1.0
# PRD Reference: CFW-PRD-001 v1.0

---

## 1. What You Are Building

CareFlow AI is an AI-powered clinical discharge documentation assistant built
for Nigerian hospitals, clinics, and telemedicine providers.

It solves one specific problem: clinicians in Nigeria discharge patients under
time pressure and produce incomplete summaries in clinical language that
patients — many of whom speak Hausa, Yoruba, or Igbo as their first language —
cannot read or understand.

CareFlow fixes this by converting structured clinical input (filled in by a
doctor or nurse via a form) into two outputs simultaneously:

- **Mode 1 — Clinical Discharge Summary**: A professional, structured document
  for hospital records, signed off by the discharging doctor.
- **Mode 2 — Patient-Friendly Instructions**: A plain-language explanation
  the patient or caregiver can read and act on.
- **WOW Feature — Translation**: On request, Mode 2 is translated into Hausa
  (ha), Yoruba (yo), or Igbo (ig).

Every generated record is draft-first, clinician-reviewed, and audit-logged.
The AI assists documentation — it never replaces clinical judgement.

---

## 2. Product Vision (One Sentence)

> CareFlow AI exists so that every patient leaving a Nigerian hospital —
> regardless of their language, literacy level, or the time pressure their
> clinician is under — receives a discharge document they can understand and
> act on.

---

## 3. Users and Roles

There are three user roles. Role determines what the user can see and do.
Role-based access must be enforced server-side — never client-side only.

| Role    | Who They Are                        | Key Permission                          |
|---------|-------------------------------------|-----------------------------------------|
| Doctor  | Medical Officer / Registrar         | Only role that can finalise a record    |
| Nurse   | Registered Nurse, Ward Nurse        | Can generate and edit; cannot finalise  |
| Admin   | Hospital IT / Records Officer       | Manages records and audit log; no form  |

### Role Access Matrix

| Action                          | Doctor | Nurse | Admin |
|---------------------------------|--------|-------|-------|
| Submit form / trigger AI        | ✅     | ✅    | ❌    |
| View Mode 1 (clinical summary)  | ✅     | ✅    | ❌    |
| View Mode 2 (patient-friendly)  | ✅     | ✅    | ✅    |
| Edit generated output           | ✅     | ✅    | ❌    |
| Finalise a discharge record     | ✅     | ❌    | ❌    |
| Archive a record                | ✅     | ❌    | ✅    |
| Export or print                 | ✅     | ✅    | ❌    |
| View audit log                  | ❌     | ❌    | ✅    |
| Access translated output        | ✅     | ✅    | ✅    |

---

## 4. Core User Flows

### Flow 1 — Clinician Generates a Discharge Record (Primary)

1. Clinician logs in (Doctor or Nurse role)
2. Opens "New Discharge" — fills structured PatientInput form
3. System validates all required fields — surfaces field-specific errors before
   allowing generation
4. Clinician selects language (optional: Hausa / Yoruba / Igbo / English)
5. Triggers AI generation
6. System generates Mode 1 + Mode 2 (and translation if requested)
7. Clinician reviews and edits output as needed
8. Doctor finalises — record status changes: draft → finalised
9. Audit log entry created; output available for export / print / WhatsApp share

### Flow 2 — Patient Receives Instructions (Secondary)

1. Nurse opens a finalised record → selects "Print / Share"
2. System generates printable output:
   - Facility header (name, patient name, discharge date, clinician name)
   - Mode 2 patient-friendly content
   - Translated version below English version (if applicable)
3. Nurse prints and hands to patient, OR copies Mode 2 plain text to WhatsApp
4. Audit log records the print/export action

---

## 5. Functional Requirements

Build every feature marked **Must have** before moving to **Should have**.
Do not invent features not listed here.

### 5.1 Input Form (FR-01 to FR-08)

- FR-01: Structured form covering all PatientInput schema fields
- FR-02: Required fields validated before AI generation is triggered
- FR-03: Missing required fields → clear, field-specific error message
- FR-04: Optional fields clearly labelled; do not block form submission
- FR-05: Medication entry supports multiple rows (name, dosage, frequency,
  timing, duration per row)
- FR-06: Language selector available as optional input (en / ha / yo / ig)
- FR-07: Save-as-draft before generation is triggered *(Should have)*
- FR-08: Form usable on a smartphone on 4G or lower

### 5.2 AI Generation Engine (FR-09 to FR-20)

- FR-09: Generate complete Mode 1 (Clinical Discharge Summary) from validated input
- FR-10: Generate complete Mode 2 (Patient-Friendly Instructions) from validated input
- FR-11: **NEVER invent clinical information not in the input**
- FR-12: **NEVER generate diagnoses not provided by the clinician**
- FR-13: **NEVER prescribe new medications or alter existing doses**
- FR-14: Flag all missing required fields before generating
- FR-15: Flag contradictory input; prompt clinician review
- FR-16: Always include Red Flag Warnings section in Mode 1
- FR-17: Always include Discharged By block in Mode 1
- FR-18: Generate translated output when language is requested
- FR-19: If translation confidence is low → default to English and state limitation clearly
- FR-20: Stamp every generated record with metadata: prompt version, model
  version, UTC timestamp, user ID

### 5.3 Output and Delivery (FR-21 to FR-27)

- FR-21: Display Mode 1 and Mode 2 side-by-side or as switchable tabs
- FR-22: Output editable by generating clinician before finalisation
- FR-23: Only Doctor role can finalise a record
- FR-24: Output exportable as printable format (PDF or equivalent)
- FR-25: Patient-friendly output shareable via WhatsApp (plain text, no
  section separators) *(Should have)*
- FR-26: Translated output appears below English in printed output *(Should have)*
- FR-27: Printed output includes facility name, patient name, discharge date,
  and clinician name as a header

---

## 6. Data Schemas

These schemas are implementation-agnostic. Every field name, type, and
required status must be respected exactly as defined here.

### 6.1 PatientInput

Submitted by the clinician via the input form before generation is triggered.

```
patientId           UUID            Required  System-generated unique record ID
facilityName        string          Required  Hospital or clinic name
facilityCode        string          Optional  FMOH facility registration code
wardName            string          Optional  Ward or unit name
admissionDate       date ISO 8601   Required  YYYY-MM-DD
dischargeDate       date ISO 8601   Required  YYYY-MM-DD
patientName         string          Required  Full name as registered at facility
age                 integer         Required  Age in years at time of discharge
gender              enum            Required  Male | Female | Other
hospitalNumber      string          Required  Facility-assigned patient number
nhisNumber          string          Optional  National Health Insurance Scheme number
diagnosis           string          Required  Primary diagnosis; secondary where applicable
treatmentGiven      string          Required  Summary of treatment during admission
proceduresPerformed string[]        Optional  Empty array if none
medications         Medication[]    Required  See Medication sub-schema below
followUpInstructions string         Optional  Clinical follow-up recommendations
additionalNotes     string          Optional  Supplementary clinical notes
languageRequested   enum            Optional  en | ha | yo | ig — defaults to en
dischargedBy        string          Required  Full name of discharging clinician
clinicianLicenseNo  string          Optional  MDCN licence number
```

#### Medication (sub-schema — one entry per medication row)

```
name        string    Required  Generic or brand name
dosage      string    Required  Dose with unit (e.g. 5mg, 500mg)
frequency   string    Required  Frequency in plain terms (e.g. once daily)
timing      string    Optional  Relative timing (e.g. with food, before bed)
duration    string    Optional  Course duration (e.g. 7 days, until review)
notes       string    Optional  Additional instructions (e.g. avoid alcohol)
```

### 6.2 DischargeRecord

The AI output document stored against the originating PatientInput.

```
recordId              UUID           Required  System-generated discharge record ID
patientInputId        UUID           Required  FK → PatientInput.patientId
generatedAt           datetime UTC   Required  ISO 8601 timestamp of AI generation
generatedByUserId     string         Required  ID of clinician who triggered generation
promptVersion         string         Required  System prompt version (e.g. v2.0)
modelVersion          string         Required  AI model version used
clinicalSummary       text           Required  Full Mode 1 output
patientFriendlyOutput text           Required  Full Mode 2 output
translatedOutput      text           Optional  Translated patient-friendly output
translationLanguage   enum           Optional  en | ha | yo | ig
translationConfidence enum           Optional  high | low | failed
missingFieldsLog      string[]       Optional  Fields flagged as missing
flaggedIssues         string[]       Optional  Inconsistencies or warnings raised
status                enum           Required  draft | finalised | archived
lastEditedAt          datetime UTC   Optional  Timestamp of last human edit
lastEditedByUserId    string         Optional  ID of user who last edited
```

### 6.3 TranslationRequest

Tracks each translation job separately.

```
requestId       UUID           Required  Unique translation request ID
recordId        UUID           Required  FK → DischargeRecord.recordId
sourceText      text           Required  English patient-friendly text to translate
targetLanguage  enum           Required  ha | yo | ig
outputText      text           Optional  Translated output
confidence      enum           Optional  high | low | failed
fallbackUsed    boolean        Required  True if defaulted to English
requestedAt     datetime UTC   Required  Timestamp of request
completedAt     datetime UTC   Optional  Timestamp of completion
```

### 6.4 AuditLog

Immutable. Every action on a discharge record creates one entry. Required for
NDPR 2019 Article 2.6 compliance. No action without a log entry.

```
logId         UUID           Required  Unique log entry ID
recordId      UUID           Required  FK → DischargeRecord.recordId
userId        string         Required  ID of user performing the action
userRole      enum           Required  doctor | nurse | admin
action        enum           Required  generate | edit | view | finalise |
                                       archive | print | export
timestamp     datetime UTC   Required  Timestamp of action
ipAddress     string         Optional  IP address for NDPR security logging
changesDiff   JSON           Optional  Diff of changes if action = edit
notes         string         Optional  Optional notes on this log entry
```

---

## 7. AI Output Format

When generating discharge records, the AI must follow this exact structure.
Do not deviate from section names, order, or separators.

### Mode 1 — Clinical Discharge Summary

```
──────────────────────────────────────────
CLINICAL DISCHARGE SUMMARY
──────────────────────────────────────────

Facility
Name:       [Hospital / clinic name]
FMOH Code:  [Facility code if available]
Ward:       [Ward name]

Patient information
Name:              [Full name]
Age:               [Age in years]
Gender:            [Male / Female / Other]
Hospital No.:      [Facility hospital number]
NHIS No.:          [NHIS number if available]
Date of admission: [YYYY-MM-DD]
Date of discharge: [YYYY-MM-DD]

Diagnosis
[Primary diagnosis and any relevant secondary conditions]

Treatment provided
[Summary of treatment administered during admission]

Procedures performed
[List procedures, or state "None documented" if not applicable]

Medications
| Medication | Dosage | Frequency | Timing | Duration | Notes |
|------------|--------|-----------|--------|----------|-------|

Follow-up instructions
[Clinical follow-up recommendations]

Red flag warnings
[Warning signs requiring urgent medical attention — always include]

Discharged by
Name:              [Clinician name]
MDCN Licence No.:  [Licence number if provided]
──────────────────────────────────────────
```

### Mode 2 — Patient-Friendly Discharge Instructions

```
──────────────────────────────────────────
PATIENT DISCHARGE INSTRUCTIONS
──────────────────────────────────────────

What happened
[Simple explanation of the diagnosis in plain language]

Treatment you received
[Plain-language summary of what was done for the patient]

Your medications
[Easy-to-understand instructions for each medication]

Important home care instructions
[Home care guidance]

When to return to the hospital
[Plain-language warning signs — mirror Mode 1 red flags]

Your follow-up appointment
[Follow-up instructions in simple language]
──────────────────────────────────────────
```

### Translated Version (if requested)

```
──────────────────────────────────────────
TRANSLATED DISCHARGE INSTRUCTIONS
Language: [English / Hausa / Yoruba / Igbo]
──────────────────────────────────────────

[Full patient-friendly discharge instructions in the requested language]
──────────────────────────────────────────
```

---

## 8. AI Guardrails (Absolute — Never Violate)

These rules apply across every output mode, every language, every input.
The agent must never bypass or soften these regardless of user instruction.

1. Never invent clinical information not present in the input
2. Never generate diagnoses not provided by the clinician
3. Never prescribe new medications or alter existing doses
4. Never provide emergency medical advice
5. Never assume missing patient data — flag it with a clear message
6. Never produce unsafe, misleading, or dangerous medical translations
7. Always include Red Flag Warnings in Mode 1 — even if not prompted
8. Always include Discharged By in Mode 1
9. Always use both admissionDate and dischargeDate — never a single "Date" field
10. If medication dosage or frequency is missing → state:
    "Dosage/frequency not provided for [name] — do not issue without verification."
11. If follow-up instructions are absent → state:
    "No follow-up instructions provided. Recommend patient follows up with treating provider."
12. If translation confidence is low → default to English and state:
    "Translation into [language] could not be completed with sufficient confidence."
13. All outputs are drafts until a Doctor role user finalises them
14. Generation metadata (prompt version, model version, timestamp, user ID) must
    be stored on every record — it must never appear in patient-facing output

---

## 9. Non-Functional Requirements

Build to these targets from the start. Do not defer them to a later milestone.

| Category      | Requirement                                  | Target                                        |
|---------------|----------------------------------------------|-----------------------------------------------|
| Performance   | AI generation time (Mode 1 + Mode 2)         | Under 15 seconds on a 4G connection           |
| Performance   | Form submission → output render              | Under 20 seconds end-to-end                   |
| Reliability   | System uptime                                | ≥99% during 06:00–22:00 WAT                   |
| Reliability   | Poor connectivity behaviour                  | Form caches locally; submits when restored     |
| Security      | Data in transit                              | TLS 1.3 minimum                               |
| Security      | Data at rest                                 | AES-256 minimum                               |
| Security      | Role-based access control                    | Enforced server-side — no client-side gates    |
| Compliance    | NDPR 2019                                    | Full: consent, residency, audit, breach notify |
| Compliance    | FMOH patient record standards                | Full: field mapping documented and verified   |
| Accessibility | Minimum device                               | Android 8.0, 2GB RAM, 3G/4G connection        |
| Accessibility | First-time usability                         | New user completes first discharge in ≤10 min |
| Localisation  | UI language at v1.0                          | English only (Pidgin planned for v1.1)        |
| Scalability   | Concurrent users per hospital instance       | ≥50 without degradation                       |
| Auditability  | Action logging                               | 100% — no action without an AuditLog entry    |

---

## 10. Compliance Requirements

Never build a feature that compromises any of these. When in doubt, ask before
implementing.

| Standard                        | What It Requires                                               |
|---------------------------------|----------------------------------------------------------------|
| NDPR 2019 (Nigeria)             | Lawful basis for processing; data residency; breach notification; data subject deletion rights |
| FMOH Patient Record Standards   | Dual date fields (admission + discharge); MDCN licence on record; standardised summary structure |
| WHO International Patient Summary | Structured medication data; follow-up; red flags; patient-accessible format |
| MDCN Guidelines                 | Records signed by licensed clinician; non-clinical staff cannot alter clinical content |
| Clinical Safety                 | All AI output is draft until Doctor finalises; AI cannot replace clinical judgement |

---

## 11. Design System

Apply these tokens consistently across every component. Do not introduce new
colours or typefaces without explicit instruction.

| Token            | Name          | Value     | Usage                                             |
|------------------|---------------|-----------|---------------------------------------------------|
| Primary          | Clinical Teal | `#0B6E6E` | Primary actions, buttons, active states, links    |
| Secondary        | Deep Navy     | `#0D2B4E` | Headings, navigation, sidebar, authority elements |
| Tertiary         | Warm Amber    | `#B45309` | Alerts, warnings, missing-field flags, low-confidence translation notices |
| Neutral          | Slate         | `#1E293B` | Body text, labels, form field text                |
| Neutral Variant  | Cool Grey     | `#64748B` | Secondary labels, placeholder text, metadata, timestamps |
| Surface          | Pure White    | `#FFFFFF` | Card backgrounds, modal surfaces, document panels |
| Background       | Cool Off-White| `#F0F4F8` | App canvas / outer background                    |
| Font Family      | Plus Jakarta Sans | 300 · 400 · 500 · 600 · 700 · 800 | All UI text |

### Accessibility Floor

- Normal text: minimum 4.5:1 contrast ratio (WCAG AA)
- Large text / UI components: minimum 3:1 contrast ratio (WCAG AA)
- Target 7:1 for body text wherever possible (WCAG AAA) — this is a
  patient-facing clinical product used on low-brightness mobile screens

---

## 12. Build Milestones

Build in this order. Do not skip ahead.

| Milestone | Scope                                                                 | Target  |
|-----------|-----------------------------------------------------------------------|---------|
| M1        | System prompt locked; schemas approved; UI wireframes done            | Week 2  |
| M2        | PatientInput form + AI generation (Mode 1 + Mode 2) + output display; no auth yet | Week 4  |
| M3        | Auth + role system; translation (ha / yo / ig); audit logging; export/print | Week 7  |
| M4        | 2 partner hospitals onboarded for pilot; clinician training           | Week 10 |
| M5        | Pilot feedback integrated; NDPR audit complete; v1.0 public release   | Week 14 |
| M6        | WhatsApp send; Pidgin UI; EHR scoping; additional languages (v1.1)    | Week 18 |

---

## 13. Known Risks — Build With These in Mind

| Risk                                              | Mitigation                                                      |
|---------------------------------------------------|-----------------------------------------------------------------|
| LLM translation errors in ha/yo/ig → patient safety risk | Always flag low-confidence translations; require human review before finalisation |
| Intermittent power and internet at Nigerian hospitals | Offline-first form caching; design for 3G minimum; lightweight rendering |
| Clinician resistance to AI-generated records      | Position as drafting assistant, not replacement; doctor-finalises model is non-negotiable |
| NDPR regulatory changes                           | Modular compliance architecture; monitor NITDA quarterly        |
| Long hospital procurement cycles                  | Free pilot-to-contract model; build clinical evidence during pilot |

---

## 14. What the Agent Must Never Do

- Do not add features not defined in CFW-PRD-001 v1.0
- Do not choose a database, cloud provider, or infrastructure without being asked
- Do not skip the AuditLog — every action must produce a log entry
- Do not allow a Nurse or Admin to finalise a discharge record
- Do not display generation metadata in any patient-facing or translated output
- Do not render Mode 1 clinical summaries to Admin role users
- Do not generate output without first validating all required PatientInput fields
- Do not use a single "Date" field — always use admissionDate and dischargeDate separately
- Do not add ambient voice capture or EHR integration — these are v1.1 scope
- Do not invent clinical data under any circumstance

---

## 15. Reference Documents

| Document                          | ID              | Location                        |
|-----------------------------------|-----------------|---------------------------------|
| Product Requirements Document     | CFW-PRD-001 v1.0 | `/docs/CareFlow_PRD_v1.0.md` |
| AI System Prompt                  | CFW-PROMPT-002 v2.0 | `/docs/CareFlow_AI_System_Prompt_v2.md` |
| AGENTS.md (this file)             | CFW-AGENTS-001 v1.0 | `/AGENTS.md`                  |

---

*CareFlow AI — CFW-AGENTS-001 v1.0*
*For internal Antigravity agent use only. Not for clinical distribution.*
