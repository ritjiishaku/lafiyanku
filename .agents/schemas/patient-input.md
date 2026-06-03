# PatientInput Schema Reference
# File: /.agents/schemas/patient-input.md
# Version: 1.0
# Last Updated: June 2026
# PRD Reference: CFW-PRD-001 v1.0
# Purpose: Full PatientInput schema — every field, type, validation, FMOH mapping, and example record.

---

## 1. Schema Overview

PatientInput is the structured clinical data submitted by a Doctor or Nurse
before AI generation is triggered. It is the source of truth for everything
the AI generates. Every field defined here maps directly to the PatientInput
form defined in `.agents/skills/patient-input-form.md`.

---

## 2. PatientInput Schema (Full)

```
Field                  Type              Required   Description
─────────────────────────────────────────────────────────────────────────────
patientId              UUID              Yes        System-generated on record creation.
                                                    Never entered by the user.

facilityName           string            Yes        Full name of the hospital or clinic.
                                                    Max 300 characters.
                                                    Example: "Lagos University Teaching Hospital"

facilityCode           string            No         FMOH facility registration code.
                                                    Max 50 characters.
                                                    Example: "LUTH-001"

wardName               string            No         Name of the ward or unit.
                                                    Max 100 characters.
                                                    Example: "Medical Ward B"

admissionDate          date ISO 8601     Yes        Date patient was admitted.
                                                    Format: YYYY-MM-DD.
                                                    Must not be in the future.
                                                    Example: "2024-11-10"

dischargeDate          date ISO 8601     Yes        Date patient was discharged.
                                                    Format: YYYY-MM-DD.
                                                    Must be ≥ admissionDate.
                                                    Example: "2024-11-14"

patientName            string            Yes        Full name as registered at the facility.
                                                    Max 200 characters.
                                                    Example: "John Doe"

age                    integer           Yes        Age in years at time of discharge.
                                                    Range: 0–130.
                                                    Example: 54

gender                 enum              Yes        One of: Male | Female | Other
                                                    Example: "Male"

hospitalNumber         string            Yes        Facility-assigned patient number.
                                                    Max 100 characters.
                                                    Example: "LUTH/2024/00412"

nhisNumber             string            No         National Health Insurance Scheme number.
                                                    Max 50 characters.
                                                    Example: "NHIS/0045231"

diagnosis              string            Yes        Primary diagnosis. Include secondary
                                                    conditions where clinically relevant.
                                                    Max 2000 characters.
                                                    Example: "Hypertension and Type 2 Diabetes Mellitus"

treatmentGiven         string            Yes        Summary of all treatment administered
                                                    during the admission.
                                                    Max 3000 characters.
                                                    Example: "Blood pressure stabilisation and glucose monitoring"

proceduresPerformed    string[]          No         List of procedures performed.
                                                    Empty array if none.
                                                    Example: [] or ["IV cannulation", "ECG"]

medications            Medication[]      Yes        Array of medication objects.
                                                    At least one entry required.
                                                    See Medication sub-schema below.

followUpInstructions   string            No         Clinical follow-up recommendations.
                                                    Max 2000 characters.
                                                    Example: "Return to clinic in 2 weeks for review."

additionalNotes        string            No         Any supplementary clinical notes not
                                                    captured in other fields.
                                                    Max 2000 characters.

languageRequested      enum              No         Language for patient-friendly translation.
                                                    One of: en | ha | yo | ig
                                                    Defaults to: en (English)
                                                    Example: "ha"

dischargedBy           string            Yes        Full name of the discharging clinician.
                                                    Max 200 characters.
                                                    Example: "Dr. Emeka Okafor"

clinicianLicenseNo     string            No         MDCN licence number of the discharging
                                                    clinician.
                                                    Max 50 characters.
                                                    Example: "MDCN/2015/07821"
```

---

## 3. Medication Sub-Schema

One Medication object per row in the medications array.
At least one row is required. Each row must have name, dosage, and frequency.

```
Field       Type      Required   Description
──────────────────────────────────────────────────────────────────────
name        string    Yes        Generic or brand name of the medication.
                                 Max 200 characters.
                                 Do not translate drug names.
                                 Example: "Amlodipine"

dosage      string    Yes        Dose with unit.
                                 Max 100 characters.
                                 Example: "5mg"

frequency   string    Yes        Frequency in plain terms.
                                 Max 100 characters.
                                 Example: "once daily", "twice daily", "three times daily"

timing      string    No         Timing relative to meals or time of day.
                                 Max 200 characters.
                                 Example: "with food", "before bed", "on an empty stomach"

duration    string    No         Duration of the medication course.
                                 Max 100 characters.
                                 Example: "7 days", "14 days", "ongoing", "until review"

notes       string    No         Additional instructions for this medication.
                                 Max 500 characters.
                                 Example: "Avoid alcohol while taking this medication."
```

---

## 4. FMOH Field Mapping

These fields are required by Nigerian Federal Ministry of Health (FMOH)
discharge summary standards. They must always be present and correctly
populated before a record is finalised.

| FMOH Required Element          | CareFlow Field         | Required in Schema |
|--------------------------------|------------------------|--------------------|
| Patient full name              | `patientName`          | Yes                |
| Date of admission              | `admissionDate`        | Yes                |
| Date of discharge              | `dischargeDate`        | Yes                |
| Primary diagnosis              | `diagnosis`            | Yes                |
| Treatment provided             | `treatmentGiven`       | Yes                |
| Medications (name/dose/freq)   | `medications[]`        | Yes                |
| Discharging clinician name     | `dischargedBy`         | Yes                |
| MDCN licence number            | `clinicianLicenseNo`   | No (recommended)   |
| Facility name                  | `facilityName`         | Yes                |
| Hospital patient number        | `hospitalNumber`       | Yes                |

**Critical FMOH rule:** `admissionDate` and `dischargeDate` must always
be stored and displayed as two separate fields. A single `Date` or
`dischargeDate`-only field does not meet FMOH standards.

---

## 5. Validation Rules Summary

| Field               | Rule                                                         |
|---------------------|--------------------------------------------------------------|
| `admissionDate`     | Valid ISO 8601 date; not in the future                       |
| `dischargeDate`     | Valid ISO 8601 date; must be ≥ admissionDate                 |
| `age`               | Integer; range 0–130                                         |
| `gender`            | Exactly one of: Male \| Female \| Other                      |
| `languageRequested` | Exactly one of: en \| ha \| yo \| ig; defaults to en        |
| `medications`       | Array length ≥ 1; each row: name + dosage + frequency present|
| All string fields   | HTML stripped; no script tags; max lengths enforced          |

---

## 6. Completed Example Record

```json
{
  "patientId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
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
  "treatmentGiven": "Blood pressure stabilisation and glucose monitoring during admission.",
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
  "followUpInstructions": "Return to clinic in 2 weeks for review.",
  "additionalNotes": null,
  "languageRequested": "ha",
  "dischargedBy": "Dr. Emeka Okafor",
  "clinicianLicenseNo": "MDCN/2015/07821"
}
```

---

## Constraints

- Never merge `admissionDate` and `dischargeDate` into a single field
- Never use snake_case for field names — always camelCase
- Never accept a `dischargeDate` that is earlier than `admissionDate`
- Never allow a medications array with zero entries
- Never allow a medication row that has a `name` without a `dosage` and `frequency`
- Never translate drug names in the `medications[*].name` field
- Never store `patientId` as a user-entered value — always system-generated
- Never accept `languageRequested` outside: en \| ha \| yo \| ig

---

*CareFlow — PatientInput Schema Reference v1.0*
