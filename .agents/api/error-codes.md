````md
# File: .agents/api/error-codes.md

# Version: 1.0

# Last updated: 2026-06-02

# PRD reference: CFW-PRD-001 v1.0

# Purpose: Every error code CareFlow returns — code string, HTTP status, trigger condition, user message, audit logging, and example JSON response.

## Error Code Summary Table

| Error Code                   | HTTP Status | Audit Log                | User Message                                                    |
| ---------------------------- | ----------- | ------------------------ | --------------------------------------------------------------- |
| `MISSING_REQUIRED_FIELD`     | 400         | No                       | "Missing required field: [field_name]"                          |
| `INVALID_FIELD_VALUE`        | 400         | No                       | "Invalid value for [field_name]: [reason]"                      |
| `CONTRADICTION_DETECTED`     | 400         | No                       | "Contradiction detected: [details]"                             |
| `RECORD_NOT_FINALISED`       | 400         | No                       | "Only finalised records can be [action]"                        |
| `RECORD_ALREADY_FINALISED`   | 400         | No                       | "Record is already finalised"                                   |
| `RECORD_ARCHIVED`            | 400         | No                       | "Cannot [action] an archived record"                            |
| `INCOMPLETE_RECORD`          | 400         | No                       | "Cannot finalise: missing required fields"                      |
| `INVALID_LANGUAGE`           | 400         | No                       | "Target language must be ha, yo, or ig"                         |
| `TRANSLATION_LOW_CONFIDENCE` | 200         | Yes                      | "Translation confidence is low. English version will be shown." |
| `UNAUTHORIZED`               | 401         | No                       | "Not authenticated"                                             |
| `ROLE_NOT_PERMITTED`         | 403         | Yes (attempt)            | "[Role] cannot [action]"                                        |
| `FACILITY_MISMATCH`          | 403         | No                       | "You do not have access to this record"                         |
| `RECORD_NOT_FOUND`           | 404         | No                       | "Discharge record not found"                                    |
| `RATE_LIMITED`               | 429         | No                       | "Too many requests. Please wait [seconds] seconds."             |
| `GENERATION_FAILED`          | 500         | Yes                      | "AI generation failed. Please try again."                       |
| `GENERATION_TIMEOUT`         | 500         | Yes                      | "AI generation timed out after 25 seconds"                      |
| `TRANSLATION_FAILED`         | 500         | Yes                      | "Translation service failed. Please try again."                 |
| `AUDIT_LOG_WRITE_FAILED`     | 500         | N/A                      | "Internal error. Please contact support."                       |
| `SUPABASE_ERROR`             | 500         | Yes (if record affected) | "Database error. Please contact support."                       |
| `DEEPSEEK_RATE_LIMITED`      | 500         | Yes                      | "AI service rate limited. Please wait and try again."           |
| `DEEPSEEK_AUTH_FAILED`       | 500         | Yes                      | "AI service authentication failed. Contact support."            |
| `INTERNAL_SERVER_ERROR`      | 500         | Yes                      | "An unexpected error occurred. Please try again."               |

---

## Error Code 1: `MISSING_REQUIRED_FIELD`

### HTTP Status

`400 Bad Request`

### Trigger Condition

A required field in the request body is missing or empty.

### Audit Log Entry

No (validation error, no record created)

### User Message

"Missing required field: [field_name]"

### Example JSON Response

```json
{
  "success": false,
  "error": {
    "code": "MISSING_REQUIRED_FIELD",
    "message": "Missing required field: diagnosis",
    "details": {
      "field": "diagnosis"
    }
  }
}
```
````

---

## Error Code 2: `INVALID_FIELD_VALUE`

### HTTP Status

`400 Bad Request`

### Trigger Condition

A field contains a value that does not meet validation rules (e.g., age >130, invalid date format, MDCN licence regex mismatch).

### Audit Log Entry

No

### User Message

"Invalid value for [field_name]: [reason]"

### Example JSON Response

```json
{
  "success": false,
  "error": {
    "code": "INVALID_FIELD_VALUE",
    "message": "Invalid value for age: Age must be between 0 and 130",
    "details": {
      "field": "age",
      "value": 200,
      "reason": "Age must be between 0 and 130"
    }
  }
}
```

---

## Error Code 3: `CONTRADICTION_DETECTED`

### HTTP Status

`400 Bad Request`

### Trigger Condition

