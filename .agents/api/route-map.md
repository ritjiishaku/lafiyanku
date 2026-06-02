````md
# File: .agents/api/route-map.md

# Version: 1.0

# Last updated: 2026-06-02

# PRD reference: CFW-PRD-001 v1.0

# Purpose: Every Next.js API route in the app/api/ directory — file path, HTTP method, permitted roles, request/response schemas, audit actions, and rate limiting.

## API Route Summary Table

| Route                          | Method | Roles                      | Audit Action     | Rate Limit    |
| ------------------------------ | ------ | -------------------------- | ---------------- | ------------- |
| `/api/health`                  | GET    | None                       | None             | None          |
| `/api/auth/session`            | GET    | All                        | None             | None          |
| `/api/discharge/generate`      | POST   | doctor, nurse              | generate         | 10 per minute |
| `/api/discharge/[id]`          | GET    | doctor, nurse, admin       | view             | 30 per minute |
| `/api/discharge/[id]`          | PUT    | doctor, nurse (own drafts) | edit             | 20 per minute |
| `/api/discharge/[id]/finalise` | POST   | doctor                     | finalise         | 10 per minute |
| `/api/discharge/[id]/archive`  | POST   | doctor, admin              | archive          | 10 per minute |
| `/api/discharge/[id]/export`   | GET    | doctor, nurse              | export           | 10 per minute |
| `/api/translation/request`     | POST   | doctor, nurse              | edit             | 10 per minute |
| `/api/audit/[recordId]`        | GET    | admin                      | None (read-only) | 20 per minute |

---

## Route 1: `/api/health`

### File Path

`app/api/health/route.ts`

### Method

`GET`

### Permitted Roles

None (public)

### Request Body

None

### Success Response (200 OK)

```json
{
  "status": "ok",
  "timestamp": "2026-06-02T12:00:00.000Z",
  "version": "1.0.0",
  "environment": "development"
}
```
````

### Error Responses

None (always returns 200)

### Audit Action

None

### Rate Limiting

None

---

## Route 2: `/api/auth/session`

### File Path

`app/api/auth/session/route.ts`

### Method

`GET`

### Permitted Roles

All authenticated users (or returns null for unauthenticated)

### Request Body

None

### Success Response (200 OK)

```json
{
  "user": {
    "id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    "email": "dr.emeka@careflow.dev",
    "role": "doctor",
    "facilityId": "11111111-1111-1111-1111-111111111111",
    "facilityCode": "LUTH-001",
    "fullName": "Dr. Emeka Okafor"
  },
  "expires": "2026-06-02T13:00:00.000Z"
}
```

### Unauthenticated Response (200 OK with null)

```json
{
  "user": null
}
```

### Error Responses

None

### Audit Action

None

### Rate Limiting

None

---

## Route 3: `/api/discharge/generate`

### File Path

`app/api/discharge/generate/route.ts`

### Method

`POST`

### Permitted Roles

`doctor`, `nurse`

### Request Body Schema

