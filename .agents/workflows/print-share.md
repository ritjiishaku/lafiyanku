# Print and Share Workflow
# File: /.agents/workflows/print-share.md
# Version: 1.0
# Last Updated: June 2026
# PRD Reference: CFW-PRD-001 v1.0
# Purpose: Step-by-step agent instructions for print, PDF export, and WhatsApp share workflows — available only on finalised records.

---

## Overview

Print and Share workflows deliver finalised discharge records to patients and hospital records. Three delivery mechanisms are supported: browser print, PDF export, and WhatsApp share.

**Permitted roles:** Doctor · Nurse (print, share) · Doctor only (clinical PDF export)
**Required status:** `finalised` — all three mechanisms require a finalised record
**Audit requirement:** Every delivery action must create an AuditLog entry before execution

---

## Trigger Path 1 — Browser Print (Patient Handout)

### Step 1 — Role and Status Check

```
IF user.role NOT IN ["doctor", "nurse"]
  → Return HTTP 403
  → Display: "You do not have permission to print discharge records."
  → STOP
END IF

FETCH DischargeRecord WHERE recordId = params.id AND facilityId = user.facilityId

IF record.status !== "finalised"
  → Return HTTP 400
  → Display: "Only finalised records can be printed."
  → STOP
END IF
```

### Step 2 — Write AuditLog [DB WRITE]

```
INSERT AuditLog {
  logId:       generateUUID()
  recordId:    params.id
  userId:      user.id
  userRole:    user.role
  action:      "print"
  timestamp:   now() UTC
  ipAddress:   COALESCE(request.ip, "unknown")
  changesDiff: null
  notes:       "Patient handout printed by [user.role]: [user.id]."
}
```

### Step 3 — Build Printable Layout

Generate a print-optimised HTML document containing:

```
┌─────────────────────────────────────────────┐
│ [Facility Name]                             │
│ Patient: [patientName]                      │
│ Discharge date: [dischargeDate]             │
│ Clinician: [dischargedBy]                   │
├─────────────────────────────────────────────┤
│                                             │
│ PATIENT DISCHARGE INSTRUCTIONS              │
│                                             │
│ What happened                               │
│ [Mode 2 patientFriendlyOutput content]      │
│                                             │
│ [Translated version if applicable]          │
│ ─────────────────────────────────────────── │
│ TRANSLATED DISCHARGE INSTRUCTIONS           │
│ Language: [language]                        │
│ ─────────────────────────────────────────── │
│ [translatedOutput content]                  │
│                                             │
│ Signed by: [dischargedBy]                   │
│ Date: [dischargeDate]                       │
└─────────────────────────────────────────────┘
```

**Layout rules:**
- Facility header: facility name, patient name, discharge date, clinician name (FR-27)
- Mode 2 content only — never include Mode 1 clinical summary in patient handout
- Translated output appears below English if available (FR-26)
- No generation metadata (promptVersion, modelVersion, generatedAt, generatedByUserId)
- No section separator lines in patient-facing print
- Font size: minimum 12pt for readability
- Use black text on white background for accessibility

### Step 4 — Open Browser Print Dialog

```
window.print()

IF user cancels print dialog
  → No further action
  → AuditLog already written (print action logged before dialog opened)
END IF
```

---

## Trigger Path 2 — PDF Export (Clinical Records)

### Step 2a — Role Check (Doctor Only for Clinical PDF)

```
IF user.role !== "doctor"
  → Return HTTP 403
  → Display: "Only doctors can export clinical PDFs."
  → STOP
END IF
```

### Step 2b — Write AuditLog [DB WRITE]

```
INSERT AuditLog {
  logId:       generateUUID()
  recordId:    params.id
  userId:      user.id
  userRole:    "doctor"
  action:      "export"
  timestamp:   now() UTC
  ipAddress:   COALESCE(request.ip, "unknown")
  changesDiff: null
  notes:       "Clinical PDF exported by doctor: [user.id]."
}
```

### Step 2c — Generate Clinical PDF

Build a PDF containing:

```
Page 1: Clinical Discharge Summary (Mode 1 — full template)
  - Facility header
  - Patient information
  - Diagnosis
  - Treatment provided
  - Procedures performed
  - Medications table
  - Follow-up instructions
  - Red flag warnings
  - Discharged by block

Page 2 (optional): Patient Instructions (Mode 2)
  - Only if clinically relevant for the external provider

Footer (every page):
  - Generated: [generatedAt UTC] | Prompt: [promptVersion] | Model: [modelVersion]
  - Record ID: [recordId]
  - Exported by: [user.id]
```

**PDF rules:**
- Mode 1 is always included (clinical record)
- Generation metadata appears in footer only — never in body content
- File naming convention: `DischargeSummary_[patientName]_[dischargeDate].pdf`
- Content-Type: `application/pdf`
- Content-Disposition: `attachment`

