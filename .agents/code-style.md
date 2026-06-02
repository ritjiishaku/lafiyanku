# Code Style and Conventions
# File: /.agents/code-style.md
# Version: 1.0
# Last Updated: June 2026
# PRD Reference: CFW-PRD-001 v1.0
# Purpose: Coding standards, naming conventions, error handling patterns, and API response structure.

---

## 1. Naming Conventions

### Schema Fields — camelCase (always)

All schema field names use camelCase exactly as defined in the schemas.
Never use snake_case, PascalCase, or kebab-case for field names.

```ts
// ✅ Correct
patientId
facilityName
admissionDate
dischargeDate
clinicalSummary
patientFriendlyOutput
generatedByUserId
translationConfidence
missingFieldsLog

// ❌ Wrong
patient_id
FacilityName
admission_date
discharge_date
clinical_summary
patient_friendly_output
```

### Enums — lowercase string literals (always)

```ts
// ✅ Correct
status: "draft" | "finalised" | "archived"
userRole: "doctor" | "nurse" | "admin"
action: "generate" | "edit" | "view" | "finalise" | "archive" | "print" | "export"
translationLanguage: "en" | "ha" | "yo" | "ig"
translationConfidence: "high" | "low" | "failed"
gender: "Male" | "Female" | "Other"

// ❌ Wrong
status: "Draft" | "FINALISED"
userRole: "Doctor" | "NURSE"
```

### Components — PascalCase

```ts
// ✅ Correct
PatientInputForm
DischargeOutputPanel
MedicationRow
AuditLogTable
TranslationPanel
RedFlagWarnings
```

### Functions and handlers — camelCase with descriptive verb prefix

```ts
// ✅ Correct
handleFormSubmit()
triggerAiGeneration()
finaliseRecord()
writeAuditLog()
fetchDischargeRecord()
prepareWhatsAppText()
generatePrintOutput()

// ❌ Wrong
submit()
generate()
finalise()
audit()
```

### Constants — SCREAMING_SNAKE_CASE

```ts
// ✅ Correct
const PROMPT_VERSION = "v2.0"
const MAX_GENERATION_TIMEOUT_MS = 15000
const SUPPORTED_LANGUAGES = ["en", "ha", "yo", "ig"]
const REQUIRED_PATIENT_FIELDS = [...]
```

### Environment variables — SCREAMING_SNAKE_CASE with CFW_ prefix

```
CFW_AI_API_KEY
CFW_AI_MODEL_VERSION
CFW_AI_PROMPT_VERSION
CFW_DB_URL
CFW_JWT_SECRET
CFW_ENCRYPTION_KEY
CFW_ALLOWED_ORIGIN
CFW_MAX_CONCURRENT_USERS
```

---

## 2. File and Folder Structure

```
/
├── AGENTS.md
├── docs/
│   ├── CareFlow_PRD_v1.0.md
│   └── CareFlow_AI_System_Prompt_v2.md
├── .agents/
│   ├── architecture.md
│   ├── code-style.md
│   ├── design-system.md
│   ├── security.md
│   ├── skills/
│   │   ├── patient-input-form.md
│   │   ├── ai-generation.md
│   │   ├── translation.md
│   │   ├── export-print.md
│   │   ├── whatsapp-share.md
│   │   └── audit-log.md
│   ├── workflows/
│   │   ├── new-discharge.md
│   │   ├── finalise-record.md
│   │   ├── print-share.md
│   │   └── translation-request.md
│   ├── schemas/
│   │   ├── patient-input.md
│   │   ├── discharge-record.md
│   │   ├── translation-request.md
│   │   └── audit-log.md
│   └── compliance/
│       ├── ndpr.md
│       └── fmoh.md
├── src/
│   ├── components/
│   │   ├── forms/
│   │   ├── output/
│   │   ├── audit/
│   │   └── shared/
│   ├── services/
│   │   ├── ai-generation.ts
│   │   ├── translation.ts
│   │   ├── audit-log.ts
│   │   ├── export.ts
│   │   └── auth.ts
│   ├── api/
│   │   ├── discharge/
│   │   ├── translation/
│   │   └── audit/
│   ├── schemas/
│   │   ├── patient-input.schema.ts
│   │   ├── discharge-record.schema.ts
│   │   ├── translation-request.schema.ts
│   │   └── audit-log.schema.ts
│   └── types/
│       └── index.ts
```

---

## 3. Error Handling

### Rule: Never swallow errors silently.

Every error must surface to the user with a clear, actionable message.
Every error must be logged server-side with enough context to debug.

### Pattern — API Error Response

All API errors return a consistent JSON structure:

```json
{
  "success": false,
  "error": {
    "code": "MISSING_REQUIRED_FIELD",
    "message": "Medication dosage was not provided. Please verify before generating.",
    "details": {
      "field": "medications[0].dosage"
    }
  },
  "timestamp": "2026-06-02T10:30:00Z"
}
```

### Error Code Reference