Contradictory input detected (e.g., discharge date before admission date, diagnosis present but treatmentGiven empty, medication for condition not in diagnosis).

### Audit Log Entry

No

### User Message

"Contradiction detected: [details]"

### Example JSON Response

```json
{
  "success": false,
  "error": {
    "code": "CONTRADICTION_DETECTED",
    "message": "Contradiction detected: Discharge date (2026-06-01) is before admission date (2026-06-02)",
    "details": {
      "contradictions": [
        "Discharge date (2026-06-01) is before admission date (2026-06-02)"
      ]
    }
  }
}
```

---

## Error Code 4: `RECORD_NOT_FINALISED`

### HTTP Status

`400 Bad Request`

### Trigger Condition

An action that requires a finalised record (print, export, share, archive) is attempted on a draft record.

### Audit Log Entry

No (action blocked before any write)

### User Message

"Only finalised records can be [action]"

### Example JSON Response

```json
{
  "success": false,
  "error": {
    "code": "RECORD_NOT_FINALISED",
    "message": "Only finalised records can be exported",
    "details": {
      "action": "export",
      "currentStatus": "draft"
    }
  }
}
```

---

## Error Code 5: `RECORD_ALREADY_FINALISED`

### HTTP Status

`400 Bad Request`

### Trigger Condition

Attempt to finalise a record that already has status `finalised`.

### Audit Log Entry

No

### User Message

"Record is already finalised"

### Example JSON Response

```json
{
  "success": false,
  "error": {
    "code": "RECORD_ALREADY_FINALISED",
    "message": "Record is already finalised",
    "details": {
      "recordId": "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
      "currentStatus": "finalised"
    }
  }
}
```

---

## Error Code 6: `RECORD_ARCHIVED`

### HTTP Status

`400 Bad Request`

### Trigger Condition

Attempt to edit, finalise, export, or otherwise modify an archived record.

### Audit Log Entry

No

### User Message

"Cannot [action] an archived record"

### Example JSON Response

```json
{
  "success": false,
  "error": {
    "code": "RECORD_ARCHIVED",
    "message": "Cannot edit an archived record",
    "details": {
      "action": "edit",
      "recordId": "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
      "status": "archived"
    }
  }
}
```

---

## Error Code 7: `INCOMPLETE_RECORD`

### HTTP Status

`400 Bad Request`

### Trigger Condition

Attempt to finalise a record that is missing required fields or has incomplete AI output.

### Audit Log Entry

No

### User Message

"Cannot finalise: missing required fields"

### Example JSON Response

```json
{
  "success": false,
  "error": {
    "code": "INCOMPLETE_RECORD",
    "message": "Cannot finalise: missing required fields",
    "details": {
      "missingFields": ["followUpInstructions", "redFlagWarnings"]
    }
  }
}
```

---

## Error Code 8: `INVALID_LANGUAGE`

### HTTP Status

`400 Bad Request`

### Trigger Condition

Translation request with target language not one of `ha`, `yo`, or `ig`.

### Audit Log Entry

No

### User Message

"Target language must be ha, yo, or ig"

### Example JSON Response

```json
{
  "success": false,
  "error": {
    "code": "INVALID_LANGUAGE",
    "message": "Target language must be ha, yo, or ig",
    "details": {
      "provided": "fr",
      "allowed": ["ha", "yo", "ig"]
    }
  }
}
```

---

## Error Code 9: `TRANSLATION_LOW_CONFIDENCE`

### HTTP Status

`200 OK` (translation succeeds with warning — not an error)

### Trigger Condition

Translation service returns confidence < 0.9 (low confidence). The system falls back to English and returns this warning.

### Audit Log Entry

Yes (writes audit log with action=edit, changesDiff tracks translation fields, notes include low confidence warning)

### User Message

"Translation confidence is low. English version will be shown."

### Example JSON Response

```json
{
  "success": true,
  "warning": {
    "code": "TRANSLATION_LOW_CONFIDENCE",
    "message": "Translation confidence is low. English version will be shown.",
    "details": {
      "targetLanguage": "ha",
      "confidence": 0.65,
      "fallbackUsed": true
    }
  },
  "data": {
    "translatedOutput": null,
    "patientFriendlyOutput": "PATIENT DISCHARGE INSTRUCTIONS..."
  }
}
```

---

## Error Code 10: `UNAUTHORIZED`

### HTTP Status

`401 Unauthorized`

### Trigger Condition

Missing or invalid JWT token in `Authorization` header.