### Step 2d — Return PDF

Return the generated PDF file to the client.

---

## Trigger Path 3 — WhatsApp Share (Patient Instructions)

### Step 3a — Role and Status Check

```
IF user.role NOT IN ["doctor", "nurse"]
  → Return HTTP 403
  → STOP
END IF

IF record.status !== "finalised"
  → Return HTTP 400
  → STOP
END IF
```

### Step 3b — Prepare WhatsApp Text

Strip all section separator lines (`──────`) and format for mobile reading:

```
[patientName] — Your Discharge Instructions

What happened:
[Plain text from Mode 2]

Treatment you received:
[Plain text from Mode 2]

Your medications:
1. [medication 1] — [dosage], [frequency]
2. [medication 2] — [dosage], [frequency]

When to return to the hospital:
[Plain text warning signs]

Your follow-up appointment:
[Follow-up instructions]

Signed by: [dischargedBy]
```

**Stripping rules:**
- Remove all `───` separator lines
- Convert markdown bold/italic to plain text
- Remove table formatting — convert to plain numbered list
- Maximum 3-4 lines per section
- No section heading separators
- Never include Mode 1 content (FR-25)
- If translation exists and confidence = "high", append it below English
- If translation confidence is low, send English only with warning

### Step 3c — Build WhatsApp Deep Link

```
const phoneNumber = ""; // Patient phone number (if available, otherwise blank)
const text = encodeURIComponent(preparedText);
const whatsappUrl = `https://wa.me/${phoneNumber}?text=${text}`;

Open in new tab/window: window.open(whatsappUrl, "_blank");
```

### Step 3d — Write AuditLog [DB WRITE]

```
INSERT AuditLog {
  logId:       generateUUID()
  recordId:    params.id
  userId:      user.id
  userRole:    user.role
  action:      "export"
  timestamp:   now() UTC
  ipAddress:   COALESCE(request.ip, "unknown")
  changesDiff: null
  notes:       "WhatsApp share initiated by [user.role]: [user.id]. Translation: [language if applicable]."
}
```

---

## Trigger Path 4 — JSON Export (Machine-Readable)

### Step 4a — Role Check

```
IF user.role NOT IN ["doctor", "nurse"]
  → Return HTTP 403
  → STOP
END IF

IF record.status !== "finalised"
  → Return HTTP 400
  → STOP
END IF
```

### Step 4b — Write AuditLog [DB WRITE]

```
INSERT AuditLog {
  logId:       generateUUID()
  recordId:    params.id
  userId:      user.id
  userRole:    user.role
  action:      "export"
  timestamp:   now() UTC
  ipAddress:   COALESCE(request.ip, "unknown")
  changesDiff: null
  notes:       "JSON export by [user.role]: [user.id]."
}
```

### Step 4c — Return JSON

Return the DischargeRecord data as JSON:
- Mode 2 patientFriendlyOutput always included
- clinicalSummary included only if `includeMode1=true` AND role=doctor
- translatedOutput included if present
- Generation metadata excluded from response
- Record ID and status included for reference

---

## Error Branch Summary

| Error Condition               | Response                                                        |
|-------------------------------|-----------------------------------------------------------------|
| Wrong role (Admin)            | HTTP 403; "No permission" message                               |
| Record not finalised          | HTTP 400; "Only finalised records can be [action]"              |
| Record not found              | HTTP 404; "Record not found"                                    |
| PDF generation fails          | HTTP 500; "Export failed. Please try again."                    |
| WhatsApp deep link fails      | Log error; display fallback text for manual copy-paste          |
| AuditLog write fails          | Critical error; system alert; do not proceed silently           |

---

## What Each Role Can Do

| Action                | Doctor | Nurse | Admin |
|-----------------------|--------|-------|-------|
| Print patient handout | ✅     | ✅    | ❌    |
| Export clinical PDF   | ✅     | ❌    | ❌    |
| Share via WhatsApp    | ✅     | ✅    | ❌    |
| Export JSON           | ✅     | ✅    | ❌    |

---

## Constraints

- Never print, export, or share a draft record — must be finalised
- Never include Mode 1 clinical summary in patient handout or WhatsApp
- Never include generation metadata in patient-facing output
- Never skip AuditLog write before executing delivery action
- Never send Mode 1 via WhatsApp under any circumstance (FR-25)
- Never include translated output with low confidence without warning
- Always strip section separators from WhatsApp text
- Always include facility header in printed output (FR-27)
- Always use both admissionDate and dischargeDate — never a single date field
- Always include the Record ID in clinical PDF metadata for audit trail

---

*CareFlow AI — Print and Share Workflow v1.0*
