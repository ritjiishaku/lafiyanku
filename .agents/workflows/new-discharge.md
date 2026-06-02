# New Discharge Workflow
# File: /.agents/workflows/new-discharge.md
# Version: 1.0
# Last Updated: June 2026
# PRD Reference: CFW-PRD-001 v1.0
# Purpose: Step-by-step agent instructions for the end-to-end New Discharge workflow.

---

## Overview

This is the primary workflow in CareFlow AI. It covers everything from the
clinician opening the form to the generated output being available for
review. Every step that writes to the database is labelled [DB WRITE].

**Permitted roles:** Doctor · Nurse
**Starting point:** Authenticated user clicks "New Discharge"
**End point:** DischargeRecord (status: draft) is displayed for review

---

## Step-by-Step Workflow

### Step 1 — Role Check

```
IF user.role NOT IN ["doctor", "nurse"]
  → Return HTTP 403
  → [DB WRITE] AuditLog { action: "view", notes: "Unauthorised access attempt to New Discharge." }
  → Display: "You do not have permission to create discharge records."
  → STOP
END IF
```

### Step 2 — Load the PatientInput Form

- Render the PatientInput form in the order defined in `.agents/skills/patient-input-form.md`
- Check for a locally cached draft for the authenticated user:

```
IF local cache exists for user.id AND user.facilityId
  → Restore cached field values into the form
  → Show banner: "Your previous draft has been restored."
ELSE
  → Render empty form
END IF
```

- Set `languageRequested` default to `en`
- Generate a provisional `patientId` (UUID) client-side for cache keying

### Step 3 — Clinician Fills the Form

- Cache form state after every field change (debounced 500ms)
- Show `(optional)` label on all optional fields
- Show `*` on all required fields
- Validate `dischargeDate ≥ admissionDate` on blur — show inline error if not

### Step 4 — Online / Offline Check

```
IF device is offline
  → Disable "Generate Discharge Record" button
  → Show amber banner: "You are offline — your form is saved locally. Reconnect to generate."
  → STOP (wait for reconnection)
ELSE
  → Enable "Generate Discharge Record" button
END IF
```

### Step 5 — Client-Side Validation (on Generate click)

Validate all required fields client-side:

```
FOR EACH required field in PatientInput
  IF field is empty or invalid
    → Mark field with red border
    → Show field-specific error message below field
    → Add field to errorList
  END IF
END FOR

IF errorList is not empty
  → Scroll to first error field
  → Do NOT submit the form
  → STOP
END IF
```

Required fields: `facilityName`, `patientName`, `age`, `gender`,
`hospitalNumber`, `admissionDate`, `dischargeDate`, `diagnosis`,
`treatmentGiven`, `dischargedBy`, and at least one medication row with
`name`, `dosage`, and `frequency`.

### Step 6 — Form Submission

- Set Generate button to loading state: "Generating…" + spinner
- Disable form inputs during generation
- Submit PatientInput payload to server:

```
POST /discharge/generate
Body: { patientInput: { ...allFields } }
Headers: { Authorization: Bearer [token] }
```

### Step 7 — Server-Side Validation

```
IF any required field fails server-side validation
  → Return HTTP 400 with error details
  → Re-enable form
  → Display field-level errors from server response
  → STOP
END IF
```

### Step 8 — AI Generation

Server calls AI generation engine with validated PatientInput + prompt v2.0.

```
IF generation times out (> 15 seconds)
  → Return HTTP 504
  → Display: "Generation timed out. Please check your connection and try again."
  → Re-enable form
  → STOP

IF generation returns an error
  → Return HTTP 500
  → Display: "Generation failed. Please try again. If the problem persists, contact support."
  → Log error to system error logger
  → Re-enable form
  → STOP
END IF
```

### Step 9 — Write DischargeRecord [DB WRITE]

