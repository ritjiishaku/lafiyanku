# NDPR 2019 Compliance Reference
# File: /.agents/compliance/ndpr.md
# Version: 1.0
# Last Updated: June 2026
# PRD Reference: CFW-PRD-001 v1.0
# Purpose: NDPR 2019 compliance requirements, obligations, data subject rights, and compliance checklist.

---

## 1. Overview

The Nigeria Data Protection Regulation (NDPR) 2019, issued by the National
Information Technology Development Agency (NITDA), governs the processing of
personal data of Nigerian citizens. Patient health data processed by
CareFlow is sensitive personal data under NDPR and is subject to its
highest level of protection.

Non-compliance with NDPR can result in fines of up to 10 million naira or
2% of annual gross revenue, whichever is higher, and reputational damage
that could end a hospital procurement relationship.

---

## 2. Lawful Basis for Processing

CareFlow processes patient health data on the basis of **explicit consent**.

### Requirements

- Consent must be obtained at the point of PatientInput form submission
- Consent must be **explicit, informed, and freely given**
- The consent form must clearly state:
  - What data is being collected
  - How it will be used (to generate discharge documentation)
  - Who will have access to it (clinical staff of the treating facility)
  - How long it will be retained
  - The patient's right to withdraw consent

### Implementation

- Display a consent notice before or at the start of the PatientInput form
- Require the clinician to confirm that patient consent has been obtained
  (checkbox: "I confirm the patient has been informed and has consented to
  the processing of their health data for discharge documentation purposes")
- Store the consent timestamp alongside the PatientInput record
- Do not proceed to AI generation without consent confirmation

---

## 3. Data Residency

**Nigerian patient data must remain within Nigeria.**

- All database servers, object storage, and AI processing must be hosted
  in Nigerian data centres OR in data centres with a binding contractual
  guarantee of Nigerian data residency
- Do not use cloud regions or infrastructure outside Nigeria for any
  component that stores, processes, or transmits patient data
- This applies to: PatientInput, DischargeRecord, TranslationRequest,
  AuditLog, and any backups of these
- Third-party AI models used for generation or translation must either
  process data within Nigeria or under a data processing agreement (DPA)
  that guarantees Nigerian data residency and NDPR compliance

---

## 4. Data Minimisation

Collect only the data necessary to generate discharge documentation.

- Do not collect data fields not defined in the PatientInput schema
- Do not store raw conversation logs, keystrokes, or intermediate AI
  generation outputs beyond what is defined in DischargeRecord
- Optional fields (nhisNumber, facilityCode, clinicianLicenseNo, etc.)
  must remain optional — do not make them required as a data grab

---

## 5. Data Subject Rights

CareFlow must support the following rights for patients whose data is processed:

### 5.1 Right of Access
- A patient (or their authorised representative) can request a copy of all
  data held about them
- Implementation: Admin can export all PatientInput and DischargeRecord
  data for a given `patientName` + `hospitalNumber` combination

### 5.2 Right of Correction
- A patient can request that incorrect data be corrected
- Implementation: Doctor can update PatientInput fields and regenerate the
  DischargeRecord; all changes logged in AuditLog

### 5.3 Right of Deletion ("Right to be Forgotten")
- A patient can request permanent deletion of all their data
- Implementation: Hard-delete PatientInput, DischargeRecord, TranslationRequest
  rows for the patient; retain AuditLog for compliance purposes but anonymise
  the patient-identifying fields (patientName, hospitalNumber)
- Deletion must be irreversible — no soft-delete for patient data subject requests

### 5.4 Right of Portability
- A patient can request their data in a portable, machine-readable format
- Implementation: Export as structured JSON or PDF on request

### 5.5 Right to Withdraw Consent
- A patient can withdraw consent at any time
- Effect: No further processing of their data after withdrawal
- Previously generated records are retained for clinical governance purposes
  but must be flagged as "consent withdrawn — no further processing"

---

## 6. Data Retention

- Discharge records must not be retained longer than necessary for clinical
  and legal purposes
- Recommended retention period: **5 years** (aligned with FMOH clinical
  record retention guidelines)
- After the retention period, records must be archived (status: `archived`)
  and then permanently deleted on schedule
- Retention policy must be documented and applied consistently

---

## 7. Breach Notification

- Any breach of patient personal data must be reported to **NITDA within 72 hours**
  of discovery
- The system must maintain an incident log (separate from AuditLog)
- Affected patients must be notified if the breach is likely to result in
  high risk to their rights and freedoms
- Breach notification workflow must be documented and tested before v1.0 release

### Required breach notification content (to NITDA)
1. Nature of the breach
2. Categories and approximate number of data subjects affected
3. Categories and approximate number of records affected
4. Contact details of the Data Protection Officer (DPO)
5. Likely consequences of the breach
6. Measures taken to address the breach

---

## 8. Data Protection Officer (DPO)

- CareFlow (as a data processor handling health data) must appoint a DPO
- The DPO must be registered with NITDA
- DPO contact details must be displayed in the app's privacy policy
- DPO must conduct an annual data protection audit

---

## 9. Technical and Organisational Measures

| Measure                   | Implementation                                               |
|---------------------------|--------------------------------------------------------------|
| Encryption in transit     | TLS 1.3 minimum on all connections                           |
| Encryption at rest        | AES-256 on all patient data fields                           |
| Access control            | Role-based; server-side enforcement; Doctor/Nurse/Admin only |
| Audit logging             | Immutable AuditLog on every record action                    |
| IP address logging        | Logged on every AuditLog entry (encrypted at rest)           |
| Data minimisation         | Only fields in PatientInput schema collected                 |
| Consent capture           | Clinician consent confirmation at form submission            |
| Data residency            | Nigerian infrastructure or DPA-covered providers only        |
| Breach notification       | 72-hour NITDA notification workflow documented               |
| Retention policy          | 5-year retention; scheduled deletion after archival          |

---

## 10. NDPR Compliance Checklist

The agent must verify all items below are implemented before any feature
touching patient data is considered complete.

- [ ] Consent notice displayed and clinician confirmation required before form submission
- [ ] Consent timestamp stored with PatientInput record
- [ ] All patient data encrypted in transit (TLS 1.3)
- [ ] All patient data encrypted at rest (AES-256)
- [ ] IP address logged on every AuditLog entry and encrypted at rest
- [ ] Role-based access control enforced server-side on all patient data endpoints
- [ ] Data stored within Nigerian data residency boundaries
- [ ] Data subject access request workflow implemented (Admin export)
- [ ] Data subject deletion workflow implemented (hard delete + AuditLog anonymisation)
- [ ] Data retention policy set to 5 years; automated archival and deletion scheduled
- [ ] Breach notification workflow documented; NITDA 72-hour requirement met
- [ ] DPO appointed and registered with NITDA
- [ ] Privacy policy published with DPO contact details
- [ ] Annual data protection audit scheduled

---

## Constraints

- Never process patient data without consent confirmation
- Never store patient data outside Nigerian data residency boundaries
- Never soft-delete patient data in response to a data subject deletion request
  (hard-delete required; AuditLog retained but anonymised)
- Never omit IP address logging from AuditLog entries
- Never retain patient records beyond the 5-year retention period without
  documented clinical or legal justification
- Never delay breach notification to NITDA beyond 72 hours of discovery
- Monitor NITDA guidance quarterly — NDPR may be updated or amended

---

*CareFlow — NDPR 2019 Compliance Reference v1.0*
*Internal use only.*
