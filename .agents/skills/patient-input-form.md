# Patient Input Form Skill
# File: /.agents/skills/patient-input-form.md
# Version: 1.0
# Last Updated: June 2026
# PRD Reference: CFW-PRD-001 v1.0
# Purpose: How to build the PatientInput form — every field, validation, medication rows, offline caching.

---

## 1. Form Field Specification

Build fields in this exact order. Never reorder them.

| # | Field                 | Type        | Required | Validation Rule                                              | Error Message                                                             |
|---|-----------------------|-------------|----------|--------------------------------------------------------------|---------------------------------------------------------------------------|
| 1 | `facilityName`        | text        | Yes      | Non-empty string, max 300 chars                              | "Facility name is required."                                              |
| 2 | `facilityCode`        | text        | No       | Max 50 chars                                                 | —                                                                         |
| 3 | `wardName`            | text        | No       | Max 100 chars                                                | —                                                                         |
| 4 | `patientName`         | text        | Yes      | Non-empty string, max 200 chars                              | "Patient name is required."                                               |
| 5 | `age`                 | number      | Yes      | Integer, 0–130                                               | "Age is required and must be a number between 0 and 130."                 |
| 6 | `gender`              | select      | Yes      | One of: Male \| Female \| Other                              | "Please select a gender."                                                 |
| 7 | `hospitalNumber`      | text        | Yes      | Non-empty string, max 100 chars                              | "Hospital number is required."                                            |
| 8 | `nhisNumber`          | text        | No       | Max 50 chars                                                 | —                                                                         |
| 9 | `admissionDate`       | date        | Yes      | Valid ISO 8601 date; not in the future                       | "Admission date is required and must be a valid date."                    |
| 10| `dischargeDate`       | date        | Yes      | Valid ISO 8601 date; must be ≥ admissionDate                 | "Discharge date is required and must be on or after the admission date."  |
| 11| `diagnosis`           | textarea    | Yes      | Non-empty string, max 2000 chars                             | "Diagnosis is required."                                                  |
| 12| `treatmentGiven`      | textarea    | Yes      | Non-empty string, max 3000 chars                             | "Treatment given is required."                                            |
| 13| `proceduresPerformed` | textarea    | No       | Max 2000 chars                                               | —                                                                         |
| 14| `medications`         | repeating rows | Yes  | At least one row; each row: name + dosage + frequency required | "At least one medication is required. Each medication must have a name, dosage, and frequency." |
| 15| `followUpInstructions`| textarea    | No       | Max 2000 chars                                               | —                                                                         |
| 16| `additionalNotes`     | textarea    | No       | Max 2000 chars                                               | —                                                                         |
| 17| `dischargedBy`        | text        | Yes      | Non-empty string, max 200 chars                              | "Discharging clinician name is required."                                 |
| 18| `clinicianLicenseNo`  | text        | No       | Max 50 chars                                                 | —                                                                         |
| 19| `languageRequested`   | select      | No       | One of: en \| ha \| yo \| ig; defaults to en                 | —                                                                         |

**Note:** `patientId` is system-generated on form submission. Do not include it as a user-facing field.

---

## 2. Medication Row Behaviour

Medications is a **repeating row component**. Each row is one `Medication` object.

### Medication Row Fields (per row)

| Field       | Type     | Required | Validation           | Error Message                                          |
|-------------|----------|----------|----------------------|--------------------------------------------------------|
| `name`      | text     | Yes      | Non-empty, max 200   | "Medication name is required."                         |
| `dosage`    | text     | Yes      | Non-empty, max 100   | "Dosage is required (e.g. 5mg, 500mg)."                |
| `frequency` | text     | Yes      | Non-empty, max 100   | "Frequency is required (e.g. once daily, twice daily)."|
| `timing`    | text     | No       | Max 200              | —                                                      |
| `duration`  | text     | No       | Max 100              | —                                                      |
| `notes`     | text     | No       | Max 500              | —                                                      |

### Row Controls

