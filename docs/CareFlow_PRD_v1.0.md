# CareFlow AI — PRD Reference Card
# File: /docs/CareFlow_PRD_v1.0.md
# Version: 1.0
# Last Updated: June 2026
# PRD Reference: CFW-PRD-001 v1.0
# Purpose: Agent-readable condensed PRD — problem, goals, all requirements, compliance, KPIs, milestones.

---

## 1. Problem Statement

### 1.1 Clinical Documentation Gap
- Clinicians spend 15–30 minutes per discharge producing summaries that are
  often incomplete, inconsistently formatted, or written in clinical language
  inaccessible to the patient
- Four failure modes: incomplete summaries · clinical-only language ·
  zero translation · no audit trail

### 1.2 Patient Communication Gap
- Fewer than 18% of Nigerian hospitals use EMRs
- English-only discharge documents create an immediate health literacy barrier
  for Hausa, Yoruba, and Igbo-speaking patients
- Leads to: medication non-adherence · missed follow-ups · avoidable readmissions

### 1.3 Workforce Pressure
- Nigeria's physician-to-patient ratio: 0.4 per 1,000 (WHO standard not met)
- Every minute saved per discharge compounds at scale across a stretched workforce

---

## 2. Product Goals

| Goal                       | Description                                                   | Target Metric                                      |
|----------------------------|---------------------------------------------------------------|----------------------------------------------------|
| Reduce documentation time  | Reduce average discharge documentation time per patient       | ~20 min → under 5 min                             |
| Improve completeness       | All required fields present before finalisation               | Zero incomplete discharges post-review             |
| Improve patient literacy   | Patients understand medications, follow-up, and red flags     | ≥80% comprehension score in pilot                 |
| Enable multilingual access | Hausa, Yoruba, Igbo translation on demand                     | 100% of translation requests fulfilled            |
| Achieve compliance         | NDPR-compliant audit trail on all generated records           | 100% of records carry full generation metadata    |

---

## 3. Functional Requirements

### 3.1 Input Collection — Must Have

| ID    | Requirement                                                                     | Priority  |
|-------|---------------------------------------------------------------------------------|-----------|
| FR-01 | Structured form covering all PatientInput schema fields                         | Must have |
| FR-02 | Required fields validated before AI generation is triggered                     | Must have |
| FR-03 | Missing required fields → clear, field-specific error message                   | Must have |
| FR-04 | Optional fields clearly labelled; do not block form submission                  | Must have |
| FR-05 | Medication entry supports multiple rows (name, dosage, frequency, timing, duration) | Must have |
| FR-06 | Language selector available as optional input (en / ha / yo / ig)               | Must have |
| FR-07 | Save-as-draft before generation is triggered                                    | Should have |
| FR-08 | Form usable on a smartphone on 4G or lower                                      | Must have |

### 3.2 AI Generation Engine

| ID    | Requirement                                                                     | Priority  |
|-------|---------------------------------------------------------------------------------|-----------|
| FR-09 | Generate complete Mode 1 (Clinical Discharge Summary) from validated input      | Must have |
| FR-10 | Generate complete Mode 2 (Patient-Friendly Instructions) from validated input   | Must have |
| FR-11 | Never invent clinical information not in the input                              | Must have |
| FR-12 | Never generate diagnoses not provided by the clinician                          | Must have |
| FR-13 | Never prescribe new medications or alter existing doses                         | Must have |
| FR-14 | Flag all missing required fields before generating                              | Must have |
| FR-15 | Flag contradictory input; prompt clinician review                               | Must have |
| FR-16 | Always include Red Flag Warnings section in Mode 1                              | Must have |
| FR-17 | Always include Discharged By block in Mode 1                                    | Must have |
| FR-18 | Generate translated output when language is requested                           | Must have |
| FR-19 | Low-confidence translation → default to English and state limitation clearly    | Must have |
| FR-20 | Stamp every record with metadata: prompt version, model version, UTC timestamp, user ID | Must have |

### 3.3 Output and Delivery

| ID    | Requirement                                                                     | Priority    |
|-------|---------------------------------------------------------------------------------|-------------|
| FR-21 | Display Mode 1 and Mode 2 side-by-side or as switchable tabs                   | Must have   |
| FR-22 | Output editable by generating clinician before finalisation                     | Must have   |
| FR-23 | Only Doctor role can finalise a record                                          | Must have   |
| FR-24 | Output exportable as printable format (PDF or equivalent)                       | Must have   |
| FR-25 | Patient-friendly output shareable via WhatsApp (plain text, no separators)      | Should have |
| FR-26 | Translated output appears below English in printed output                       | Should have |
| FR-27 | Printed output includes facility name, patient name, discharge date, clinician name as header | Must have |

---

## 4. Non-Functional Requirements

| Category      | Requirement                                  | Target                                          |
|---------------|----------------------------------------------|-------------------------------------------------|
| Performance   | AI generation time (Mode 1 + Mode 2)         | Under 15 seconds on 4G                          |
| Performance   | Form submission → output render              | Under 20 seconds end-to-end                     |
| Reliability   | System uptime                                | ≥99% during 06:00–22:00 WAT                     |
| Reliability   | Poor connectivity behaviour                  | Form caches locally; submits when restored      |
| Security      | Data in transit                              | TLS 1.3 minimum                                 |
| Security      | Data at rest                                 | AES-256 minimum                                 |
| Security      | Role-based access control                    | Server-side enforced — no client-side gates     |
| Compliance    | NDPR 2019                                    | Full: consent, residency, audit, breach notify  |
| Compliance    | FMOH patient record standards                | Full: field mapping documented and verified     |
| Accessibility | Minimum device                               | Android 8.0, 2GB RAM, 3G/4G                     |
| Accessibility | First-time usability                         | New user completes first discharge in ≤10 min   |
| Localisation  | UI language at v1.0                          | English only (Pidgin planned for v1.1)          |
| Scalability   | Concurrent users per hospital instance       | ≥50 without degradation                         |
| Auditability  | Action logging                               | 100% — no action without an AuditLog entry      |