```typescript
{
  patientInput: PatientInput; // Complete PatientInput object
}
```

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "recordId": "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
    "clinicalSummary": "CLINICAL DISCHARGE SUMMARY\n\nFacility...",
    "patientFriendlyOutput": "PATIENT DISCHARGE INSTRUCTIONS...",
    "translatedOutput": "AWỌN ILANA IṢUJU NILE RẸ...", // optional
    "translationLanguage": "yo", // optional
    "translationConfidence": "high", // optional
    "status": "draft",
    "missingFieldsLog": [],
    "flaggedIssues": []
  },
  "meta": {
    "generationTimeMs": 12500,
    "promptVersion": "v2.0",
    "modelVersion": "deepseek-chat"
  }
}
```

### Error Responses

| Status | Code                     | Message                                           |
| ------ | ------------------------ | ------------------------------------------------- |
| 400    | `MISSING_REQUIRED_FIELD` | "Missing required field: diagnosis"               |
| 400    | `INVALID_FIELD_VALUE`    | "Age must be between 0 and 130"                   |
| 400    | `CONTRADICTION_DETECTED` | "Discharge date is before admission date"         |
| 401    | `UNAUTHORIZED`           | "Not authenticated"                               |
| 403    | `ROLE_NOT_PERMITTED`     | "Only doctors and nurses can generate discharges" |
| 429    | `RATE_LIMITED`           | "Too many generation requests. Please wait."      |
| 500    | `GENERATION_FAILED`      | "AI generation failed. Please try again."         |
| 500    | `GENERATION_TIMEOUT`     | "AI generation timed out after 25 seconds"        |
| 500    | `SUPABASE_ERROR`         | "Database error. Please contact support."         |

### Audit Action

`generate` (written after successful generation)

### Rate Limiting

10 requests per minute per user

---

## Route 4: `/api/discharge/[id]` (GET)

### File Path

`app/api/discharge/[id]/route.ts`

### Method

`GET`

### Permitted Roles

`doctor`, `nurse`, `admin`

### URL Parameters

| Parameter | Type | Description              |
| --------- | ---- | ------------------------ |
| `id`      | UUID | DischargeRecord.recordId |

### Request Body

None

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "recordId": "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
    "patientInput": { ... },  // Full PatientInput object
    "clinicalSummary": "CLINICAL DISCHARGE SUMMARY...",
    "patientFriendlyOutput": "PATIENT DISCHARGE INSTRUCTIONS...",
    "translatedOutput": "...",  // optional
    "translationLanguage": "yo",  // optional
    "translationConfidence": "high",  // optional
    "status": "draft",
    "generatedAt": "2026-06-02T10:30:00.000Z",
    "generatedByUserId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    "lastEditedAt": null,
    "lastEditedByUserId": null
  }
}
```

### Error Responses

| Status | Code                | Message                                 |
| ------ | ------------------- | --------------------------------------- |
| 401    | `UNAUTHORIZED`      | "Not authenticated"                     |
| 403    | `FACILITY_MISMATCH` | "You do not have access to this record" |
| 404    | `RECORD_NOT_FOUND`  | "Discharge record not found"            |

### Audit Action

`view` (logged when record is fetched)

### Rate Limiting

30 requests per minute per user

---

## Route 5: `/api/discharge/[id]` (PUT)

### File Path

`app/api/discharge/[id]/route.ts`

### Method

`PUT`

### Permitted Roles

`doctor` (own facility records) · `nurse` (only their own drafts)

### URL Parameters

| Parameter | Type | Description              |
| --------- | ---- | ------------------------ |
| `id`      | UUID | DischargeRecord.recordId |

### Request Body Schema

```typescript
{
  clinicalSummary?: string;      // Updated Mode 1
  patientFriendlyOutput?: string; // Updated Mode 2
  // Note: Cannot edit translatedOutput directly — regenerate translation instead
}
```

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "recordId": "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
    "clinicalSummary": "UPDATED SUMMARY...",
    "patientFriendlyOutput": "UPDATED INSTRUCTIONS...",
    "status": "draft",
    "lastEditedAt": "2026-06-02T10:35:00.000Z",
    "lastEditedByUserId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
  }
}
```

### Error Responses

| Status | Code                       | Message                                                      |
| ------ | -------------------------- | ------------------------------------------------------------ |
| 400    | `RECORD_ARCHIVED`          | "Cannot edit an archived record"                             |
| 401    | `UNAUTHORIZED`             | "Not authenticated"                                          |
| 403    | `ROLE_NOT_PERMITTED`       | "Nurses can only edit their own drafts"                      |
| 403    | `FACILITY_MISMATCH`        | "You do not have access to this record"                      |
| 404    | `RECORD_NOT_FOUND`         | "Discharge record not found"                                 |

**Note:** Doctors may edit finalised records — editing reverts status to `draft` automatically. No error is thrown for doctor edits on finalised records.

### Audit Action

`edit` (written after successful update, with changesDiff)

### Rate Limiting

20 requests per minute per user

---

## Route 6: `/api/discharge/[id]/finalise`

### File Path

`app/api/discharge/[id]/finalise/route.ts`

### Method

`POST`

### Permitted Roles

`doctor` only

### URL Parameters

| Parameter | Type | Description              |
| --------- | ---- | ------------------------ |
| `id`      | UUID | DischargeRecord.recordId |

### Request Body

None (optional: `{ "confirm": true }`)

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "recordId": "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
    "status": "finalised",
    "finalisedAt": "2026-06-02T10:40:00.000Z"
  }
}
```