- **Add row button:** "＋ Add medication" — appends a new empty row
- **Remove row button:** "✕" on each row — removes that row (min 1 row always present)
- First row cannot be removed — the remove button is hidden/disabled on row 1
- Tab order must move through all fields of row 1 before moving to row 2
- Minimum tap target for add/remove buttons: 44px × 44px

---

## 3. Optional Field Labelling

Every optional field must display the label `(optional)` in Cool Grey
(`#64748B`) after the field name. Example:

```
NHIS Number (optional)
[input field]
```

Required fields display a red asterisk `*` after the field name:

```
Patient Name *
[input field]
```

---

## 4. Language Selector

- Displayed as a labelled dropdown or radio button group
- Label: "Output language for patient instructions"
- Options:
  - English (default, pre-selected)
  - Hausa
  - Yoruba
  - Igbo
- Stored as ISO code: `en` | `ha` | `yo` | `ig`
- If not selected, defaults to `en`

---

## 5. Field-Level Error Display Pattern

Errors appear directly below the offending field. The field border turns red.

```
Patient Name *
[John Doe ← input value]           ← border: #C0392B (2px)
⚠ Patient name is required.        ← #C0392B, bodyMedium (14px, 500 weight)
```

Rules:
- Show errors on blur (when the user leaves the field), not on keystroke
- Show all errors simultaneously when the Generate button is clicked and
  validation fails — do not show them one at a time
- Clear the error for a field as soon as valid input is entered
- Scroll to the first error field automatically after failed submit

---

## 6. Generate Button

- Label: "Generate Discharge Record"
- Primary button style (Clinical Teal `#0B6E6E`)
- Disabled when offline (see Section 7)
- On click: validate all required fields → if any fail, show errors and stop
- On validation pass: submit to server, show loading state

### Loading State
- Button text changes to "Generating…" with a spinner
- Button becomes disabled during generation
- Display a progress message below the form:
  `"Generating clinical summary and patient instructions — this may take up to 15 seconds."`

---

## 7. Save-as-Draft

- A "Save draft" button appears below the form (secondary button style)
- Saves the current form state without triggering validation or AI generation
- Displays a success toast: `"Draft saved successfully."`
- Draft is associated with the authenticated user and facility
- Clinician can return later and resume from the saved state

---

## 8. Offline Caching

The form must handle connectivity loss without data loss.

### Behaviour

| Event                  | UI Response                                                          |
|------------------------|----------------------------------------------------------------------|
| Connectivity lost      | Amber banner: "You are offline — your form is saved locally."        |
| Generate clicked offline| Block and show: "Please reconnect to generate the discharge record." |
| Connectivity restored  | Banner: "Connection restored — your draft is ready to submit."       |
| Form submitted         | Clear local cache after successful server acknowledgement            |

### Rules
- Cache form state after every field change (debounced at 500ms)
- Cache must survive a page reload or app restart
- Never silently discard cached data
- Cache is scoped to the authenticated user — never shared between users

---

## 9. Server-Side Validation (Before AI Generation)

After client-side validation passes and the form is submitted, the server
must re-validate all required fields before triggering AI generation.

If server-side validation fails, return:

```json
{
  "success": false,
  "error": {
    "code": "MISSING_REQUIRED_FIELD",
    "message": "Diagnosis is required. Please provide the primary diagnosis.",
    "details": {
      "field": "diagnosis"
    }
  },
  "timestamp": "2026-06-02T10:30:00Z"
}
```

Do not trigger AI generation until all required fields pass server-side validation.

---

## Constraints

- Never skip server-side validation — client validation is UX only
- Never allow the form to submit while offline
- Never reorder the fields from the order defined in Section 1
- Never allow a medication row to have a name without a dosage and frequency
- Never allow dischargeDate to be earlier than admissionDate
- Never merge admissionDate and dischargeDate into a single field
- Never use a single "Date" field anywhere on this form

---

*CareFlow AI — Patient Input Form Skill v1.0*