```
INSERT DischargeRecord {
  recordId:              generateUUID()
  patientInputId:        patientInput.patientId
  generatedAt:           now() UTC
  generatedByUserId:     user.id
  promptVersion:         "v2.0"
  modelVersion:          response.modelVersion
  clinicalSummary:       response.data.clinicalSummary
  patientFriendlyOutput: response.data.patientFriendlyOutput
  translatedOutput:      response.data.translatedOutput ?? null
  translationLanguage:   response.data.translationLanguage ?? null
  translationConfidence: response.data.translationConfidence ?? null
  missingFieldsLog:      response.data.missingFieldsLog
  flaggedIssues:         response.data.flaggedIssues
  status:                "draft"
  lastEditedAt:          null
  lastEditedByUserId:    null
}
```

### Step 10 — Write AuditLog [DB WRITE]

```
INSERT AuditLog {
  logId:       generateUUID()
  recordId:    DischargeRecord.recordId
  userId:      user.id
  userRole:    user.role
  action:      "generate"
  timestamp:   now() UTC
  ipAddress:   request.ip
  changesDiff: null
  notes:       "Generation successful. promptVersion: v2.0. modelVersion: [value].
                Translation: [languageRequested]. Confidence: [translationConfidence]."
}
```

### Step 11 — Handle missingFieldsLog [CONDITIONAL]

```
IF DischargeRecord.missingFieldsLog is non-empty
  → Display amber banner above output:
    "⚠ The following fields were not provided and may affect output quality:
     · [field 1]
     · [field 2]
    Please review the output carefully before finalising."
END IF
```

### Step 12 — Handle flaggedIssues [CONDITIONAL]

```
IF DischargeRecord.flaggedIssues is non-empty
  → Display amber banner above output:
    "⚠ The following inconsistencies were detected:
     · [issue 1]
    Please review and correct before finalising."
END IF
```

### Step 13 — Handle Translation Confidence [CONDITIONAL]

```
IF translationConfidence IN ["low", "failed"]
  → Display amber banner on translation tab:
    "⚠ Translation into [language] could not be completed with sufficient confidence.
    The English version has been provided instead."
END IF
```

### Step 14 — Display Output

- Render Mode 1 and Mode 2 as switchable tabs (mobile) or side-by-side panels (desktop)
- If translated output exists AND confidence is "high":
  → Render as a third tab: "[Language] Instructions"
- If translated output exists AND confidence is "low" or "failed":
  → Render tab with amber badge: "[Language] Instructions ⚠"
- Clear the local form cache
- Re-enable all UI controls

### Step 15 — Inline Editing [CONDITIONAL]

```
IF clinician edits any output field
  → [DB WRITE] UPDATE DischargeRecord {
      lastEditedAt:        now() UTC
      lastEditedByUserId:  user.id
      [edited field]:      new value
    }
  → [DB WRITE] INSERT AuditLog {
      action:      "edit"
      changesDiff: { [fieldName]: { before: oldValue, after: newValue } }
    }
END IF
```

### Step 16 — Save-as-Draft

The record is already saved as a draft (status: "draft") from Step 9.
No separate action is required. Workflow ends here.

Finalisation is handled in the separate Finalise Record workflow:
`.agents/workflows/finalise-record.md`

---

## Error Branch Summary

| Error Condition            | Response                                                    |
|----------------------------|-------------------------------------------------------------|
| Wrong role                 | HTTP 403; AuditLog; "No permission" message                 |
| Device offline             | Disable generate; amber banner; wait                        |
| Client validation failure  | Inline field errors; scroll to first error; do not submit   |
| Server validation failure  | HTTP 400; field errors from server; re-enable form          |
| Generation timeout         | HTTP 504; timeout message; re-enable form; no DB writes     |
| Generation failure         | HTTP 500; error message; system log; no DB writes           |
| AuditLog write failure     | Critical error; system alert; do not proceed silently       |

---

## Constraints

- Never trigger generation without passing both client and server validation
- Never set DischargeRecord status to anything other than `draft` on creation
- Never expose promptVersion, modelVersion, generatedAt, or generatedByUserId
  in the output panel shown to clinicians or patients
- Never skip AuditLog write after successful generation
- Never skip DischargeRecord write after successful generation
- Never allow Admin role to access this workflow
- Never clear the local form cache before successful server acknowledgement
- Never allow the form to submit while the device is offline

---

*CareFlow AI — New Discharge Workflow v1.0*
