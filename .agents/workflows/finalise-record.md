# Finalise Record Workflow
# File: /.agents/workflows/finalise-record.md
# Version: 1.0
# Last Updated: June 2026
# PRD Reference: CFW-PRD-001 v1.0
# Purpose: Step-by-step agent instructions for the Finalise Record workflow.

---

## Overview

Finalisation is the act of a Doctor changing a DischargeRecord status from
`draft` to `finalised`. Only the Doctor role can perform this action.
Once finalised, the record becomes available for print, export, and
WhatsApp share. It can no longer be edited by a Nurse.

**Permitted roles:** Doctor only
**Starting point:** Doctor views a draft DischargeRecord
**End point:** DischargeRecord status = `finalised`; export/print/share enabled

---

## Step-by-Step Workflow

### Step 1 — Role Check (Server-Side)

```
IF user.role !== "doctor"
  → Return HTTP 403
  → [DB WRITE] AuditLog {
      action: "finalise",
      notes: "Unauthorised finalisation attempt. Role: [user.role]."
    }
  → Display: "Only a Doctor can finalise a discharge record."
  → STOP
END IF
```

This check must be performed server-side. Client-side hiding of the
Finalise button is UX only — not the security boundary.

### Step 2 — Record Existence Check

```
FETCH DischargeRecord WHERE recordId = params.id AND facilityId = user.facilityId

IF record not found
  → Return HTTP 404
  → Display: "This discharge record could not be found."
  → STOP
END IF
```

Multi-tenant isolation: always filter by `facilityId`. A Doctor from
Hospital A must never be able to finalise a record from Hospital B.

### Step 3 — Status Check

```
IF record.status !== "draft"
  → Return HTTP 400
  → Display appropriate message:
      IF record.status === "finalised"
        → "This record has already been finalised."
      IF record.status === "archived"
        → "This record has been archived and cannot be modified."
  → STOP
END IF
```

### Step 4 — Pre-Finalisation Completeness Check

Before allowing finalisation, check that all clinically critical sections
are present in the generated output. This is a server-side content check,
not a field-level form check.

```
CHECK clinicalSummary contains:
  - Facility section (facilityName present)
  - Patient information (patientName, admissionDate, dischargeDate present)
  - Diagnosis (non-empty)
  - Medications (at least one row)
  - Red Flag Warnings (non-empty)
  - Discharged By (dischargedBy name present)

IF any critical section is missing or empty
  → Do NOT block finalisation — warn the Doctor instead
  → Display amber banner:
    "⚠ The following sections appear incomplete:
     · [section name]
    You may still finalise, but please review carefully."
END IF
```

Note: Do NOT hard-block finalisation for missing optional sections.
The Doctor has clinical authority to finalise — the system advises, not overrides.

### Step 5 — Doctor Confirms Finalisation

Display a confirmation modal before executing finalisation:

```
┌──────────────────────────────────────────────────────────────┐
│  Finalise Discharge Record                                   │
│                                                              │
│  Patient: [patientName]                                      │
│  Discharge date: [dischargeDate]                             │
│  Clinician: [dischargedBy]                                   │
│                                                              │
│  By finalising, you confirm this record is clinically        │
│  accurate and ready for patient handover.                    │
│                                                              │
│  [Cancel]                    [Finalise Record]               │
└──────────────────────────────────────────────────────────────┘
```

- "Cancel" → close modal, return to record view, no DB writes
- "Finalise Record" → proceed to Step 6

### Step 6 — Write DischargeRecord Update [DB WRITE]

```
UPDATE DischargeRecord
SET status = "finalised"
WHERE recordId = params.id

→ Return updated DischargeRecord
```

### Step 7 — Write AuditLog [DB WRITE]

```
INSERT AuditLog {
  logId:       generateUUID()
  recordId:    params.id
  userId:      user.id
  userRole:    "doctor"
  action:      "finalise"
  timestamp:   now() UTC
  ipAddress:   request.ip
  changesDiff: {
    "status": {
      "before": "draft",
      "after": "finalised"
    }
  }
  notes: "Record finalised by discharging clinician. MDCN: [clinicianLicenseNo]."
}
```

### Step 8 — Post-Finalisation UI Update

After successful finalisation:

- Update the record status badge from amber `draft` to green `finalised`
- Enable the "Print / Share" button (previously disabled on draft records)
- Enable the "Export PDF" button
- Enable the "Share via WhatsApp" button
- Disable the inline edit controls for Nurse role (Doctor can still edit
  a finalised record — this creates a new `edit` AuditLog entry and resets
  status to `draft` — see Note below)
- Display a success toast: `"Record finalised successfully."`

### Note — Re-editing a Finalised Record

If a Doctor edits a finalised record:
- Status reverts to `draft` automatically
- An AuditLog entry is written: `action: "edit"` with `changesDiff`
- A second AuditLog entry is written for the status revert:
  `action: "edit"`, `changesDiff: { status: { before: "finalised", after: "draft" } }`
- The Doctor must re-finalise after editing

This ensures the audit trail always reflects the exact state at finalisation.

---

## Error Branch Summary

| Error Condition              | Response                                                          |
|------------------------------|-------------------------------------------------------------------|
| Wrong role (Nurse or Admin)  | HTTP 403; AuditLog; "Only a Doctor can finalise" message          |
| Record not found             | HTTP 404; "Record not found" message                              |
| Record already finalised     | HTTP 400; "Record is already finalised"                           |
| Record archived              | HTTP 400; "Record has been archived"                              |
| DB update fails              | HTTP 500; system error log; "Finalisation failed, try again"      |
| AuditLog write fails         | Critical error; system alert; do not proceed silently             |

---

## What Becomes Available After Finalisation

| Feature                   | Available After Finalise? | Notes                            |
|---------------------------|---------------------------|----------------------------------|
| Print patient handout     | ✅                        | Doctor + Nurse                   |
| Export clinical PDF       | ✅                        | Doctor only                      |
| Share via WhatsApp        | ✅                        | Doctor + Nurse                   |
| Archive record            | ✅                        | Doctor + Admin                   |
| Edit output               | ✅ (Doctor only)          | Reverts status to draft          |
| Re-generate output        | ❌                        | Not available post-finalisation  |

---

## Constraints

- Never allow Nurse or Admin to finalise a record — server must enforce this
- Never finalise a record that is already archived
- Never skip the confirmation modal before finalisation
- Never skip the AuditLog write for a finalisation action
- Never allow print, export, or WhatsApp share on a draft record
- Never hard-block finalisation due to missing optional sections — warn only
- Always filter DischargeRecord queries by facilityId for multi-tenant isolation

---

*CareFlow AI — Finalise Record Workflow v1.0*
