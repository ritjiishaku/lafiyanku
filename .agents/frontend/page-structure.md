````md
# File: .agents/frontend/page-structure.md

# Version: 1.0

# Last updated: 2026-06-02

# PRD reference: CFW-PRD-001 v1.0

# Purpose: Every page in the Next.js app/ directory — file path, route, access control, purpose, key components, data fetched, loading states, error states.

## Page Summary Table

| Page           | Route                    | Roles                | Purpose                                                 |
| -------------- | ------------------------ | -------------------- | ------------------------------------------------------- |
| Landing        | `/`                      | Public               | Marketing/landing page, redirects to login or dashboard |
| Login          | `/auth/login`            | Public               | Supabase authentication (email/password or magic link)  |
| Dashboard      | `/dashboard`             | doctor, nurse, admin | Overview of recent discharges and pending drafts        |
| New Discharge  | `/discharge/new`         | doctor, nurse        | PatientInput form for creating a new discharge          |
| View Discharge | `/discharge/[id]`        | doctor, nurse, admin | View discharge record details (Mode 1 + Mode 2)         |
| Output Viewer  | `/discharge/[id]/output` | doctor, nurse        | Full-screen output view with print/share actions        |
| Audit Log      | `/audit/[recordId]`      | admin                | View immutable audit trail for a record                 |
| Settings       | `/settings`              | doctor, nurse, admin | User preferences, facility settings (admin only)        |

---

## Page 1: Landing Page (`/`)

### File Path

`app/page.tsx`

### Route

`/`

### Permitted Roles

Public (no authentication required)

### Purpose

Marketing/landing page for CareFlow. Redirects authenticated users to `/dashboard`. Shows hero section, features, and login CTA for unauthenticated users.

### Key Components

- Hero section (title, tagline, CTA buttons)
- Features grid (3-4 key features)
- Login button (redirects to `/auth/login`)
- Footer

### Data Fetched

None (static page)

### Loading State

N/A (static content)

### Error State

N/A

### Redirect Logic

```tsx
// On mount, check session
const {
  data: { session },
} = await supabase.auth.getSession();
if (session) {
  redirect("/dashboard");
}
```
````

---

## Page 2: Login Page (`/auth/login`)

### File Path

`app/auth/login/page.tsx`

### Route

`/auth/login`

### Permitted Roles

Public

### Purpose

Supabase authentication page. Supports email/password login and magic link (optional). Redirects to `/dashboard` on success.

### Key Components

- Email input field
- Password input field
- Submit button
- "Forgot password?" link
- "Sign up" link (for first-time users — admin creates accounts)

### Data Fetched

None

### Loading State

- Disable submit button during authentication
- Show "Logging in..." spinner

### Error State

- Display "Invalid email or password" toast on auth failure
- Display "Please check your email for magic link" on success (if magic link)

### Authentication Flow

```tsx
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

const handleLogin = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    showToast(error.message, "error");
  } else {
    router.push("/dashboard");
  }
};
```

---

## Page 3: Dashboard Page (`/dashboard`)

### File Path

`app/dashboard/page.tsx`

### Route

`/dashboard`

### Permitted Roles

`doctor`, `nurse`, `admin`

### Purpose

Overview page showing:

- Recent discharge records (last 7 days)
- Pending drafts (status = 'draft')
- Quick stats (total discharges this month, pending finalisations)
- For Admin: system health and audit summary

### Key Components

- Stats cards (total discharges, pending drafts, completed finalisations)
- Recent discharges table (patient name, date, status, actions)
- "New Discharge" button (floating action button)
- For Admin: audit log summary widget

### Data Fetched

