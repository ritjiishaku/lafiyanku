# Security Requirements
# File: /.agents/security.md
# Version: 1.0
# Last Updated: June 2026
# PRD Reference: CFW-PRD-001 v1.0
# Purpose: Security rules, encryption standards, RBAC enforcement, NDPR obligations, and input sanitisation.

---

## 1. Encryption

### 1.1 Data in Transit
- **Standard:** TLS 1.3 minimum
- All API requests and responses must travel over HTTPS
- HTTP requests must be redirected to HTTPS — never served as-is
- WebSocket connections (if used) must use WSS (WebSocket Secure)
- TLS certificates must be valid and auto-renewed

### 1.2 Data at Rest
- **Standard:** AES-256 minimum
- All patient data fields in the database must be encrypted at rest
- Encryption keys must be stored separately from the data they protect
- Key rotation must be supported without data loss
- Backup data must be encrypted to the same standard as production data

---

## 2. Role-Based Access Control (RBAC)

### 2.1 The Core Rule
**Role-based access control must be enforced server-side on every request.**
Client-side role checks (hiding/showing UI elements) are for UX only.
They are never the security boundary.

A user who manipulates the client (removes a disabled attribute, crafts a
direct API request) must be blocked at the server. The server must always
re-validate the role before executing any role-sensitive action.

### 2.2 Role Permission Table

| Action                             | doctor | nurse | admin |
|------------------------------------|--------|-------|-------|
| POST /discharge/new (form submit)  | ✅     | ✅    | ❌    |
| POST /discharge/:id/generate       | ✅     | ✅    | ❌    |
| GET /discharge/:id/mode1           | ✅     | ✅    | ❌    |
| GET /discharge/:id/mode2           | ✅     | ✅    | ✅    |
| PUT /discharge/:id/edit            | ✅     | ✅    | ❌    |
| POST /discharge/:id/finalise       | ✅     | ❌    | ❌    |
| POST /discharge/:id/archive        | ✅     | ❌    | ✅    |
| GET /discharge/:id/export          | ✅     | ✅    | ❌    |
| GET /discharge/:id/translation     | ✅     | ✅    | ✅    |
| GET /audit/:recordId               | ❌     | ❌    | ✅    |

### 2.3 Forbidden Role Escalation

The following must never be possible under any circumstance:

- A Nurse finalising a discharge record
- An Admin submitting a PatientInput form or triggering AI generation
- An Admin viewing Mode 1 (clinical summary) output
- Any unauthenticated user accessing any discharge or audit endpoint
- Any role viewing another facility's records (multi-tenant isolation required)

### 2.4 Server-Side Guard Pattern

```ts
function requireRole(permittedRoles: Array<"doctor" | "nurse" | "admin">) {
  return (req, res, next) => {
    const userRole = req.user?.role
    const userId = req.user?.id ?? "unauthenticated"

    if (!userRole || !permittedRoles.includes(userRole)) {
      // Log the attempt
      writeAuditLog({
        recordId: req.params.id ?? null,
        userId,
        userRole: userRole ?? "unknown",
        action: "view",
        timestamp: new Date().toISOString(),
        ipAddress: req.ip,
        notes: `Unauthorised access attempt. Required: ${permittedRoles.join(", ")}. Actual: ${userRole}`
      }).catch(err => systemErrorLogger.critical("AUDIT_LOG_WRITE_FAILED", err))

      return res.status(403).json({
        error: true,
        code: "ROLE_NOT_PERMITTED",
        message: `This action requires one of: ${permittedRoles.join(", ")}.`,
        timestamp: new Date().toISOString()
      })
    }
    next()
  }
}
```

---

## 3. NDPR 2019 Compliance

### 3.1 Lawful Basis for Processing
- Patient health data is sensitive personal data under NDPR 2019
- Lawful basis: **consent** — collected at the point of form submission
- Consent must be explicit, informed, and recorded
- The system must store a consent timestamp alongside each PatientInput record

### 3.2 Data Residency
- **Nigerian patient data must remain within Nigeria**
- All database servers, storage buckets, and AI processing endpoints must
  be hosted in Nigerian data centres or in data centres with a binding
  Nigerian data residency contractual guarantee
- Do not use cloud regions outside Nigeria for any component that stores or
  processes patient data

