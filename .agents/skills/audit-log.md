# AuditLog Schema Reference
# File: /.agents/schemas/audit-log.md
# Version: 1.0
# Last Updated: June 2026
# PRD Reference: CFW-PRD-001 v1.0
# Purpose: Full AuditLog schema — every field, action enum, immutability rule, NDPR obligation, examples.

---

## 1. Schema Overview

AuditLog is the immutable record of every action taken on every
DischargeRecord. It is the primary compliance instrument for NDPR 2019
Article 2.6 (data integrity and accountability). One entry is written per
action. Entries are never updated or deleted.

**Rule:** No action on a DischargeRecord is complete until its AuditLog
entry has been successfully written.

---

## 2. AuditLog Schema (Full)

```
Field           Type              Required   Description
──────────────────────────────────────────────────────────────────────────────
logId           UUID              Yes        System-generated unique ID for this
                                             log entry. Never reused.

recordId        UUID              Yes        Foreign key → DischargeRecord.recordId.
                                             Every log entry is tied to one record.

userId          string            Yes        ID of the authenticated user who
                                             performed the action.

userRole        enum              Yes        Role of the user at the time of action.
                                             One of: doctor | nurse | admin

action          enum              Yes        The action that was performed.
                                             One of: generate | edit | view |
                                             finalise | archive | print | export

timestamp       datetime UTC      Yes        ISO 8601 UTC timestamp of the action.
                                             Set at the moment of the action.

ipAddress       string            No*        IP address of the user's request.
                                             Required for NDPR Article 2.6 compliance.
                                             Log "unknown" if IP cannot be determined.
                                             *Treat as required in practice.

changesDiff     JSON              No         Structured before/after diff of the fields
                                             that changed.
                                             Required when action = "edit".
                                             Must be null for all other actions.

notes           string            No         Human-readable note about the action.
                                             Used for additional context (e.g. which
                                             language was translated, which PDF was exported).
```

---

## 3. Action Enum — Full Reference

| Action      | When It Is Written                                                         | changesDiff Required? |
|-------------|----------------------------------------------------------------------------|-----------------------|
| `generate`  | AI generation completes and DischargeRecord is written                     | No — null             |
| `edit`      | Any field in the DischargeRecord is changed by a clinician post-generation | Yes                   |
| `view`      | A user opens and views a DischargeRecord (log once per session per record) | No — null             |
| `finalise`  | Doctor changes status from `draft` to `finalised`                          | Yes — status diff     |
| `archive`   | Doctor or Admin changes status to `archived`                               | Yes — status diff     |
| `print`     | Doctor or Nurse triggers the paper print handout action                    | No — null             |
| `export`    | Doctor or Nurse exports PDF; or shares via WhatsApp                        | No — null             |

---

## 4. changesDiff Structure

Required only when `action = "edit"` or `action = "finalise"` or
`action = "archive"`. Must be `null` for all other action types.

```json
{
  "fieldName": {
    "before": "previous value",
    "after": "new value"
  }
}
```

Multiple fields changed in a single edit:

```json
{
  "patientFriendlyOutput": {
    "before": "Take Amlodipine once daily.",
    "after": "Take Amlodipine once daily in the morning."
  },
  "clinicalSummary": {
    "before": "Follow-up in 2 weeks.",
    "after": "Follow-up in 2 weeks. Patient advised to monitor blood pressure daily."
  }
}
```

Status change:

```json
{
  "status": {
    "before": "draft",
    "after": "finalised"
  }
}
```

---

## 5. Immutability Rule

**AuditLog entries are immutable. They must never be updated or deleted.**

- No `UPDATE` or `DELETE` operations are permitted on the AuditLog table
- The database table must have constraints enforcing this
- If an entry was written incorrectly, write a new corrective entry with a
  `notes` field explaining the correction — never modify the original
- This rule applies to all user roles including admin and system processes
- Backup and restore processes must preserve the full AuditLog without modification

---

## 6. NDPR Article 2.6 Requirements

The AuditLog satisfies NDPR 2019 Article 2.6 (integrity and confidentiality)
by providing:

- **Who** performed the action: `userId` + `userRole`
- **What** action was performed: `action` enum
- **When** it happened: `timestamp` (UTC)
- **Where** the request originated: `ipAddress`
- **What changed**: `changesDiff` (for edit and status transitions)
- **Which record** was acted on: `recordId`