### Audit Log Entry

No (no authenticated user)

### User Message

"Not authenticated"

### Example JSON Response

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Not authenticated",
    "details": {
      "reason": "Missing authorization header"
    }
  }
}
```

---

## Error Code 11: `ROLE_NOT_PERMITTED`

### HTTP Status

`403 Forbidden`

### Trigger Condition

Authenticated user has a role that is not permitted for the requested action (e.g., Nurse trying to finalise, Admin trying to print).

### Audit Log Entry

Yes (writes to a security log or audit log with the attempted action)

### User Message

"[Role] cannot [action]"

### Example JSON Response

```json
{
  "success": false,
  "error": {
    "code": "ROLE_NOT_PERMITTED",
    "message": "Nurse cannot finalise records",
    "details": {
      "role": "nurse",
      "action": "finalise",
      "requiredRole": "doctor"
    }
  }
}
```

---

## Error Code 12: `FACILITY_MISMATCH`

### HTTP Status

`403 Forbidden`

### Trigger Condition

Authenticated user attempts to access a record from a different facility (multi-tenant isolation violation).

### Audit Log Entry

No (access blocked before read)

### User Message

"You do not have access to this record"

### Example JSON Response

```json
{
  "success": false,
  "error": {
    "code": "FACILITY_MISMATCH",
    "message": "You do not have access to this record",
    "details": {
      "userFacilityId": "11111111-1111-1111-1111-111111111111",
      "recordFacilityId": "22222222-2222-2222-2222-222222222222"
    }
  }
}
```

---

## Error Code 13: `RECORD_NOT_FOUND`

### HTTP Status

`404 Not Found`

### Trigger Condition

No record exists with the provided `recordId`.

### Audit Log Entry

No

### User Message

"Discharge record not found"

### Example JSON Response

```json
{
  "success": false,
  "error": {
    "code": "RECORD_NOT_FOUND",
    "message": "Discharge record not found",
    "details": {
      "recordId": "00000000-0000-0000-0000-000000000000"
    }
  }
}
```

---

## Error Code 14: `RATE_LIMITED`

### HTTP Status

`429 Too Many Requests`

### Trigger Condition

User exceeds rate limit for a specific endpoint.

### Audit Log Entry

No

### User Message

"Too many requests. Please wait [seconds] seconds."

### Example JSON Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please wait 30 seconds.",
    "details": {
      "limit": 10,
      "windowMs": 60000,
      "retryAfterSeconds": 30
    }
  }
}
```

---

## Error Code 15: `GENERATION_FAILED`

### HTTP Status

`500 Internal Server Error`

### Trigger Condition

DeepSeek API returns an error, malformed response, or missing required sections.

### Audit Log Entry

Yes (writes audit log with action=generate, notes include failure reason)

### User Message

"AI generation failed. Please try again."

### Example JSON Response

```json
{
  "success": false,
  "error": {
    "code": "GENERATION_FAILED",
    "message": "AI generation failed. Please try again.",
    "details": {
      "reason": "DeepSeek API returned 500",
      "requestId": "req_abc123"
    }
  }
}
```

---

## Error Code 16: `GENERATION_TIMEOUT`

### HTTP Status

`500 Internal Server Error`

### Trigger Condition

DeepSeek API call exceeds `DEEPSEEK_TIMEOUT_MS` (default 25 seconds).

### Audit Log Entry

Yes (writes audit log with action=generate, notes timeout)

### User Message

"AI generation timed out after 25 seconds"

### Example JSON Response

```json
{
  "success": false,
  "error": {
    "code": "GENERATION_TIMEOUT",
    "message": "AI generation timed out after 25 seconds",
    "details": {
      "timeoutMs": 25000,
      "requestId": "req_abc123"
    }
  }
}
```

---

## Error Code 17: `TRANSLATION_FAILED`

### HTTP Status

`500 Internal Server Error`

### Trigger Condition

Translation service returns error, empty response, or malformed output.

### Audit Log Entry

Yes (writes audit log with action=edit, notes translation failure — no changes applied)

### User Message

"Translation service failed. Please try again."

### Example JSON Response

```json
{
  "success": false,
  "error": {
    "code": "TRANSLATION_FAILED",
    "message": "Translation service failed. Please try again.",
    "details": {
      "targetLanguage": "yo",
      "reason": "DeepSeek API timeout"
    }
  }
}
```

---

## Error Code 18: `AUDIT_LOG_WRITE_FAILED`