| Code                        | Meaning                                                   |
|-----------------------------|-----------------------------------------------------------|
| `MISSING_REQUIRED_FIELD`    | A required PatientInput field was not provided            |
| `INVALID_FIELD_VALUE`       | A field value does not match its type or enum             |
| `ROLE_NOT_PERMITTED`        | The user's role does not permit this action               |
| `RECORD_NOT_FINALISED`      | Action requires a finalised record; record is still draft |
| `GENERATION_FAILED`         | AI generation engine returned an error                    |
| `TRANSLATION_FAILED`        | Translation returned failed confidence                    |
| `TRANSLATION_LOW_CONFIDENCE`| Translation returned low confidence — fallback to English |
| `RECORD_NOT_FOUND`          | DischargeRecord ID does not exist                         |
| `AUDIT_LOG_WRITE_FAILED`    | AuditLog entry could not be written — treat as critical   |

### Pattern — Validation Error (Form)

Field-level errors appear directly below the offending field:

```
[Field label]
[Field input — red border]
⚠ [Specific error message for this field]
```

Example:
```
Diagnosis *
[empty input — red border]
⚠ Diagnosis is required. Please enter the primary diagnosis before generating.
```

### Pattern — Generation Warning Banner

When the AI flags missing or inconsistent fields during generation,
display an amber banner above the output:

```
⚠ The following fields were not provided and may affect output quality:
  · Follow-up instructions — not provided
  · NHIS number — not provided (optional but recommended)
Please review the output carefully before finalising.
```

---

## 4. API Response Structure

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-06-02T10:30:00Z"
}
```

### Paginated Response (for audit log)

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "pageSize": 50,
    "total": 312
  },
  "timestamp": "2026-06-02T10:30:00Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ROLE_NOT_PERMITTED",
    "message": "Only a Doctor can finalise a discharge record."
  },
  "timestamp": "2026-06-02T10:30:00Z"
}
```

---

## 5. Role-Based Access Control Implementation

### Server-side guard pattern (pseudocode)

```ts
function requireRole(permittedRoles: UserRole[]) {
  return (req, res, next) => {
    const userRole = req.user?.role
    if (!userRole || !permittedRoles.includes(userRole)) {
      writeAuditLog({
        action: "view",  // or the relevant action
        userId: req.user?.id ?? "unauthenticated",
        userRole: userRole ?? "unknown",
        recordId: req.params.id,
        notes: `Unauthorised access attempt — required: ${permittedRoles.join(", ")}`
      })
      return res.status(403).json({
        success: false,
        error: {
          code: "ROLE_NOT_PERMITTED",
          message: `This action requires one of: ${permittedRoles.join(", ")}.`
        }
      })
    }
    next()
  }
}

// Usage
router.post("/discharge/:id/finalise", requireRole(["doctor"]), finaliseRecord)
router.get("/audit/:recordId", requireRole(["admin"]), getAuditLog)
```

**Rule:** Client-side role checks (hiding buttons, disabling inputs) are for
UX only. They are never the security boundary. The server must always
re-validate the role before executing any role-sensitive action.

---

## 6. AuditLog Write Rule

**Every action on a DischargeRecord must produce an AuditLog entry.**
This is not optional. If an AuditLog write fails, treat it as a critical error:
log it to the system error logger, surface it to the admin, and do not silently
proceed as if the action was unlogged.

```ts
// Every service function that mutates a DischargeRecord must call this
async function writeAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    await db.auditLog.create({ data: entry })
  } catch (err) {
    // Critical — never swallow this
    systemErrorLogger.critical("AUDIT_LOG_WRITE_FAILED", { entry, err })
    throw new Error("AUDIT_LOG_WRITE_FAILED")
  }
}
```

---

## 7. Date and Timestamp Standards

- All dates stored as ISO 8601: `YYYY-MM-DD` for dates, `YYYY-MM-DDTHH:mm:ssZ` for datetimes
- All datetimes stored in UTC
- `admissionDate` and `dischargeDate` are always stored and displayed as separate fields
- Never merge admissionDate and dischargeDate into a single `date` field
- Display dates to Nigerian users in DD/MM/YYYY format in the UI

---

## 8. Generation Metadata Rule

The following fields must be stored on every DischargeRecord at generation time:

```ts
{
  promptVersion: process.env.CFW_AI_PROMPT_VERSION,  // e.g. "v2.0"
  modelVersion: process.env.CFW_AI_MODEL_VERSION,
  generatedAt: new Date().toISOString(),
  generatedByUserId: req.user.id
}
```

**These fields must never appear in:**
- Mode 2 patient-friendly output
- Translated output
- Printed patient handouts
- WhatsApp-shared text

They are for internal record-keeping and compliance only.

---

## Constraints

- Never use snake_case for schema field names
- Never use client-side logic as the sole role enforcement mechanism
- Never swallow errors silently — every error surfaces to the user and is logged
- Never merge admissionDate and dischargeDate into a single field
- Never expose generation metadata (promptVersion, modelVersion, generatedAt,
  generatedByUserId) in patient-facing output
- Never skip an AuditLog entry — treat AuditLog write failures as critical errors
- Never use a date format other than ISO 8601 in storage

---

*CareFlow AI — Code Style v1.0*
*Internal use only.*
