````md
# File: .agents/integrations/supabase.md

# Version: 1.0

# Last updated: 2026-06-02

# PRD reference: CFW-PRD-001 v1.0

# Purpose: Complete Supabase integration reference for CareFlow AI — project setup, two client configurations (server-side and client-side), auth setup with @supabase/ssr, middleware configuration, user_profiles table pattern, example queries for each workflow, real-time subscriptions, and migration commands.

## Overview

CareFlow AI uses **Supabase** as the primary database and authentication provider. All patient data, discharge records, audit logs, and translation requests are stored in Supabase PostgreSQL with Row Level Security (RLS) enforcing multi-tenant isolation and role-based access.

---

## Project Setup

### Initialize Supabase in Local Project

```bash
# Install Supabase CLI (if not already installed)
brew install supabase/tap/supabase

# Initialize Supabase in project root
supabase init

# Start local Supabase stack
supabase start
```
````

**Expected output:**

```
Started supabase local development setup.
API URL: http://localhost:54321
DB URL: postgresql://postgres:postgres@localhost:54322/postgres
Studio URL: http://localhost:54323
```

### Link to Remote Project (Production)

```bash
# Link to existing Supabase project
supabase link --project-ref your-project-ref

# Push migrations to production
supabase db push
```

---

## Environment Variables

```bash
# Client-side (browser) — safe to expose
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Server-side (API routes only) — never expose to browser
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Where to find these values:**

1. Go to Supabase Dashboard → Project Settings → API
2. Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
3. Copy `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy `service_role key` → `SUPABASE_SERVICE_ROLE_KEY` (store securely, never commit)

---

## Two Client Configurations

### 1. Client-Side Client (Browser)

**File:** `src/lib/supabase-client.ts`

```ts
import { createBrowserClient } from "@supabase/ssr";

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
```

**Usage in React components:**

```tsx
import { createClient } from "@/lib/supabase-client";

const supabase = createClient();
const { data } = await supabase.from("discharge_records").select("*");
```

**Note:** This client respects RLS policies. Users can only see records from their facility.

### 2. Server-Side Client (API Routes)

**File:** `src/lib/supabase-server.ts`

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createServerClient = () => {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    },
  );
};
```

### 3. Service Role Client (Server-Only, Bypasses RLS)

**File:** `src/lib/supabase-admin.ts`

```ts
import { createClient } from "@supabase/supabase-js";

export const createAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
```

**Use only in API routes for:**

- Writing AuditLog entries (service role only)
- Creating system-level records
- Admin functions that need to bypass RLS

**Warning:** Never expose this client to the browser.

---

## Authentication Setup with @supabase/ssr

### Install Dependencies

```bash
npm install @supabase/ssr @supabase/supabase-js
```

### Middleware Configuration

**File:** `middleware.ts`

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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/health).*)"],
};
```

### Auth Callback Route

**File:** `app/auth/callback/route.ts`

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      },
    );
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
```

### Login Component Example

```tsx
"use client";

import { createClient } from "@/lib/supabase-client";
import { useState } from "react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      alert(error.message);
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

---

## User Profiles Table Pattern

The `user_profiles` table stores role and facility information for each authenticated user.

### Table Definition

```sql
CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'nurse',
    facility_id UUID NOT NULL REFERENCES facilities(facility_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Auto-Create Profile on Signup (Database Trigger)

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, email, full_name, role, facility_id)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        'nurse',
        '11111111-1111-1111-1111-111111111111' -- Default facility; admin must reassign
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();
```

### Get Current User Profile (Server-Side)

```ts
import { createServerClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function getCurrentUserProfile(userId: string) {
  const supabase = createAdminClient(); // Service role to bypass RLS for profile fetch
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) throw error;
  return data;
}
```

---

## Example Queries for Each Workflow

### 1. Insert PatientInput (and get ID)

```ts
const { data: patientInput, error } = await supabase
  .from("patient_inputs")
  .insert({
    facility_name: "Lagos University Teaching Hospital",
    facility_code: "LUTH-001",
    patient_name: "Mrs. Ngozi Okonkwo",
    hospital_number: "LUTH/2024/00412",
    age: 54,
    gender: "Female",
    admission_date: "2026-06-01",
    discharge_date: "2026-06-02",
    diagnosis: "Hypertension and Type 2 Diabetes",
    treatment_given: "IV fluids, insulin...",
    medications: [
      { name: "Amlodipine", dosage: "5mg", frequency: "once daily" },
    ],
    discharged_by: "Dr. Emeka Okafor",
    clinician_license_no: "MDCN/2015/07821",
  })
  .select()
  .single();

const patientInputId = patientInput.patient_id;
```

### 2. Insert DischargeRecord

```ts
const { data: dischargeRecord, error } = await supabase
  .from("discharge_records")
  .insert({
    patient_input_id: patientInputId,
    generated_by_user_id: userId,
    prompt_version: "v2.0",
    model_version: "deepseek-chat",
    clinical_summary: clinicalSummary,
    patient_friendly_output: patientFriendlyOutput,
    status: "draft",
  })
  .select()
  .single();
```