```ts
// Recent discharges for user's facility
const { data: recentDischarges } = await supabase
  .from("discharge_records")
  .select(
    `
    record_id,
    status,
    generated_at,
    patient_inputs (patient_name, hospital_number)
  `,
  )
  .eq("facility_id", user.facilityId)
  .order("generated_at", { ascending: false })
  .limit(20);

// Pending drafts count
const { count: pendingDrafts } = await supabase
  .from("discharge_records")
  .select("*", { count: "exact", head: true })
  .eq("status", "draft")
  .eq("generated_by_user_id", user.id);
```

### Loading State

- Show skeleton loaders for stats cards and table
- Loading spinner while fetching data

### Error State

- Show "Failed to load dashboard data. Please refresh." toast
- Retry button

---

## Page 4: New Discharge Page (`/discharge/new`)

### File Path

`app/discharge/new/page.tsx`

### Route

`/discharge/new`

### Permitted Roles

`doctor`, `nurse`

### Purpose

PatientInput form for creating a new discharge record. Includes all required fields, medication rows, language selector, and save-as-draft functionality.

### Key Components

- `PatientInputForm` component (see `.agents/frontend/component-map.md`)
- `MedicationRow` component (dynamic add/remove)
- `LanguageSelector` component (en/ha/yo/ig)
- Save Draft button
- Generate button (triggers AI generation)
- Offline banner (when disconnected)

### Data Fetched

- Saved draft from IndexedDB (if exists)
- Facility info from user profile

### Loading State

- Skeleton form while checking for saved drafts
- Disable generate button during AI generation

### Error State

