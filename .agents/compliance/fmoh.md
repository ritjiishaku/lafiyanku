# FMOH Patient Record Standards Compliance Reference
# File: /.agents/compliance/fmoh.md
# Version: 1.0
# Last Updated: June 2026
# PRD Reference: CFW-PRD-001 v1.0
# Purpose: FMOH patient record standards, MDCN requirements, discharge summary structure, compliance checklist.

---

## 1. Overview

The Nigerian Federal Ministry of Health (FMOH) sets standards for patient
records and clinical documentation across all accredited hospitals, clinics,
and healthcare facilities in Nigeria. CareFlow AI generates discharge
documentation that must comply with these standards to be acceptable for
hospital records, insurance claims, referrals, and medicolegal purposes.

The primary governing documents are:
- FMOH National Health Policy (2016)
- FMOH National Health Management Information System (HMIS) Guidelines
- Medical and Dental Council of Nigeria (MDCN) Code of Medical Ethics
- WHO International Patient Summary (adopted as reference standard in
  Nigerian tertiary hospitals)

---

## 2. Mandatory Dual Date Fields

**FMOH requires both the date of admission AND the date of discharge to be
recorded separately on every discharge document.**

A single `Date` or `dischargeDate`-only field does not meet FMOH standards.

| Required Field    | CareFlow Field    | Format       | Schema Location     |
|-------------------|-------------------|--------------|---------------------|
| Date of Admission | `admissionDate`   | YYYY-MM-DD   | PatientInput        |
| Date of Discharge | `dischargeDate`   | YYYY-MM-DD   | PatientInput        |

Both fields are required in PatientInput and both must appear in the
Mode 1 Clinical Discharge Summary output.

**Output format in Mode 1:**
```
Date of admission: 2024-11-10
Date of discharge: 2024-11-14
```

Never rendered as:
```
Date: 2024-11-14          ← WRONG — violates FMOH dual-date requirement
```

---

## 3. MDCN Licence Number on Clinical Records

The Medical and Dental Council of Nigeria (MDCN) requires that clinical
discharge records identify the discharging clinician by their full name and
MDCN registration number.

| Required Element         | CareFlow Field        | Schema Location |
|--------------------------|-----------------------|-----------------|
| Discharging clinician name | `dischargedBy`      | PatientInput    |
| MDCN licence number      | `clinicianLicenseNo`  | PatientInput    |

`dischargedBy` is **required**. `clinicianLicenseNo` is optional in the
schema but must be recommended to the clinician during form input.

**Output in Mode 1 — Discharged By block:**
```
Discharged by
Name:              Dr. Emeka Okafor
MDCN Licence No.:  MDCN/2015/07821
```

This block must always appear in Mode 1 output. It must never be omitted,
even if `clinicianLicenseNo` is not provided (show "Not provided").

---

## 4. Required Discharge Summary Structure

FMOH specifies that a hospital discharge summary must include the following
elements in a logical clinical order. CareFlow's Mode 1 output must cover
all of them.

| # | FMOH Required Element           | CareFlow Mode 1 Section           | Required? |
|---|---------------------------------|-----------------------------------|-----------|
| 1 | Facility identification         | Facility (name, FMOH code, ward)  | Yes       |
| 2 | Patient identification          | Patient information               | Yes       |
| 3 | Date of admission               | Patient information (admissionDate)| Yes      |
| 4 | Date of discharge               | Patient information (dischargeDate)| Yes      |
| 5 | Principal diagnosis             | Diagnosis                         | Yes       |
| 6 | Secondary diagnoses (if any)    | Diagnosis                         | Conditional|
| 7 | Treatment and management        | Treatment provided                | Yes       |
| 8 | Procedures performed            | Procedures performed              | Yes (or "None documented") |
| 9 | Medications at discharge        | Medications (table)               | Yes       |
| 10| Follow-up plan                  | Follow-up instructions            | Yes (or flagged if absent) |
| 11| Warnings / safety information   | Red flag warnings                 | Yes — always |
| 12| Clinician identification        | Discharged by                     | Yes       |

---

## 5. Medication Documentation Standards

FMOH and WHO IPS require that medications at discharge be documented with:

| Required Element   | CareFlow Field             | Required in Schema |
|--------------------|----------------------------|--------------------|
| Medication name    | `medications[*].name`      | Yes                |
| Dosage             | `medications[*].dosage`    | Yes                |
| Frequency          | `medications[*].frequency` | Yes                |
| Timing             | `medications[*].timing`    | No (recommended)   |
| Duration           | `medications[*].duration`  | No (recommended)   |