**IP Address requirement:** `ipAddress` must be logged on every entry.
If the IP cannot be resolved (e.g. proxy stripping headers), log
`"unknown"` — do not omit the field. IP addresses are personal data under
NDPR and must be encrypted at rest.

---

## 7. Completed Example Entries (All Action Types)

### generate

```json
{
  "logId": "log-a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "recordId": "rec-a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "userId": "user-emeka-001",
  "userRole": "doctor",
  "action": "generate",
  "timestamp": "2024-11-14T10:30:00Z",
  "ipAddress": "197.210.64.1",
  "changesDiff": null,
  "notes": "Generation successful. promptVersion: v2.0. modelVersion: deepseek-v3. Translation: ha. Confidence: high."
}
```

### edit

```json
{
  "logId": "log-b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "recordId": "rec-a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "userId": "user-emeka-001",
  "userRole": "doctor",
  "action": "edit",
  "timestamp": "2024-11-14T10:35:00Z",
  "ipAddress": "197.210.64.1",
  "changesDiff": {
    "patientFriendlyOutput": {
      "before": "Take Amlodipine once daily.",
      "after": "Take Amlodipine once daily in the morning."
    }
  },
  "notes": "Clinician edited medication timing in patient-friendly output."
}
```

### view

```json
{
  "logId": "log-c3d4e5f6-a7b8-9012-cdef-123456789012",
  "recordId": "rec-a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "userId": "user-fatima-002",
  "userRole": "nurse",
  "action": "view",
  "timestamp": "2024-11-14T10:40:00Z",
  "ipAddress": "197.210.64.2",
  "changesDiff": null,
  "notes": null
}
```

### finalise

```json
{
  "logId": "log-d4e5f6a7-b8c9-0123-defa-234567890123",
  "recordId": "rec-a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "userId": "user-emeka-001",
  "userRole": "doctor",
  "action": "finalise",
  "timestamp": "2024-11-14T10:45:00Z",
  "ipAddress": "197.210.64.1",
  "changesDiff": {
    "status": {
      "before": "draft",
      "after": "finalised"
    }
  },
  "notes": "Record finalised by discharging clinician. MDCN: MDCN/2015/07821."
}
```

### archive

```json
{
  "logId": "log-e5f6a7b8-c9d0-1234-efab-345678901234",
  "recordId": "rec-a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "userId": "user-chidi-003",
  "userRole": "admin",
  "action": "archive",
  "timestamp": "2024-11-14T12:00:00Z",
  "ipAddress": "197.210.64.3",
  "changesDiff": {
    "status": {
      "before": "finalised",
      "after": "archived"
    }
  },
  "notes": "Record archived by admin."
}
```

### print

```json
{
  "logId": "log-f6a7b8c9-d0e1-2345-fabc-456789012345",
  "recordId": "rec-a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "userId": "user-fatima-002",
  "userRole": "nurse",
  "action": "print",
  "timestamp": "2024-11-14T10:50:00Z",
  "ipAddress": "197.210.64.2",
  "changesDiff": null,
  "notes": "Patient handout printed. Mode 2. Language: ha. Translation included: true."
}
```

### export

```json
{
  "logId": "log-a7b8c9d0-e1f2-3456-abcd-567890123456",
  "recordId": "rec-a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "userId": "user-emeka-001",
  "userRole": "doctor",
  "action": "export",
  "timestamp": "2024-11-14T10:55:00Z",
  "ipAddress": "197.210.64.1",
  "changesDiff": null,
  "notes": "Clinical PDF exported. Mode 1. Doctor role."
}
```

---

## 8. Who Can Access the AuditLog

| Role   | Read Access | Write Access (system only) |
|--------|-------------|----------------------------|
| Doctor | ❌          | ❌                         |
| Nurse  | ❌          | ❌                         |
| Admin  | ✅ (own facility only) | ❌               |
| System | ❌ (read)   | ✅ (write on action)       |

Write access is system-only — triggered by service functions, never by
direct user API calls.

---

## Constraints

- Never update or delete an AuditLog entry under any circumstance
- Never allow Doctor or Nurse roles to read the AuditLog
- Never omit the `changesDiff` field when `action = "edit"`
- Never set `changesDiff` to a non-null value for non-edit/non-status-change actions
- Never omit `ipAddress` — log `"unknown"` if unavailable but never omit the field
- Never allow `recordId` to be null
- Never allow `userId` to be null or `"unauthenticated"` for a completed action
- Treat AuditLog write failure as a critical system error — alert and never
  proceed silently

---

*CareFlow AI — AuditLog Schema Reference v1.0*