### 3.3 Data Subject Rights
The system must support the following data subject rights on request:

| Right               | Required Action                                                        |
|---------------------|------------------------------------------------------------------------|
| Right of Access     | Export all records associated with a patient ID in readable format     |
| Right of Correction | Allow authorised clinician to correct patient data fields              |
| Right of Deletion   | Hard-delete all patient data associated with a patient ID on request   |
| Right of Portability| Export patient records in a standard machine-readable format           |

### 3.4 Breach Notification
- Any breach of patient data must be reported to NITDA within **72 hours**
- The system must maintain an incident log separate from the AuditLog
- Breach notification workflow must be documented before v1.0 release

### 3.5 IP Address Logging
- Every AuditLog entry must include the `ipAddress` of the user performing
  the action
- This is required under NDPR Article 2.6 for data integrity and
  accountability
- IP addresses are stored in the AuditLog schema's `ipAddress` field
- IP addresses must themselves be encrypted at rest (they are personal data)

---

## 4. Input Sanitisation

**All form inputs must be sanitised before storage or AI processing.**

### 4.1 Rules

- Strip all HTML tags from free-text fields (diagnosis, treatmentGiven,
  additionalNotes, followUpInstructions, medications[*].notes)
- Reject inputs containing script tags, SQL injection patterns, or
  executable code — return error `INVALID_FIELD_VALUE`
- Enforce maximum character lengths on all string fields:

| Field                   | Max Length |
|-------------------------|------------|
| `patientName`           | 200 chars  |
| `facilityName`          | 300 chars  |
| `diagnosis`             | 2000 chars |
| `treatmentGiven`        | 3000 chars |
| `followUpInstructions`  | 2000 chars |
| `additionalNotes`       | 2000 chars |
| `medications[*].name`   | 200 chars  |
| `medications[*].notes`  | 500 chars  |
| `dischargedBy`          | 200 chars  |
| `clinicianLicenseNo`    | 50 chars   |

- Validate `admissionDate` and `dischargeDate` as valid ISO 8601 dates
- Validate `dischargeDate` is not earlier than `admissionDate`
- Validate `age` is a positive integer between 0 and 130
- Validate `gender` is one of: `Male` | `Female` | `Other`
- Validate `languageRequested` is one of: `en` | `ha` | `yo` | `ig`

---

## 5. Authentication

- All users must be authenticated before accessing any endpoint
- Authentication tokens must expire — recommended session length: 8 hours
  (one clinical shift)
- Tokens must be invalidated on logout
- Failed login attempts must be rate-limited: lock after 5 failed attempts
  within 10 minutes
- Passwords must meet minimum complexity: 8+ characters, 1 uppercase,
  1 number, 1 special character
- Password reset must use a time-limited token (expiry: 30 minutes)

---

## 6. Generation Metadata Security

The following fields are stored internally and must never be exposed in
patient-facing output, printed handouts, WhatsApp shares, or translated output:

- `promptVersion`
- `modelVersion`
- `generatedAt`
- `generatedByUserId`

These fields are accessible only to:
- Admin role (via audit log)
- System administrators with direct database access

---

## 7. Multi-Tenant Isolation

CareFlow will be deployed to multiple hospital instances. Each hospital is a
tenant. Patient records from Hospital A must never be accessible to a user
from Hospital B.

- Every PatientInput and DischargeRecord must be tagged with a `facilityId`
- Every authenticated user must be associated with a `facilityId`
- Every query against patient records must filter by the authenticated
  user's `facilityId`
- Cross-facility queries are never permitted for Doctor or Nurse roles
- Admin role is scoped to their own facility only

---

## Constraints

- Never serve HTTP without redirecting to HTTPS
- Never store encryption keys in the same location as the data they protect
- Never enforce RBAC on the client side only
- Never allow a Nurse or Admin to finalise a discharge record — server must block this
- Never expose generation metadata (promptVersion, modelVersion, generatedAt,
  generatedByUserId) in patient-facing output
- Never store Nigerian patient data outside Nigerian data residency boundaries
- Never skip IP address logging in an AuditLog entry
- Never allow cross-facility data access between hospital tenants
- Never proceed with a form submission that fails server-side validation

---

*CareFlow AI — Security Requirements v1.0*
*Internal use only.*
