````md
# File: .agents/testing.md

# Version: 1.0

# Last updated: 2026-06-02

# PRD reference: CFW-PRD-001 v1.0

# Purpose: Testing strategy and checklist for CareFlow AI — unit tests, integration tests, Supabase RLS tests, manual pilot test checklist, and performance/security testing requirements.

## Testing Overview

CareFlow AI requires comprehensive testing across multiple layers:

- **Unit tests** (Jest + React Testing Library) — component logic and utilities
- **Integration tests** (API routes) — end-to-end workflow validation
- **Supabase RLS tests** (local Supabase) — security and multi-tenant isolation
- **Manual pilot tests** — real clinical scenarios with healthcare workers
- **Performance tests** — AI generation time (<15s on 4G)
- **Security tests** — OWASP Top 10, NDPR compliance

---

## Unit Tests (Jest + React Testing Library)

### Setup

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
```
````

**jest.config.js:**

```js
module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts", "!src/types/**"],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80,
    },
  },
};
```

### Test 1: AI Output Parser

**File:** `src/services/__tests__/ai-provider.test.ts`

```ts
import { splitResponse, validateOutput } from "@/services/ai-provider";

describe("AI Output Parser", () => {
  it("correctly splits clinicalSummary and patientFriendlyOutput", () => {
    const rawOutput = `DISCHARGE SUMMARY
1. Patient Identification...
YOUR DISCHARGE INSTRUCTIONS
What brought you to the hospital?...`;

    const { clinicalSummary, patientFriendly } = splitResponse(rawOutput);

    expect(clinicalSummary).toContain("DISCHARGE SUMMARY");
    expect(patientFriendly).toContain("YOUR DISCHARGE INSTRUCTIONS");
    expect(clinicalSummary).not.toContain("YOUR DISCHARGE INSTRUCTIONS");
  });

  it("throws error when Mode 2 marker is missing", () => {
    const rawOutput = `DISCHARGE SUMMARY only...`;
    expect(() => splitResponse(rawOutput)).toThrow("missing Mode 2 section");
  });

  it("validates required sections are present", () => {
    const validOutput = {
      clinicalSummary: "Red Flag Warnings\nDischarged By",
      patientFriendly: "DANGER SIGNS\nSigned by",
    };
    expect(validateOutput(validOutput)).toBe(true);
  });

  it("rejects output missing Red Flag Warnings", () => {
    const invalidOutput = {
      clinicalSummary: "Discharged By only",
      patientFriendly: "DANGER SIGNS\nSigned by",
    };
    expect(() => validateOutput(invalidOutput)).toThrow(
      "missing Red Flag Warnings",
    );
  });
});
```

### Test 2: Form Validation

**File:** `src/components/forms/__tests__/PatientInputForm.test.tsx`

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { PatientInputForm } from "../PatientInputForm";

describe("PatientInputForm Validation", () => {
  it("displays error when required fields are missing", async () => {
    render(
      <PatientInputForm
        onSubmit={jest.fn()}
        onSaveDraft={jest.fn()}
        isGenerating={false}
      />,
    );

    const generateButton = screen.getByText("Generate Discharge");
    fireEvent.click(generateButton);

    expect(
      await screen.findByText("Diagnosis is required"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Treatment summary is required"),
    ).toBeInTheDocument();
  });

  it("shows Warm Amber colour for validation errors", () => {
    const { container } = render(<PatientInputForm {...props} />);
    const errorElement = container.querySelector(".error-message");
    expect(errorElement).toHaveStyle({ color: "#B45309" });
  });

  it("validates age range (0-130)", () => {
    const { getByLabelText, getByText } = render(
      <PatientInputForm {...props} />,
    );
    const ageInput = getByLabelText("Age");

    fireEvent.change(ageInput, { target: { value: "200" } });
    fireEvent.blur(ageInput);

    expect(getByText("Age must be between 0 and 130")).toBeInTheDocument();
  });

  it("validates discharge date is after admission date", () => {
    const { getByLabelText, getByText } = render(
      <PatientInputForm {...props} />,
    );

    fireEvent.change(getByLabelText("Admission Date"), {
      target: { value: "2026-06-05" },
    });
    fireEvent.change(getByLabelText("Discharge Date"), {
      target: { value: "2026-06-01" },
    });
    fireEvent.blur(getByLabelText("Discharge Date"));

    expect(
      getByText("Discharge date must be on or after admission date"),
    ).toBeInTheDocument();
  });

  it("enforces at least one complete medication row", () => {
    render(<PatientInputForm {...props} />);
    const generateButton = screen.getByText("Generate Discharge");
    fireEvent.click(generateButton);

    expect(screen.getByText(/medication.*required/i)).toBeInTheDocument();
  });
});
```

### Test 3: Role Gate Component

**File:** `src/components/layout/__tests__/RoleGate.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import { RoleGate } from "../RoleGate";

describe("RoleGate", () => {
  it("renders children for allowed role (doctor)", () => {
    render(
      <RoleGate allowedRoles={["doctor"]} userRole="doctor">
        <button>Secret Doctor Button</button>
      </RoleGate>,
    );
    expect(screen.getByText("Secret Doctor Button")).toBeInTheDocument();
  });

  it("does not render children for disallowed role (nurse)", () => {
    render(
      <RoleGate allowedRoles={["doctor"]} userRole="nurse">
        <button>Secret Doctor Button</button>
      </RoleGate>,
    );
    expect(screen.queryByText("Secret Doctor Button")).not.toBeInTheDocument();
  });

  it("renders fallback when provided", () => {
    render(
      <RoleGate
        allowedRoles={["doctor"]}
        userRole="nurse"
        fallback={<div>Access Denied</div>}
      >
        <button>Secret</button>
      </RoleGate>,
    );
    expect(screen.getByText("Access Denied")).toBeInTheDocument();
  });
});
```

### Test 4: Status Badge

**File:** `src/components/shared/__tests__/StatusBadge.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "../StatusBadge";

describe("StatusBadge", () => {
  it('shows "Draft" with Warm Amber for draft status', () => {
    render(<StatusBadge status="draft" />);
    const badge = screen.getByText("Draft");
    expect(badge).toHaveClass("bg-warmAmber");
  });

  it('shows "Finalised" with Clinical Teal for finalised status', () => {
    render(<StatusBadge status="finalised" />);
    const badge = screen.getByText("Finalised");
    expect(badge).toHaveClass("bg-clinicalTeal");
  });

  it('shows "Archived" with Cool Grey for archived status', () => {
    render(<StatusBadge status="archived" />);
    const badge = screen.getByText("Archived");
    expect(badge).toHaveClass("bg-coolGrey");
  });
});
```

---

## Integration Tests (API Routes)

### Setup for API Testing

```bash
npm install --save-dev jest-environment-node supertest
```

**File:** `tests/api/setup.ts`

```ts
import { createClient } from "@supabase/supabase-js";

export const testSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export const testUserId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
export const testDoctorUserId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
export const testNurseUserId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
```

### Test 1: Generate Discharge API

**File:** `tests/api/discharge/generate.test.ts`

```ts
import { createMocks } from "node-mocks-http";
import handler from "@/app/api/discharge/generate/route";

describe("POST /api/discharge/generate", () => {
  it("returns 200 with valid PatientInput for doctor role", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        patientInput: validPatientInput,
      },
      headers: {
        Authorization: `Bearer ${mockDoctorJwt}`,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
    expect(data.data.status).toBe("draft");
    expect(data.data.recordId).toBeDefined();
    expect(data.data.clinicalSummary).toContain("DISCHARGE SUMMARY");
    expect(data.data.patientFriendlyOutput).toContain(
      "YOUR DISCHARGE INSTRUCTIONS",
    );
  });

  it("returns 400 MISSING_REQUIRED_FIELD when diagnosis missing", async () => {
    const invalidInput = { ...validPatientInput, diagnosis: "" };
    const { req, res } = createMocks({
      method: "POST",
      body: { patientInput: invalidInput },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.error.code).toBe("MISSING_REQUIRED_FIELD");
    expect(data.error.details.field).toBe("diagnosis");
  });

  it("returns 403 ROLE_NOT_PERMITTED for admin role", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: { patientInput: validPatientInput },
      headers: { Authorization: `Bearer ${mockAdminJwt}` },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(403);
    expect(data.error.code).toBe("ROLE_NOT_PERMITTED");
  });
});
```

### Test 2: Finalise Record API

**File:** `tests/api/discharge/finalise.test.ts`

```ts
describe("POST /api/discharge/[id]/finalise", () => {
  it("returns 200 for doctor role", async () => {
    const { req, res } = createMocks({
      method: "POST",
      query: { id: testRecordId },
      headers: { Authorization: `Bearer ${mockDoctorJwt}` },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.data.status).toBe("finalised");
  });

  it("returns 403 ROLE_NOT_PERMITTED for nurse role", async () => {
    const { req, res } = createMocks({
      method: "POST",
      query: { id: testRecordId },
      headers: { Authorization: `Bearer ${mockNurseJwt}` },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(403);
    expect(data.error.code).toBe("ROLE_NOT_PERMITTED");
  });

  it("returns 400 RECORD_ALREADY_FINALISED when already finalised", async () => {
    // First finalise
    await finaliseRecord(testRecordId, doctorJwt);

    // Try again
    const { req, res } = createMocks({
      method: "POST",
      query: { id: testRecordId },
      headers: { Authorization: `Bearer ${mockDoctorJwt}` },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(data.error.code).toBe("RECORD_ALREADY_FINALISED");
  });
});
```

### Test 3: Audit Log API

**File:** `tests/api/audit/audit.test.ts`

```ts
describe("GET /api/audit/[recordId]", () => {
  it("returns 200 with audit logs for admin role", async () => {
    const { req, res } = createMocks({
      method: "GET",
      query: { recordId: testRecordId },
      headers: { Authorization: `Bearer ${mockAdminJwt}` },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.data).toBeInstanceOf(Array);
    expect(data.data[0]).toHaveProperty("action");
    expect(data.data[0]).toHaveProperty("timestamp");
    expect(data.data[0]).toHaveProperty("ipAddress");
  });

  it("returns 403 ROLE_NOT_PERMITTED for doctor role", async () => {
    const { req, res } = createMocks({
      method: "GET",
      query: { recordId: testRecordId },
      headers: { Authorization: `Bearer ${mockDoctorJwt}` },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(403);
    expect(data.error.code).toBe("ROLE_NOT_PERMITTED");
  });
});
```

---

## Supabase RLS Tests

Run these tests against local Supabase instance (`supabase start`).

**File:** `tests/database/rls.test.sql`

```sql
-- Test 1: Nurse cannot SELECT a discharge record from a different facility
BEGIN;
-- Assume nurse from facility B tries to access facility A record
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "nurse-facility-b", "email": "nurse@facilityB.com"}';
-- This query should return 0 rows
SELECT COUNT(*) FROM discharge_records dr
JOIN patient_inputs pi ON dr.patient_input_id = pi.patient_id
WHERE pi.facility_code = 'LUTH-001'; -- Should be blocked
ROLLBACK;

-- Test 2: Admin cannot SELECT a PatientInput record (by design)
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "admin-user", "email": "admin@careflow.com"}';
-- This should return 0 rows
SELECT COUNT(*) FROM patient_inputs;
ROLLBACK;

-- Test 3: No role can UPDATE or DELETE an AuditLog entry
BEGIN;
-- Attempt update (should fail)
UPDATE audit_logs SET notes = 'hacked' WHERE log_id = '11111111-1111-1111-1111-111111111111';
-- Attempt delete (should fail)
DELETE FROM audit_logs WHERE log_id = '11111111-1111-1111-1111-111111111111';
ROLLBACK;

-- Test 4: Doctor can UPDATE a draft DischargeRecord
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "doctor-user", "email": "doctor@facilityA.com"}';
UPDATE discharge_records SET clinical_summary = 'Updated'
WHERE record_id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
-- Should succeed
ROLLBACK;

-- Test 5: Doctor cannot UPDATE an archived DischargeRecord
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "doctor-user", "email": "doctor@facilityA.com"}';
UPDATE discharge_records SET clinical_summary = 'Updated'
WHERE record_id = 'archived-record-id'; -- Should fail (0 rows updated)
ROLLBACK;
```

---

## Manual Pilot Test Checklist

Run these tests before handing to pilot hospitals.

### Test Case 1: Complete Discharge Workflow

- [ ] Login as Doctor
- [ ] Fill all required form fields (use Nigerian clinical example)
- [ ] Click "Generate Discharge"
- [ ] Wait for AI generation to complete (<15 seconds)
- [ ] Verify both Mode 1 and Mode 2 outputs appear
- [ ] Verify Mode 1 contains "Red Flag Warnings" and "Discharged By"
- [ ] Verify Mode 2 contains "DANGER SIGNS" and "Signed by"
- [ ] Click "Edit" on Mode 2, make a change, save
- [ ] Click "Finalise Record"
- [ ] Verify status changes to "Finalised"
- [ ] Verify audit log shows generate, edit, finalise actions

### Test Case 2: Translation Feature

- [ ] Login as Doctor
- [ ] Create new discharge with languageRequested = "Yoruba (yo)"
- [ ] Verify translated output appears (if confidence = high)
- [ ] If confidence = low, verify English version shown with warning
- [ ] Click "Share via WhatsApp" with translation
- [ ] Verify WhatsApp message is in Yoruba (or English with warning)

### Test Case 3: Role-Based Access Control

- [ ] Login as Nurse
- [ ] Attempt to create and generate a discharge (should succeed)
- [ ] Attempt to edit the draft (should succeed)
- [ ] Attempt to finalise the record (should be blocked)
- [ ] Attempt to view Mode 1 (should succeed)
- [ ] Attempt to view audit log (should be blocked)
- [ ] Login as Admin
- [ ] Attempt to view Mode 1 (should be hidden)
- [ ] Attempt to view Mode 2 (should succeed)
- [ ] Attempt to view audit log (should succeed)
- [ ] Attempt to print/share (should be blocked)

### Test Case 4: Offline Draft Caching

- [ ] Disable internet connection (turn off WiFi)
- [ ] Fill form partially
- [ ] Verify "Saved locally" banner appears
- [ ] Re-enable internet connection
- [ ] Verify prompt to submit saved draft
- [ ] Submit and verify generation succeeds

### Test Case 5: WhatsApp Share

- [ ] Finalise a discharge record
- [ ] Click "Share via WhatsApp"
- [ ] Verify WhatsApp opens with pre-filled text
- [ ] Verify text contains Mode 2 only (no Mode 1)
- [ ] Verify text has no markdown or separators
- [ ] Verify audit log shows export action

### Test Case 6: PDF Export

- [ ] Finalise a discharge record
- [ ] Click "Print" (or "Export PDF")
- [ ] Verify print dialog opens
- [ ] Verify printed output has header (facility, patient, date, clinician)
- [ ] Verify Mode 2 appears first
- [ ] Verify translation appears below English (if present)
- [ ] Verify Mode 1 appears for Doctor/Nurse (separate page)
- [ ] Verify audit log shows print action

### Test Case 7: Audit Log (Admin Only)

- [ ] Login as Admin
- [ ] Navigate to Audit Log page for a record
- [ ] Verify all actions are listed (generate, edit, finalise, view, print, export)
- [ ] Verify IP addresses are shown
- [ ] Verify timestamps are correct
- [ ] Verify changesDiff shows edit details
- [ ] Attempt to delete/edit an audit log entry (should be impossible)

---

## Performance Tests

### Test: AI Generation Time

```ts
describe("AI Generation Performance", () => {
  it("generates discharge in under 15 seconds on 4G simulation", async () => {
    const startTime = Date.now();

    const response = await fetch("/api/discharge/generate", {
      method: "POST",
      body: JSON.stringify({ patientInput: validPatientInput }),
    });

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(15000);
    expect(response.ok).toBe(true);
  });

  it("handles timeout gracefully after 25 seconds", async () => {
    // Mock slow DeepSeek response
    jest.setTimeout(26000);
    const startTime = Date.now();

    const response = await fetch("/api/discharge/generate", {
      method: "POST",
      body: JSON.stringify({ patientInput: validPatientInput }),
    });

    const duration = Date.now() - startTime;
    if (duration > 25000) {
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error.code).toBe("GENERATION_TIMEOUT");
    }
  });
});
```

### Load Test (k6 script)

```javascript
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 20 }, // Ramp up to 20 users
    { duration: "1m", target: 50 }, // Stay at 50 users
    { duration: "30s", target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<20000"], // 95% under 20 seconds
    http_req_failed: ["rate<0.01"], // Less than 1% failure
  },
};

export default function () {
  const url = "http://localhost:3000/api/discharge/generate";
  const payload = JSON.stringify({
    patientInput: testPatientInput,
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${__ENV.TEST_JWT}`,
    },
    timeout: 30000,
  };

  const res = http.post(url, payload, params);

  check(res, {
    "status is 200": (r) => r.status === 200,
    "response time < 15s": (r) => r.timings.duration < 15000,
  });

  sleep(1);
}
```

---

## Security Tests

### OWASP Top 10 Checklist

- [ ] **A01: Broken Access Control** — Test Nurse cannot finalise (verify 403), Admin cannot print (verify 403)
- [ ] **A02: Cryptographic Failures** — Verify TLS 1.3, no mixed content warnings
- [ ] **A03: Injection** — Test SQL injection in form fields (`'; DROP TABLE--`), Test XSS in text fields (`<script>alert(1)</script>`)
- [ ] **A04: Insecure Design** — Verify rate limiting on API endpoints (10 req/min)
- [ ] **A05: Security Misconfiguration** — Verify error messages don't expose stack traces
- [ ] **A06: Vulnerable Components** — Run `npm audit` — no critical vulnerabilities
- [ ] **A07: Identification Failures** — Test session expiry (1 hour), Test brute force login
- [ ] **A08: Software Data Integrity** — Verify audit logs immutable
- [ ] **A09: Monitoring Failures** — Verify all actions logged, log retention policy
- [ ] **A10: SSRF** — Test external API calls (DeepSeek only, no user-controlled URLs)

---

## Constraints for this file

- **Never skip RLS policy tests** — multi-tenant isolation is critical for NDPR compliance
- **Never mock DeepSeek API in performance tests** — use real API with test quota
- **Never commit test secrets** (JWT, API keys) to repository
- **Never test against production database** — use local Supabase or preview environment
- **Never ignore flaky tests** — investigate and fix immediately
- **Never deploy without passing all integration tests** — CI must block broken builds
- **Never forget to test offline mode** — critical for Nigerian hospital environments