### Error Responses

| Status | Code                       | Message                                    |
| ------ | -------------------------- | ------------------------------------------ |
| 400    | `RECORD_ALREADY_FINALISED` | "Record is already finalised"              |
| 400    | `RECORD_ARCHIVED`          | "Cannot finalise an archived record"       |
| 400    | `INCOMPLETE_RECORD`        | "Cannot finalise: missing required fields" |
| 401    | `UNAUTHORIZED`             | "Not authenticated"                        |
| 403    | `ROLE_NOT_PERMITTED`       | "Only doctors can finalise records"        |
| 403    | `FACILITY_MISMATCH`        | "You do not have access to this record"    |
| 404    | `RECORD_NOT_FOUND`         | "Discharge record not found"               |

### Audit Action

`finalise` (written after successful status change)

### Rate Limiting

10 requests per minute per user

---

## Route 7: `/api/discharge/[id]/archive`

### File Path

`app/api/discharge/[id]/archive/route.ts`

### Method

`POST`

### Permitted Roles

`doctor`, `admin`

### URL Parameters

| Parameter | Type | Description              |
| --------- | ---- | ------------------------ |
| `id`      | UUID | DischargeRecord.recordId |

### Request Body

None (optional: `{ "restore": true }` to unarchive)

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "recordId": "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
    "status": "archived",
    "archivedAt": "2026-06-02T10:45:00.000Z"
  }
}
```

### Error Responses

| Status | Code                   | Message                                       |
| ------ | ---------------------- | --------------------------------------------- |
| 400    | `RECORD_NOT_FINALISED` | "Only finalised records can be archived"      |
| 401    | `UNAUTHORIZED`         | "Not authenticated"                           |
| 403    | `ROLE_NOT_PERMITTED`   | "Only doctors and admins can archive records" |
| 403    | `FACILITY_MISMATCH`    | "You do not have access to this record"       |
| 404    | `RECORD_NOT_FOUND`     | "Discharge record not found"                  |

### Audit Action

`archive` (written after successful status change)

### Rate Limiting

10 requests per minute per user

---

## Route 8: `/api/discharge/[id]/export`

### File Path

`app/api/discharge/[id]/export/route.ts`

### Method

`GET`

### Permitted Roles

`doctor`, `nurse`

### URL Parameters

| Parameter | Type | Description              |
| --------- | ---- | ------------------------ |
| `id`      | UUID | DischargeRecord.recordId |

### Query Parameters

| Parameter      | Type    | Default | Description                            |
| -------------- | ------- | ------- | -------------------------------------- |
| `format`       | string  | `pdf`   | `pdf` or `json`                        |
| `includeMode1` | boolean | `false` | Include clinical summary (doctor only) |

### Success Response (200 OK) — PDF

Returns PDF file with `Content-Type: application/pdf` and `Content-Disposition: attachment`

### Success Response (200 OK) — JSON

```json
{
  "success": true,
  "data": {
    "recordId": "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
    "patientFriendlyOutput": "...",
    "translatedOutput": "...",
    "clinicalSummary": "..." // only if includeMode1=true and role=doctor
  }
}
```

### Error Responses

| Status | Code                   | Message                                      |
| ------ | ---------------------- | -------------------------------------------- |
| 400    | `RECORD_NOT_FINALISED` | "Cannot export a draft record"               |
| 401    | `UNAUTHORIZED`         | "Not authenticated"                          |
| 403    | `ROLE_NOT_PERMITTED`   | "Only doctors and nurses can export records" |
| 403    | `FACILITY_MISMATCH`    | "You do not have access to this record"      |
| 404    | `RECORD_NOT_FOUND`     | "Discharge record not found"                 |

### Audit Action

`export` (written before generating export)

### Rate Limiting

10 requests per minute per user

---

## Route 9: `/api/translation/request`

### File Path

`app/api/translation/request/route.ts`

### Method

`POST`

### Permitted Roles

`doctor`, `nurse`

### Request Body Schema

```typescript
{
  recordId: string; // UUID of DischargeRecord
  targetLanguage: "ha" | "yo" | "ig";
}
```

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "requestId": "ffffffff-ffff-ffff-ffff-ffffffffffff",
    "translatedOutput": "AWỌN ILANA IṢUJU NILE RẸ...",
    "translationLanguage": "yo",
    "translationConfidence": "high",
    "fallbackUsed": false
  }
}
```