- Field-level validation errors (Warm Amber #B45309)
- Network error banner when offline
- Generation failure toast

### Form Submission Flow

```tsx
const handleGenerate = async (patientInput: PatientInput) => {
  setIsGenerating(true);
  try {
    const response = await fetch("/api/discharge/generate", {
      method: "POST",
      body: JSON.stringify({ patientInput }),
    });
    const data = await response.json();
    if (response.ok) {
      router.push(`/discharge/${data.data.recordId}/output`);
    } else {
      showError(data.error.message);
    }
  } finally {
    setIsGenerating(false);
  }
};
```

---

## Page 5: View Discharge Page (`/discharge/[id]`)

### File Path

`app/discharge/[id]/page.tsx`

### Route

`/discharge/[id]`

### Permitted Roles

`doctor`, `nurse`, `admin` (admin sees Mode 2 only)

### Purpose

View discharge record details. Shows both Mode 1 (clinical summary) and Mode 2 (patient instructions) with role-based visibility. Admin sees only Mode 2.

### Key Components

- `ClinicalSummaryPanel` (Mode 1 — hidden for admin)
- `PatientInstructionsPanel` (Mode 2)
- `TranslationPanel` (if translation exists and confidence = high)
- `StatusBadge` (draft / finalised / archived)
- Action buttons (Edit, Finalise, Print, WhatsApp Share, Archive — based on role)
- `MissingFieldsBanner` (if missing_fields_log not empty)
- `FlaggedIssuesBanner` (if flagged_issues not empty)

### Data Fetched

```ts
const { data: record } = await supabase
  .from("discharge_records")
  .select(
    `
    *,
    patient_inputs (*)
  `,
  )
  .eq("record_id", id)
  .single();
```

### Loading State

- Skeleton loader for output panels
- Spinner while fetching

### Error State

- "Record not found" page (404)
- "You do not have access to this record" (403)

### Role-Based Visibility

```tsx
// Admin cannot see Mode 1
const showClinicalSummary = userRole !== "admin";
```

---

## Page 6: Output Viewer Page (`/discharge/[id]/output`)

### File Path

`app/discharge/[id]/output/page.tsx`

### Route

`/discharge/[id]/output`

### Permitted Roles

`doctor`, `nurse` (admin cannot access — redirects to view page)

### Purpose

Full-screen output view after generation. Focuses on reading and editing outputs. Includes print and share actions prominently.

### Key Components

- Full `ClinicalSummaryPanel` with edit mode
- Full `PatientInstructionsPanel` with edit mode
- `TranslationPanel` (if available)
- Action toolbar: Edit, Save, Finalise, Print, WhatsApp Share, Back to Dashboard

### Data Fetched

Same as view page, plus edit permissions check

### Loading State

Same as view page

### Error State

Same as view page

### Edit Flow

```tsx
const handleSaveEdit = async (updatedOutputs) => {
  const response = await fetch(`/api/discharge/${id}`, {
    method: "PUT",
    body: JSON.stringify(updatedOutputs),
  });
  if (response.ok) {
    showToast("Changes saved", "success");
    setIsEditing(false);
  }
};
```

---

## Page 7: Audit Log Page (`/audit/[recordId]`)

### File Path

`app/audit/[recordId]/page.tsx`

### Route

`/audit/[recordId]`

### Permitted Roles

`admin` only

### Purpose

View immutable audit trail for a specific discharge record. Shows all actions (generate, edit, view, finalise, archive, print, export) with timestamps, user roles, and IP addresses.

### Key Components

- `AuditLogTable` component
- Filter controls (action type, date range)
- Pagination
- Export to CSV button

### Data Fetched

```ts
const { data: auditLogs } = await supabase
  .from("audit_logs")
  .select("*")
  .eq("record_id", recordId)
  .order("timestamp", { ascending: false })
  .range((page - 1) * pageSize, page * pageSize - 1);
```

### Loading State

- Table skeleton loader
- Pagination skeleton

### Error State

- "Failed to load audit log" toast
- Retry button

### Access Control

```tsx
// Middleware or page-level check
if (userRole !== "admin") {
  redirect("/dashboard");
}
```

---

## Page 8: Settings Page (`/settings`)

### File Path

`app/settings/page.tsx`

### Route

`/settings`

### Permitted Roles

`doctor`, `nurse`, `admin` (admin sees additional settings)

### Purpose

User preferences and facility settings. Admin can manage facility details and user roles.

### Key Components

- Profile settings (name, email, password change)
- Notification preferences
- For admin: facility management (facility name, code)
- For admin: user management (create users, assign roles)

### Data Fetched

```ts
// User profile
const { data: profile } = await supabase
  .from("user_profiles")
  .select("*")
  .eq("user_id", userId)
  .single();

// Admin-only: facility users
if (isAdmin) {
  const { data: users } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("facility_id", profile.facility_id);
}
```

### Loading State

- Skeleton for form fields
- Spinner on save

### Error State

- "Failed to update profile" toast
- Validation errors inline

---

## Layout Component (`app/layout.tsx`)

### File Path

`app/layout.tsx`

### Purpose

Root layout wrapper for all pages. Includes:

- `AppShell` component (sidebar + top navigation)
- Theme provider (next-themes)
- Supabase provider
- Toast notifications container

### Key Components

```tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-coolOffWhite">
        <ThemeProvider attribute="class" defaultTheme="light">
          <SupabaseProvider>
            <AppShell>{children}</AppShell>
            <Toaster />
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

---

## Route Guards (Middleware)

Create `middleware.ts` to protect routes:

```ts
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/discharge", "/audit", "/settings"];
const adminOnlyRoutes = ["/audit"];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const path = req.nextUrl.pathname;
  const isProtected = protectedRoutes.some((route) => path.startsWith(route));
  const isAdminRoute = adminOnlyRoutes.some((route) => path.startsWith(route));

  if (!session && isProtected) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (session && isAdminRoute) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

---

## Constraints for this file

- **Never skip authentication checks** — every protected page must verify session
- **Never expose admin-only pages to non-admin users** — check role before rendering
- **Never render Mode 1 (clinical summary) to Admin users** — PRD §6.4
- **Never allow access to draft outputs via print/share** — buttons must check status
- **Never hardcode redirect URLs** — use environment variables for `NEXT_PUBLIC_APP_URL`
- **Never forget loading and error states** — every async operation needs both
- **Never render the page before checking auth** — avoid flash of unauthorized content