---

## 5. Role Access Matrix

| Action                           | Doctor | Nurse | Admin |
|----------------------------------|--------|-------|-------|
| Submit form / trigger AI         | ✅     | ✅    | ❌    |
| View Mode 1 (clinical summary)   | ✅     | ✅    | ❌    |
| View Mode 2 (patient-friendly)   | ✅     | ✅    | ✅    |
| Edit generated output            | ✅     | ✅    | ❌    |
| Finalise a discharge record      | ✅     | ❌    | ❌    |
| Archive a record                 | ✅     | ❌    | ✅    |
| Export or print                  | ✅     | ✅    | ❌    |
| View audit log                   | ❌     | ❌    | ✅    |
| Access translated output         | ✅     | ✅    | ✅    |

---

## 6. Compliance Mapping

| Standard                          | Requirement                                                        | CareFlow Response                                                        |
|-----------------------------------|--------------------------------------------------------------------|--------------------------------------------------------------------------|
| NDPR 2019                         | Lawful basis; data residency; breach notification; subject rights  | Consent at submission; audit log; breach workflow; deletion on request   |
| FMOH Patient Record Standards     | Dual dates; MDCN licence; standardised summary structure           | Both dates required; MDCN field in schema; FMOH section order enforced   |
| WHO International Patient Summary | Medications; follow-up; red flags; patient-accessible format       | Full medication table; red flags mandatory; Mode 2 patient-accessible    |
| MDCN Guidelines                   | Licensed clinician signs record; non-clinical staff cannot alter   | Only Doctor finalises; MDCN field stored; audit trail on all actions     |
| Clinical Safety                   | AI output must not replace clinical judgement                      | All output is draft until Doctor finalises; AI cannot invent clinical data |

---

## 7. Success KPIs

| Metric                              | Baseline               | v1.0 Target                                        | Measurement                                   |
|-------------------------------------|------------------------|----------------------------------------------------|-----------------------------------------------|
| Avg. discharge documentation time   | ~20 minutes            | Under 5 minutes                                    | Timestamp: form open → record finalised       |
| Discharge record completeness rate  | ~60% complete          | ≥98% complete                                      | Automated field completeness check            |
| Patient comprehension score         | Not measured           | ≥80% on 3-question check at discharge              | Pilot survey at 2 partner hospitals           |
| Translation request rate            | 0%                     | ≥30% of records in pilot                           | TranslationRequest count / DischargeRecord count |
| Translation high-confidence rate    | N/A                    | ≥90% rated high confidence                         | translationConfidence field aggregate         |
| Clinician time saved per week       | ~5 hrs / 15 patients   | ≥3 hours saved per clinician per week              | Self-reported + timestamp analysis            |
| Audit log coverage                  | 0% (no digital audit)  | 100% of actions logged                             | AuditLog count vs action events               |
| System uptime (operating hours)     | N/A                    | ≥99%                                               | Uptime monitoring                             |

---

## 8. Milestones

| Milestone | Scope                                                                    | Target  |
|-----------|--------------------------------------------------------------------------|---------|
| M1        | System prompt locked; schemas approved; UI wireframes done               | Week 2  |
| M2        | PatientInput form + AI generation (Mode 1 + Mode 2) + output display     | Week 4  |
| M3        | Auth + role system; translation; audit logging; export/print             | Week 7  |
| M4        | 2 partner hospitals onboarded; clinician training                        | Week 10 |
| M5        | Pilot feedback integrated; NDPR audit complete; v1.0 public release      | Week 14 |
| M6        | WhatsApp send; Pidgin UI; EHR scoping; additional languages (v1.1)       | Week 18 |

---

## 9. Open Risks

| Risk                                               | Category          | Mitigation                                                       |
|----------------------------------------------------|-------------------|------------------------------------------------------------------|
| LLM translation errors in ha/yo/ig → patient safety risk | Clinical safety | Flag low-confidence; require human review; native speaker validation |
| Intermittent power and internet at Nigerian hospitals | Infrastructure  | Offline-first form caching; design for 3G minimum               |
| Clinician resistance to AI-generated records       | Adoption          | Position as drafting assistant; doctor-finalises model           |
| NDPR regulatory changes                            | Regulatory        | Modular compliance architecture; monitor NITDA quarterly         |
| Long hospital procurement cycles                   | Commercial        | Free pilot-to-contract model; build clinical evidence in pilot   |

---

## Constraints

- Do not add features not listed in this PRD
- Do not implement EHR integration or voice capture (v1.1 scope)
- Do not allow any role other than Doctor to finalise a record
- Do not use a single Date field — always admissionDate and dischargeDate separately
- Do not skip AuditLog entries for any action on a discharge record

---

*CareFlow AI — CFW-PRD-001 v1.0 Reference Card*
*Internal use only.*