### 3. Fetch DischargeRecord by ID (with Role Check via RLS)

```ts
// Using client-side client (respects RLS)
const { data, error } = await supabase
  .from("discharge_records")
  .select(
    `
    *,
    patient_inputs (*)
  `,
  )
  .eq("record_id", recordId)
  .single();

// RLS automatically filters by facility (via patient_inputs join)
```

### 4. Update Status to Finalised (Doctor Only)

```ts
const { error } = await supabase
  .from("discharge_records")
  .update({ status: "finalised" })
  .eq("record_id", recordId)
  .eq("status", "draft"); // Only update if still draft

// RLS policy ensures only Doctor can perform this update
```

### 5. Insert AuditLog Entry (Service Role Only)

```ts
const adminSupabase = createAdminClient();
const { error } = await adminSupabase.from("audit_logs").insert({
  record_id: recordId,
  user_id: userId,
  user_role: userRole,
  action: "finalise",
  ip_address: ipAddress,
  changes_diff: null,
  notes: "Record finalised by doctor",
});
```

### 6. Fetch AuditLog by RecordId (Admin Only)

```ts
// Using client-side client (Admin role must be checked in middleware)
const { data, error } = await supabase
  .from("audit_logs")
  .select("*")
  .eq("record_id", recordId)
  .order("timestamp", { ascending: false })
  .range((page - 1) * pageSize, page * pageSize - 1);
```

### 7. Fetch Recent Discharges for Dashboard

```ts
const { data, error } = await supabase
  .from("discharge_records")
  .select(
    `
    record_id,
    status,
    generated_at,
    patient_inputs (
      patient_name,
      hospital_number
    )
  `,
  )
  .order("generated_at", { ascending: false })
  .limit(20);
```

---

## Real-Time Subscriptions (Optional)

For live updates to audit log or dashboard:

```ts
const supabase = createClient();

const subscription = supabase
  .channel("audit_logs_channel")
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "audit_logs" },
    (payload) => {
      console.log("New audit log entry:", payload.new);
      // Update UI or show notification
    },
  )
  .subscribe();

// Cleanup
return () => {
  subscription.unsubscribe();
};
```

**Use case:** Admin dashboard showing real-time audit log activity.

---

## Running Migrations

### Create a Migration File

```bash
supabase migration new initial_schema
```

This creates `supabase/migrations/<timestamp>_initial_schema.sql`.

### Write SQL in Migration File

Copy schema from `.agents/database/schema.sql` and RLS policies from `.agents/database/rls-policies.sql`.

### Apply Migrations Locally

```bash
supabase db push
```

### Apply Migrations to Production

```bash
supabase db push --linked
```

### Reset Local Database (Wipes all data)

```bash
supabase db reset
```

---

## Storage Buckets (for PDF Exports)

If storing PDF exports (v1.1 feature):

```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('pdf-exports', 'pdf-exports', false);

-- Policy: Only service role can upload
CREATE POLICY "Service role can upload PDFs" ON storage.objects
    FOR INSERT TO authenticated
    USING (auth.role() = 'service_role');

-- Policy: Users can download only their facility's PDFs
CREATE POLICY "Users can download facility PDFs" ON storage.objects
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM user_profiles
            WHERE facility_id = (storage.foldername(name))[1]::uuid
        )
    );
```

**Upload example:**

```ts
const { data, error } = await supabase.storage
  .from("pdf-exports")
  .upload(`${facilityId}/${recordId}.pdf`, pdfBlob);
```

---

## Environment Configuration Summary

| Variable                        | Purpose                     | Where to Use                  |
| ------------------------------- | --------------------------- | ----------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase API URL            | All clients                   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key (RLS-limited)      | Client-side client            |
| `SUPABASE_SERVICE_ROLE_KEY`     | Service role (bypasses RLS) | Server-side admin client only |

---

## Troubleshooting

| Issue                                    | Likely Cause                           | Solution                                        |
| ---------------------------------------- | -------------------------------------- | ----------------------------------------------- |
| `RLS policy violation`                   | User not in correct facility           | Check `user_profiles.facility_id`               |
| `User not found in user_profiles`        | Trigger didn't fire on signup          | Run `handle_new_user` function manually         |
| `JWT expired`                            | Session too old                        | Refresh token via middleware                    |
| `Permission denied for table audit_logs` | Using anon key instead of service role | Use `createAdminClient()` for audit_logs writes |
| `Discharge record not found`             | Facility mismatch                      | Check RLS policy filters by facility_id         |

---

## Constraints for this file

- **Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser** — use only in server API routes
- **Never skip RLS policies** — enforce all access control at database level
- **Never hardcode facility_id** — always derive from `user_profiles`
- **Never allow direct `audit_logs` INSERT from client** — use service role only
- **Never store plaintext passwords** — Supabase Auth handles hashing
- **Never forget to run migrations** before deploying to production
- **Never use service role client in React components** — security risk