### Error Responses

| Status | Code                         | Message                                                         |
| ------ | ---------------------------- | --------------------------------------------------------------- |
| 200    | `TRANSLATION_LOW_CONFIDENCE` | "Translation confidence is low. English version will be shown." |
| 400    | `INVALID_LANGUAGE`           | "Target language must be ha, yo, or ig"                         |
| 401    | `UNAUTHORIZED`               | "Not authenticated"                                             |
| 403    | `ROLE_NOT_PERMITTED`         | "Only doctors and nurses can request translations"              |
| 403    | `FACILITY_MISMATCH`          | "You do not have access to this record"                         |
| 404    | `RECORD_NOT_FOUND`           | "Discharge record not found"                                    |
| 429    | `RATE_LIMITED`               | "Too many translation requests. Please wait."                   |
| 500    | `TRANSLATION_FAILED`         | "Translation service failed. Please try again."                 |

### Audit Action

`edit` (translation modifies DischargeRecord — written after successful update, with changesDiff)

### Rate Limiting

10 requests per minute per user

---

## Route 10: `/api/audit/[recordId]`

### File Path

`app/api/audit/[recordId]/route.ts`

### Method

`GET`

### Permitted Roles

`admin` only

### URL Parameters

| Parameter  | Type | Description              |
| ---------- | ---- | ------------------------ |
| `recordId` | UUID | DischargeRecord.recordId |

### Query Parameters

| Parameter  | Type     | Default | Description              |
| ---------- | -------- | ------- | ------------------------ |
| `action`   | string   | `all`   | Filter by action type    |
| `page`     | integer  | `1`     | Page number              |
| `limit`    | integer  | `50`    | Items per page (max 100) |
| `fromDate` | ISO date | null    | Filter by date range     |
| `toDate`   | ISO date | null    | Filter by date range     |

### Success Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "logId": "11111111-1111-1111-1111-111111111111",
      "userId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      "userRole": "doctor",
      "action": "generate",
      "timestamp": "2026-06-02T10:30:00.000Z",
      "ipAddress": "192.168.1.100",
      "changesDiff": null,
      "notes": "AI generation completed successfully"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 3,
    "totalPages": 1,
    "nextPage": null
  }
}
```

### Error Responses

| Status | Code                 | Message                           |
| ------ | -------------------- | --------------------------------- |
| 401    | `UNAUTHORIZED`       | "Not authenticated"               |
| 403    | `ROLE_NOT_PERMITTED` | "Only admins can view audit logs" |
| 404    | `RECORD_NOT_FOUND`   | "Discharge record not found"      |

### Audit Action

None (read-only)

### Rate Limiting

20 requests per minute per user

---

## Middleware Configuration

Create `middleware.ts` in project root:

```ts
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  await supabase.auth.getSession();
  return res;
}

export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*", "/discharge/:path*"],
};
```

---

## Constraints for this file

- **Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser** — only use in API routes
- **Never skip role verification** — every route must check permissions server-side
- **Never allow Nurse or Admin to finalise records** — `ROLE_NOT_PERMITTED` must be enforced
- **Never skip audit log entries** — generate, edit, finalise, archive, export must be logged
- **Never allow cross-facility access** — all queries must filter by facility_id
- **Never allow export of draft records** — only finalised records can be exported
- **Never hardcode rate limits** — use environment variables or config