If dosage or frequency is missing when the AI generates output, the AI must
state: `"Dosage/frequency not provided for [name] — do not issue without
verification from the treating clinician."`

**Mode 1 medication output format:**
```
Medications
| Medication  | Dosage | Frequency   | Timing    | Duration | Notes |
|-------------|--------|-------------|-----------|----------|-------|
| Amlodipine  | 5mg    | Once daily  | Any time  | Ongoing  | —     |
| Metformin   | 500mg  | Twice daily | With food | Ongoing  | —     |
```

---

## 6. Red Flag Warnings — Always Required

FMOH patient safety guidelines require that every discharge document include
clear safety information: the warning signs that should prompt the patient to
return immediately.

**The Red Flag Warnings section must always be present in Mode 1 output.**
It must never be omitted, even if the clinician did not explicitly provide
red flag information. The AI must generate appropriate red flags based on
the documented diagnosis.

**Example (for hypertension + diabetes case):**
```
Red flag warnings
Return immediately if experiencing: chest pain, severe headache, difficulty
breathing, sudden weakness, vision changes, very high or very low blood sugar
symptoms, or worsening of any symptoms.
```

---

## 7. Facility Identification

FMOH requires that all hospital documents identify the originating facility.
CareFlow must include facility identification on all Mode 1 output.

| FMOH Required Element  | CareFlow Field   | Schema Location |
|------------------------|------------------|-----------------|
| Facility name          | `facilityName`   | PatientInput    |
| FMOH registration code | `facilityCode`   | PatientInput    |
| Ward / unit            | `wardName`       | PatientInput    |

---

## 8. Patient Identification

FMOH requires that the patient be identified unambiguously on all clinical records.

| FMOH Required Element     | CareFlow Field      | Schema Location |
|---------------------------|---------------------|-----------------|
| Full name                 | `patientName`       | PatientInput    |
| Age                       | `age`               | PatientInput    |
| Sex / gender              | `gender`            | PatientInput    |
| Hospital (facility) number| `hospitalNumber`    | PatientInput    |
| NHIS number (if applicable)| `nhisNumber`       | PatientInput    |

---

## 9. Only Doctor Can Sign Off

MDCN Guidelines require that clinical discharge summaries be verified and
signed off by a licensed medical doctor. Nurses may prepare the documentation,
but a Doctor must finalise it.

**CareFlow implementation:**
- Only users with `userRole = "doctor"` can set `DischargeRecord.status = "finalised"`
- The Finalise action requires the Doctor's authenticated session
- The `dischargedBy` field stores the Doctor's name and `clinicianLicenseNo`
  stores their MDCN licence number for the clinical record

---

## 10. FMOH Compliance Checklist

The agent must verify all items below before any discharge record feature is
considered complete.

### Form / Input
- [ ] `admissionDate` and `dischargeDate` are two separate required fields
- [ ] `patientName`, `age`, `gender`, `hospitalNumber` are all required fields
- [ ] `facilityName` is required
- [ ] `diagnosis` is required
- [ ] `treatmentGiven` is required
- [ ] `medications` requires at least one row with name, dosage, and frequency
- [ ] `dischargedBy` is required
- [ ] `clinicianLicenseNo` is presented as a recommended optional field

### Mode 1 Output Structure
- [ ] Facility section present (name, FMOH code, ward)
- [ ] Patient information includes admissionDate AND dischargeDate as separate lines
- [ ] Diagnosis section present and non-empty
- [ ] Treatment provided section present
- [ ] Procedures performed section present (or "None documented")
- [ ] Medications table present with name, dosage, frequency, timing, duration
- [ ] Follow-up instructions section present (or flagged if absent)
- [ ] Red flag warnings section always present — never omitted
- [ ] Discharged by section present with clinician name and MDCN number

### Role Enforcement
- [ ] Only Doctor role can finalise a record
- [ ] Finalisation recorded in AuditLog with Doctor's userId and role

### Output Safety
- [ ] Missing medication dosage/frequency flagged explicitly
- [ ] Missing follow-up instructions flagged explicitly
- [ ] AI-generated red flags present even when clinician did not provide them

---

## Constraints

- Never omit the Red Flag Warnings section from Mode 1 output
- Never omit the Discharged By section from Mode 1 output
- Never use a single Date field — always admissionDate and dischargeDate separately
- Never allow a Nurse or Admin to finalise a record
- Never generate a Mode 1 output without the Facility section
- Never omit a medication's dosage or frequency without explicitly flagging it
- Never allow `clinicalSummary` to be empty or null in a created DischargeRecord

---

*CareFlow AI — FMOH Patient Record Standards Compliance Reference v1.0*
*Internal use only.*