### HTTP Status

`500 Internal Server Error`

### Trigger Condition

Unable to write to `audit_logs` table (database connection issue, RLS violation, etc.). The main operation is rolled back.

### Audit Log Entry

N/A (cannot write)

### User Message

"Internal error. Please contact support."

### Example JSON Response

```json
{
  "success": false,
  "error": {
    "code": "AUDIT_LOG_WRITE_FAILED",
    "message": "Internal error. Please contact support.",
    "details": {
      "reason": "Database connection pool exhausted"
    }
  }
}
```

---

## Error Code 19: `SUPABASE_ERROR`

### HTTP Status

`500 Internal Server Error`

### Trigger Condition

Supabase database query fails (connection, constraint violation, timeout).

### Audit Log Entry

Yes (if the operation affected a record, log the error)

### User Message

"Database error. Please contact support."

### Example JSON Response

```json
{
  "success": false,
  "error": {
    "code": "SUPABASE_ERROR",
    "message": "Database error. Please contact support.",
    "details": {
      "operation": "INSERT INTO discharge_records",
      "errorCode": "23505"
    }
  }
}
```

---

## Error Code 20: `DEEPSEEK_RATE_LIMITED`

### HTTP Status

`500 Internal Server Error`

### Trigger Condition

DeepSeek API returns 429 (rate limit exceeded).

### Audit Log Entry

Yes

### User Message

"AI service rate limited. Please wait and try again."

### Example JSON Response

```json
{
  "success": false,
  "error": {
    "code": "DEEPSEEK_RATE_LIMITED",
    "message": "AI service rate limited. Please wait and try again.",
    "details": {
      "retryAfterSeconds": 60
    }
  }
}
```

---

## Error Code 21: `DEEPSEEK_AUTH_FAILED`

### HTTP Status

`500 Internal Server Error`

### Trigger Condition

DeepSeek API returns 401 (invalid or expired API key).

### Audit Log Entry

Yes (critical error, alert admin)

### User Message

"AI service authentication failed. Contact support."

### Example JSON Response

```json
{
  "success": false,
  "error": {
    "code": "DEEPSEEK_AUTH_FAILED",
    "message": "AI service authentication failed. Contact support.",
    "details": {
      "status": 401
    }
  }
}
```

---

## Error Code 22: `INTERNAL_SERVER_ERROR`

### HTTP Status

`500 Internal Server Error`

### Trigger Condition

Any unexpected error not covered by other error codes.

### Audit Log Entry

Yes

### User Message

"An unexpected error occurred. Please try again."

### Example JSON Response

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred. Please try again.",
    "details": {
      "requestId": "req_abc123"
    }
  }
}
```

---

## Error Response Format Standard

All error responses must follow this structure:

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string; // Error code from this document
    message: string; // User-friendly message
    details?: {
      // Optional, structured error context
      [key: string]: any;
    };
  };
}
```

---

## Client-Side Error Handling Example

```ts
try {
  const response = await fetch("/api/discharge/generate", {
    method: "POST",
    body: JSON.stringify({ patientInput }),
    headers: { "Content-Type": "application/json" },
  });

  const data = await response.json();

  if (!response.ok) {
    switch (data.error.code) {
      case "MISSING_REQUIRED_FIELD":
        highlightField(data.error.details.field);
        showToast(data.error.message, "warning");
        break;
      case "ROLE_NOT_PERMITTED":
        redirectTo("/dashboard");
        showToast(data.error.message, "error");
        break;
      case "GENERATION_FAILED":
      case "GENERATION_TIMEOUT":
        showToast(data.error.message, "error");
        break;
      default:
        showToast("An error occurred. Please try again.", "error");
    }
    return;
  }

  // Handle success...
} catch (networkError) {
  showToast("Network error. Please check your connection.", "error");
}
```

---

## Constraints for this file

- **Never expose internal error details** (stack traces, database queries) to the client
- **Never return the same error code for different failure modes** — each must be distinct
- **Never skip audit logging for errors that affect data integrity** (generation, finalisation, edit)
- **Never use HTTP 200 for error responses** — always use appropriate 4xx or 5xx status codes
- **TRANSLATION_LOW_CONFIDENCE is the sole exception** — returns 200 with a warning object because the response succeeds with a fallback
- **Never hardcode error messages in multiple places** — use constants file
- **Never log the user's IP address in error messages** — only in audit log
- **Never forget to include `requestId` in 500-level error details**
