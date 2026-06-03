# Export and Print Skill
# File: /.agents/skills/export-print.md
# Version: 1.0
# Last Updated: June 2026
# PRD Reference: CFW-PRD-001 v1.0
# Purpose: How to generate printable and exportable output — layout, header, role rules, AuditLog.

---

## 1. Who Can Export and Print

| Role   | Can Export/Print | Notes                                          |
|--------|------------------|------------------------------------------------|
| Doctor | ✅               | Can export Mode 1 (clinical) + Mode 2 (patient)|
| Nurse  | ✅               | Can export Mode 2 (patient) only               |
| Admin  | ❌               | Cannot export or print — return 403            |

Role must be validated server-side before generating any export.

---

## 2. Record Must Be Finalised Before Export

The Print / Share action is only available on **finalised** records
(`status: "finalised"`).

If the record is still `draft`, the export/print button must be disabled with
the tooltip: `"This record must be finalised by a Doctor before it can be printed."`

If an export request is made via the API for a draft record, return:

```json
{
  "success": false,
  "error": {
    "code": "RECORD_NOT_FINALISED",
    "message": "This discharge record must be finalised before it can be exported."
  },
  "timestamp": "2026-06-02T10:30:00Z"
}
```

---

## 3. Printable Output — Patient Handout (Mode 2)

The **primary printable output** is the patient handout — Mode 2 only.

### 3.1 Header (Required on All Printed Output)

```
┌─────────────────────────────────────────────────────────────┐
│  [Facility Name]                      [Date of Discharge]   │
│  Patient: [Patient Name]                                    │
│  Clinician: [Discharged By]                                 │
└─────────────────────────────────────────────────────────────┘
```

All four values are required:
- `facilityName` from PatientInput
- `dischargeDate` from PatientInput (formatted DD/MM/YYYY)
- `patientName` from PatientInput
- `dischargedBy` from PatientInput

If any of these four values is missing, do not block the print — display
`"Not provided"` for the missing value and log the gap.

### 3.2 Body — Mode 2 Content

Render the full `patientFriendlyOutput` text in the following print styles:

- Font: Plus Jakarta Sans (fallback: Arial)
- Body size: 14pt minimum
- Line spacing: 1.6
- Margins: 20mm all sides
- Section headings: Bold 12pt, Deep Navy (`#0D2B4E`)
- Body text: Regular 11pt, Slate (`#1E293B`)
- Medication list: table with 1pt border, alternating rows (`#F7FAFD`)
- Red flag / when-to-return section: amber left border (4pt, `#B45309`),
  amber background (`#FFF8E1`)

### 3.3 Translated Version (If Available)

If `DischargeRecord.translatedOutput` is non-null and
`translationConfidence` is `high`:
- Print the translated version **below** the English version on the same sheet
- Add a divider line between English and translated versions
- Add a heading: `"[Language name] Version"` (e.g. "Hausa Version")
- Use the same print styles as the English version

If `translationConfidence` is `low` or `failed`:
- Do not print the low-confidence translation
- Print English only
- Add a footnote: `"Note: Translation into [language] was not available with sufficient confidence. English version provided."`

---

## 4. Clinical PDF — Mode 1 (Doctor Only)

A separate clinical PDF is available to Doctor role only.

- Contains Mode 1 (clinicalSummary) formatted for hospital records
- Header: facility name · FMOH code · ward · patient name · hospital number · dates
- Includes the Discharged By block with MDCN licence number
- Does not include Mode 2 or translated content
- Footer: generated timestamp (WAT) + prompt version + record ID

This PDF is **not** the patient handout. It is the internal clinical record.

---

## 5. PDF Generation Constraints for Low-Bandwidth

Nigerian hospital environments have intermittent connectivity. PDF generation
must be designed for low-bandwidth conditions.

- Generate PDF server-side — do not generate in the browser
- Return a download link, not an inline blob
- Maximum PDF file size: 500KB for patient handout
- Do not embed large images or complex graphics in the PDF
- If PDF generation fails, fall back to a plain-text download of Mode 2 content
- Show a progress indicator during PDF generation

---

## 6. AuditLog Entry for Export / Print

Every export or print action must write an AuditLog entry. This is required
for NDPR compliance.

### Print (paper) — AuditLog

```json
{
  "logId": "generated-uuid",
  "recordId": "DischargeRecord.recordId",
  "userId": "authenticated-user-id",
  "userRole": "nurse",
  "action": "print",
  "timestamp": "2026-06-02T10:30:00Z",
  "ipAddress": "request.ip",
  "changesDiff": null,
  "notes": "Patient handout printed. Language: ha. Pages: 1."
}
```

### PDF Export — AuditLog

```json
{
  "logId": "generated-uuid",
  "recordId": "DischargeRecord.recordId",
  "userId": "authenticated-user-id",
  "userRole": "doctor",
  "action": "export",
  "timestamp": "2026-06-02T10:30:00Z",
  "ipAddress": "request.ip",
  "changesDiff": null,
  "notes": "Clinical PDF exported. Mode 1."
}
```

---

## Constraints

- Never allow Admin role to export or print
- Never allow export or print of a draft record
- Never include Mode 1 in the patient handout PDF
- Never print a low-confidence translation — print English and add a footnote
- Never skip the AuditLog entry for any print or export action
- Never expose generation metadata (promptVersion, modelVersion, generatedAt,
  generatedByUserId) on any patient-facing printed output
- Never generate PDF in the browser — generate server-side only
- Always include the four required header fields on every printed output

---

*CareFlow — Export and Print Skill v1.0*
