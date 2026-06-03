# DischargeRecord Schema Reference
# File: /.agents/schemas/discharge-record.md
# Version: 1.0
# Last Updated: June 2026
# PRD Reference: CFW-PRD-001 v1.0
# Purpose: Full DischargeRecord schema — every field, status lifecycle, metadata rules, example record.

---

## 1. Schema Overview

DischargeRecord is the AI-generated output document. It is created
immediately after a successful AI generation and linked to its originating
PatientInput via `patientInputId`. It stores both Mode 1 and Mode 2 outputs,
translation data, generation metadata, and the record lifecycle status.

Every DischargeRecord starts as `draft` and must be explicitly finalised
by a Doctor before it becomes available for print, export, or share.

---

## 2. DischargeRecord Schema (Full)

```
Field                   Type              Required   Description
───────────────────────────────────────────────────────────────────────────────
recordId                UUID              Yes        System-generated unique ID for this
                                                     discharge document.

patientInputId          UUID              Yes        Foreign key → PatientInput.patientId.
                                                     Links this record to its source input.

generatedAt             datetime UTC      Yes        ISO 8601 UTC timestamp of when the AI
                                                     generated this record.
                                                     Example: "2024-11-14T10:30:00Z"

generatedByUserId       string            Yes        ID of the authenticated clinician who
                                                     triggered AI generation.

promptVersion           string            Yes        Version of the system prompt used for
                                                     generation.
                                                     Example: "v2.0"
                                                     Set from env: CFW_AI_PROMPT_VERSION

modelVersion            string            Yes        AI model version used for generation.
                                                     Example: "deepseek-v3"
                                                     Set from env: CFW_AI_MODEL_VERSION

clinicalSummary         text              Yes        Full Mode 1 clinical discharge summary.
                                                     Structured text following the Mode 1
                                                     output template.
                                                     Never shown to patients.

patientFriendlyOutput   text              Yes        Full Mode 2 patient-friendly discharge
                                                     instructions.
                                                     Plain language. Shown to patients.

translatedOutput        text              No         Translated Mode 2 output in the
                                                     requested language.
                                                     Null if no translation was requested.
                                                     If fallbackUsed = true, stores English
                                                     patientFriendlyOutput instead.

translationLanguage     enum              No         Language of the translation.
                                                     One of: en | ha | yo | ig
                                                     Null if no translation was requested.

translationConfidence   enum              No         Confidence level of the translation.
                                                     One of: high | low | failed
                                                     Null if no translation was requested.

missingFieldsLog        string[]          No         List of optional fields that were absent
                                                     at generation time and may affect output
                                                     quality. Empty array if none.
                                                     Example: ["followUpInstructions", "nhisNumber"]

flaggedIssues           string[]          No         List of inconsistencies or clinical
                                                     concerns raised by the AI during
                                                     generation. Empty array if none.
                                                     Example: ["Discharge date precedes admission date"]

status                  enum              Yes        Lifecycle status of the record.
                                                     One of: draft | finalised | archived
                                                     Always starts as: "draft"

lastEditedAt            datetime UTC      No         ISO 8601 UTC timestamp of the last
                                                     human edit made post-generation.
                                                     Null until first edit.

lastEditedByUserId      string            No         ID of the user who last edited the record.
                                                     Null until first edit.
```

---

## 3. Status Lifecycle

```
         [AI Generation Complete]
                   │
                   ▼
               "draft"
          (editable by Doctor + Nurse)
                   │
          Doctor clicks Finalise
                   │
                   ▼
            "finalised"
     (print/export/share enabled)
      (editable by Doctor only —
       editing reverts to "draft")
                   │
      Doctor or Admin archives
                   │
                   ▼
            "archived"
        (read-only; no edits;
         no print/export/share)
```

### Status Transition Rules

| From        | To          | Who Can Trigger | Notes                                          |
|-------------|-------------|-----------------|------------------------------------------------|
| `draft`     | `finalised` | Doctor only     | Requires confirmation modal                    |
| `finalised` | `draft`     | Doctor only     | Triggered automatically when Doctor edits      |
| `finalised` | `archived`  | Doctor · Admin  | Record becomes read-only                       |
| `draft`     | `archived`  | Doctor · Admin  | Allowed — draft can be archived without finalising |
| `archived`  | any         | Nobody          | Archived is a terminal state — no transitions out |

---

## 4. Generation Metadata Fields

These four fields are populated at generation time and must never be
changed after creation:

| Field                | Source                          | Exposed to Patients? |
|----------------------|---------------------------------|----------------------|
| `generatedAt`        | Server UTC timestamp            | ❌ No                |
| `generatedByUserId`  | Authenticated user ID           | ❌ No                |
| `promptVersion`      | `CFW_AI_PROMPT_VERSION` env var | ❌ No (clinical PDF footer only) |
| `modelVersion`       | `CFW_AI_MODEL_VERSION` env var  | ❌ No (clinical PDF footer only) |

`promptVersion` and `modelVersion` may appear in the **clinical PDF footer**
for audit purposes. They must **never** appear in:
- Mode 2 patient-friendly output
- Translated output
- Patient handout print layout
- WhatsApp-shared text

---

## 5. Relationship to Other Schemas

```
PatientInput (1)
    │
    └──► DischargeRecord (1)
              │
              └──► TranslationRequest (0..*)
              │
              └──► AuditLog (1..*)
```

- One PatientInput produces exactly one DischargeRecord
- One DischargeRecord can have zero or more TranslationRequest entries
  (one per language requested, including retranslations)
- One DischargeRecord has one or more AuditLog entries (minimum: the
  initial `generate` entry)

---

## 6. Completed Example Record

```json
{
  "recordId": "rec-a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "patientInputId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "generatedAt": "2024-11-14T10:30:00Z",
  "generatedByUserId": "user-emeka-001",
  "promptVersion": "v2.0",
  "modelVersion": "deepseek-v3",
  "clinicalSummary": "──────────────────────────────────────────\nCLINICAL DISCHARGE SUMMARY\n──────────────────────────────────────────\n\nFacility\nName:       Lagos University Teaching Hospital\nFMOH Code:  LUTH-001\nWard:       Medical Ward B\n\nPatient information\nName:              John Doe\nAge:               54\nGender:            Male\nHospital No.:      LUTH/2024/00412\nNHIS No.:          Not provided\nDate of admission: 2024-11-10\nDate of discharge: 2024-11-14\n\nDiagnosis\nHypertension and Type 2 Diabetes Mellitus.\n\nTreatment provided\nThe patient received blood pressure stabilisation treatment and glucose monitoring during admission.\n\nProcedures performed\nNone documented.\n\nMedications\n| Medication  | Dosage | Frequency   | Timing    | Duration | Notes |\n| Amlodipine  | 5mg    | Once daily  | Any time  | Ongoing  | —     |\n| Metformin   | 500mg  | Twice daily | With food | Ongoing  | —     |\n\nFollow-up instructions\nReturn to clinic in 2 weeks for review.\n\nRed flag warnings\nReturn immediately if experiencing chest pain, severe headache, difficulty breathing, sudden weakness, or worsening symptoms.\n\nDischarged by\nName:              Dr. Emeka Okafor\nMDCN Licence No.:  MDCN/2015/07821\n──────────────────────────────────────────",
  "patientFriendlyOutput": "──────────────────────────────────────────\nPATIENT DISCHARGE INSTRUCTIONS\n──────────────────────────────────────────\n\nWhat happened\nYou were treated for high blood pressure and high blood sugar (diabetes).\n\nTreatment you received\nDuring your stay, your blood pressure and blood sugar were monitored and brought under control.\n\nYour medications\n- Amlodipine (5mg): Take once daily. This helps control your blood pressure.\n- Metformin (500mg): Take twice daily WITH food. This helps manage your blood sugar.\n\nWhen to return to the hospital\nReturn immediately if you have chest pain, a very bad headache, difficulty breathing, sudden weakness, or feel worse.\n\nYour follow-up appointment\nPlease return to the clinic in 2 weeks for your review.\n──────────────────────────────────────────",
  "translatedOutput": "[Hausa patient-friendly discharge instructions]",
  "translationLanguage": "ha",
  "translationConfidence": "high",
  "missingFieldsLog": [],
  "flaggedIssues": [],
  "status": "finalised",
  "lastEditedAt": null,
  "lastEditedByUserId": null
}
```

---

## Constraints

- Never create a DischargeRecord with `status` other than `draft`
- Never allow `archived` status to transition to any other status
- Never expose `generatedAt`, `generatedByUserId`, `promptVersion`, or
  `modelVersion` in patient-facing output or printed patient handouts
- Never allow `patientInputId` to be null — every record must link to a PatientInput
- Never allow `clinicalSummary` or `patientFriendlyOutput` to be null on a
  created record — generation must produce both
- Never update `generatedAt`, `generatedByUserId`, `promptVersion`, or
  `modelVersion` after record creation
- Always store `admissionDate` and `dischargeDate` as separate fields in
  PatientInput — never merged

---

*CareFlow — DischargeRecord Schema Reference v1.0*
