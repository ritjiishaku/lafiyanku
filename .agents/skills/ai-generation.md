# AI Generation Skill
# File: /.agents/skills/ai-generation.md
# Version: 1.0
# Last Updated: June 2026
# PRD Reference: CFW-PRD-001 v1.0
# Purpose: How to call the AI generation engine — payload, response handling, DischargeRecord write.

---

## 1. When to Trigger Generation

Generation is triggered when:
1. The clinician (Doctor or Nurse) clicks "Generate Discharge Record"
2. All required PatientInput fields pass server-side validation
3. The user is authenticated and their role is `doctor` or `nurse`

Generation must NOT be triggered:
- While the device is offline
- When required fields are missing
- When the user's role is `admin`
- When the form has server-side validation errors

---

## 2. Prompt Version

Always use system prompt version: **v2.0**
Reference: `CFW-PROMPT-002 v2.0`
Set via environment variable: `CFW_AI_PROMPT_VERSION=v2.0`

---

## 3. Generation Request Payload

The payload sent to the AI generation engine must include all PatientInput
fields. Structure it as follows:

```json
{
  "promptVersion": "v2.0",
  "patientInput": {
    "patientId": "uuid-here",
    "facilityName": "Lagos University Teaching Hospital",
    "facilityCode": "LUTH-001",
    "wardName": "Medical Ward B",
    "admissionDate": "2024-11-10",
    "dischargeDate": "2024-11-14",
    "patientName": "John Doe",
    "age": 54,
    "gender": "Male",
    "hospitalNumber": "LUTH/2024/00412",
    "nhisNumber": null,
    "diagnosis": "Hypertension and Type 2 Diabetes Mellitus",
    "treatmentGiven": "Blood pressure stabilisation and glucose monitoring",
    "proceduresPerformed": [],
    "medications": [
      {
        "name": "Amlodipine",
        "dosage": "5mg",
        "frequency": "once daily",
        "timing": "any time",
        "duration": "ongoing",
        "notes": null
      },
      {
        "name": "Metformin",
        "dosage": "500mg",
        "frequency": "twice daily",
        "timing": "with food",
        "duration": "ongoing",
        "notes": null
      }
    ],
    "followUpInstructions": "Return to clinic in 2 weeks",
    "additionalNotes": null,
    "languageRequested": "ha",
    "dischargedBy": "Dr. Emeka Okafor",
    "clinicianLicenseNo": "MDCN/2015/07821"
  }
}
```

---

## 4. Expected Response Structure

The AI generation engine returns:

```json
{
  "success": true,
  "data": {
    "clinicalSummary": "── CLINICAL DISCHARGE SUMMARY ──\n...",
    "patientFriendlyOutput": "── PATIENT DISCHARGE INSTRUCTIONS ──\n...",
    "translatedOutput": "── TRANSLATED DISCHARGE INSTRUCTIONS ──\nLanguage: Hausa\n...",
    "translationLanguage": "ha",
    "translationConfidence": "high",
    "missingFieldsLog": [],
    "flaggedIssues": []
  },
  "modelVersion": "deepseek-v3",
  "timestamp": "2026-06-02T10:30:00Z"
}
```

### Response Field Handling

| Field                  | Action                                                                 |
|------------------------|------------------------------------------------------------------------|
| `clinicalSummary`      | Store in `DischargeRecord.clinicalSummary`                            |
| `patientFriendlyOutput`| Store in `DischargeRecord.patientFriendlyOutput`                      |
| `translatedOutput`     | Store in `DischargeRecord.translatedOutput` (null if not requested)   |
| `translationLanguage`  | Store in `DischargeRecord.translationLanguage`                        |
| `translationConfidence`| Store in `DischargeRecord.translationConfidence`; if `low` or `failed` → show amber warning banner |
| `missingFieldsLog`     | Store in `DischargeRecord.missingFieldsLog`; if non-empty → show amber banner listing missing fields |
| `flaggedIssues`        | Store in `DischargeRecord.flaggedIssues`; if non-empty → show amber banner listing issues |
| `modelVersion`         | Store in `DischargeRecord.modelVersion`                               |

---

## 5. DischargeRecord Write on Generation

After successful generation, write one `DischargeRecord` row immediately.

```json
{
  "recordId": "generated-uuid",
  "patientInputId": "patientInput.patientId",
  "generatedAt": "2026-06-02T10:30:00Z",
  "generatedByUserId": "authenticated-user-id",
  "promptVersion": "v2.0",
  "modelVersion": "deepseek-v3",
  "clinicalSummary": "...",
  "patientFriendlyOutput": "...",
  "translatedOutput": "...",
  "translationLanguage": "ha",
  "translationConfidence": "high",
  "missingFieldsLog": [],
  "flaggedIssues": [],
  "status": "draft",
  "lastEditedAt": null,
  "lastEditedByUserId": null
}
```

**Status must be `draft` on creation. Never `finalised`.**

---

## 6. AuditLog Write on Generation

After writing the DischargeRecord, immediately write an AuditLog entry:

```json
{
  "logId": "generated-uuid",
  "recordId": "DischargeRecord.recordId",
  "userId": "authenticated-user-id",
  "userRole": "doctor",
  "action": "generate",
  "timestamp": "2026-06-02T10:30:00Z",
  "ipAddress": "request.ip",
  "changesDiff": null,
  "notes": null
}
```

---

## 7. Missing Fields Handling

If `missingFieldsLog` is non-empty in the response, display an amber banner
above the output panel:

```
⚠ The following fields were not provided and may affect output quality:
  · Follow-up instructions — not provided
  · NHIS number — not provided (optional but recommended)
Please review the output carefully before finalising.
```

Style: amber background (`#FFF8E1`), amber left border (`#B45309`),
bodyMedium text, `#1E293B` text colour.

---

## 8. Contradictory Input Handling

If `flaggedIssues` is non-empty, display a separate amber banner:

```
⚠ The following inconsistencies were detected in the input:
  · [Issue description]
Please review and correct before finalising.
```

Do not block the clinician from viewing the output — display it alongside
the warning. The Doctor must resolve issues before finalising.

---

## 9. Generation Failure Handling

If the AI engine returns an error or times out (>15 seconds on 4G):

1. Display an error banner in red (`#C0392B`):
   `"Generation failed. Please try again. If the problem persists, contact support."`
2. Do not write a DischargeRecord row
3. Log the error to the system error logger with the full request payload
4. Do not write an AuditLog entry for a failed generation

---

## 10. Timeout Handling

- Client-side timeout: 20 seconds (covers 15s generation + 5s network)
- If timeout is reached before response:
  - Cancel the request
  - Display: `"The generation is taking longer than expected. Please check your connection and try again."`
  - Re-enable the Generate button

---

## Constraints

- Never trigger generation without server-side validation passing first
- Never trigger generation when the user role is `admin`
- Never set `status` to anything other than `draft` on initial record creation
- Never expose `promptVersion`, `modelVersion`, `generatedAt`, or
  `generatedByUserId` in the output shown to patients
- Never skip the AuditLog write after a successful generation
- Never skip the DischargeRecord write after a successful generation
- Never invent clinical information not present in the PatientInput
- Always use prompt version `v2.0` (CFW-PROMPT-002)

---

*CareFlow AI — AI Generation Skill v1.0*
