````md
# File: .agents/frontend/component-map.md

# Version: 1.0

# Last updated: 2026-06-02

# PRD reference: CFW-PRD-001 v1.0

# Purpose: Every UI component needed to build CareFlow — component name, file path, purpose, props interface, shadcn/ui primitives, design tokens, and clinical safety rules.

## Component Categories

| Category          | Components                                                                                                 |
| ----------------- | ---------------------------------------------------------------------------------------------------------- |
| Form Components   | PatientInputForm, MedicationRow, LanguageSelector, ProcedureList                                           |
| Output Components | ClinicalSummaryPanel, PatientInstructionsPanel, TranslationPanel, MissingFieldsBanner, FlaggedIssuesBanner |
| Action Components | GenerateButton, FinaliseButton, PrintButton, WhatsAppShareButton, ExportPDFButton, ArchiveButton           |
| Layout Components | AppShell, Sidebar, TopNav, RoleGate                                                                        |
| Shared Components | StatusBadge, AuditLogTable, ConfirmModal, OfflineBanner, LoadingSpinner, Toast, ErrorBoundary              |

---

## Form Components

### Component 1: PatientInputForm

**File Path:** `src/components/forms/PatientInputForm.tsx`

**Purpose:** Main form for collecting all PatientInput fields. Handles validation, draft saving, and submission.

**shadcn/ui Primitives:** `Form`, `Input`, `Textarea`, `Select`, `Button`, `Card`, `Label`

**Design Tokens:** Clinical Teal (primary buttons), Warm Amber (validation errors), Slate (labels), Cool Grey (placeholders)

**Props Interface:**

```ts
interface PatientInputFormProps {
  initialData?: Partial<PatientInput>; // For loading drafts
  onSubmit: (data: PatientInput) => Promise<void>;
  onSaveDraft: (data: Partial<PatientInput>) => void;
  isGenerating: boolean;
}
```
````

**Clinical Safety Rules:**

- All required fields must be validated before enabling Generate button
- Medication array must have at least one complete entry (name, dosage, frequency)
- Discharge date must be >= admission date
- Age must be between 0 and 130
- MDCN licence number must match regex: `/^MDCN\/\d{4}\/\d{5}$/` (if provided)

---

### Component 2: MedicationRow

**File Path:** `src/components/forms/MedicationRow.tsx`

**Purpose:** Individual medication entry row with all sub-fields (name, dosage, frequency, timing, duration, notes). Supports dynamic add/remove.

**shadcn/ui Primitives:** `Input`, `Button`, `Card`

**Design Tokens:** Cool Grey (borders), Slate (labels), Warm Amber (errors)

**Props Interface:**

```ts
interface MedicationRowProps {
  index: number;
  medication: Medication;
  onChange: (index: number, field: keyof Medication, value: string) => void;
  onRemove: (index: number) => void;
  canRemove: boolean; // false if only one row remains
  errors?: Record<string, string>;
}
```

**Clinical Safety Rules:**

- Name, dosage, and frequency are required
- Dosage must include unit (mg, mcg, g, mL, etc.) — validate with regex: `/\d+\s*(mg|mcg|g|mL|L|IU)/i`
- Frequency must not be empty
- Warning if duration is empty (suggest "ongoing" or specific duration)

---

### Component 3: LanguageSelector

**File Path:** `src/components/forms/LanguageSelector.tsx`

**Purpose:** Select patient language preference for translation (en, ha, yo, ig). Defaults to English.

**shadcn/ui Primitives:** `Select`, `Label`

**Design Tokens:** Clinical Teal (selected state), Cool Grey (unselected)

**Props Interface:**

```ts
interface LanguageSelectorProps {
  value: "en" | "ha" | "yo" | "ig";
  onChange: (language: "en" | "ha" | "yo" | "ig") => void;
  disabled?: boolean;
}
```

**Clinical Safety Rules:**

- Translation only attempted for ha, yo, ig (not en)
- Low-confidence translation falls back to English automatically

---

### Component 4: ProcedureList

**File Path:** `src/components/forms/ProcedureList.tsx`

**Purpose:** Dynamic list of procedures performed during admission. Optional field.

**shadcn/ui Primitives:** `Input`, `Button`

**Design Tokens:** Cool Grey (borders), Slate (labels)

**Props Interface:**

```ts
interface ProcedureListProps {
  procedures: string[];
  onChange: (procedures: string[]) => void;
}
```

**Clinical Safety Rules:**

- Empty array allowed (procedures are optional)
- Each procedure max 200 characters

---

## Output Components

### Component 5: ClinicalSummaryPanel

**File Path:** `src/components/outputs/ClinicalSummaryPanel.tsx`

**Purpose:** Display Mode 1 (clinical discharge summary). Editable for doctors and nurses (draft only). Hidden from admin users.

**shadcn/ui Primitives:** `Card`, `Button`, `Textarea` (edit mode)

**Design Tokens:** Pure White (background), Slate (text), Clinical Teal (edit button)

**Props Interface:**

```ts
interface ClinicalSummaryPanelProps {
  content: string;
  isEditable: boolean;
  isDraft: boolean;
  userRole: "doctor" | "nurse" | "admin";
  onEdit?: (newContent: string) => void;
}
```

**Clinical Safety Rules:**

- Admin users must not see this component (return null)
- Editable only when status = 'draft' AND userRole in ['doctor', 'nurse']
- On edit, must trigger audit log with changesDiff

---

### Component 6: PatientInstructionsPanel

**File Path:** `src/components/outputs/PatientInstructionsPanel.tsx`

**Purpose:** Display Mode 2 (patient-friendly instructions). Editable for doctors and nurses (draft only). Visible to all authenticated users.

**shadcn/ui Primitives:** `Card`, `Button`, `Textarea` (edit mode)

**Design Tokens:** Pure White (background), Slate (text), Clinical Teal (edit button)

**Props Interface:**

```ts
interface PatientInstructionsPanelProps {
  content: string;
  isEditable: boolean;
  isDraft: boolean;
  userRole: "doctor" | "nurse" | "admin";
  onEdit?: (newContent: string) => void;
}
```

**Clinical Safety Rules:**

- Must be plain text (no HTML, no markdown)
- Line breaks preserved for WhatsApp sharing
- Must end with "Signed by" and "Date"

---

### Component 7: TranslationPanel

**File Path:** `src/components/outputs/TranslationPanel.tsx`

**Purpose:** Display translated version of Mode 2 (if confidence = high). Shows warning if confidence = low.

**shadcn/ui Primitives:** `Card`, `Alert`, `Badge`

**Design Tokens:** Warm Amber (warning), Clinical Teal (translated text)

**Props Interface:**

```ts
interface TranslationPanelProps {
  translatedContent: string | null;
  language: "ha" | "yo" | "ig";
  confidence: "high" | "low" | "failed";
  onRequestTranslation?: (language: "ha" | "yo" | "ig") => void;
}
```

**Clinical Safety Rules:**

- Do not show translation if confidence = 'low' or 'failed' (fallback to English)
- Show warning banner when confidence is not high
- Do not cache low-confidence translations for patient display

---

### Component 8: MissingFieldsBanner

**File Path:** `src/components/outputs/MissingFieldsBanner.tsx`

**Purpose:** Display warning when required fields are missing (FR-14). Shown at top of output view.

**shadcn/ui Primitives:** `Alert`, `List`

**Design Tokens:** Warm Amber (background and border), Slate (text)

**Props Interface:**

```ts
interface MissingFieldsBannerProps {
  missingFields: string[];
}
```

**Clinical Safety Rules:**

- Must appear prominently when missing_fields_log is not empty
- Each missing field listed with clear label
- Do NOT block finalisation — warn only. Doctor has clinical authority to finalise despite incomplete optional fields.

---

### Component 9: FlaggedIssuesBanner

**File Path:** `src/components/outputs/FlaggedIssuesBanner.tsx`

**Purpose:** Display contradictory input warnings (FR-15). Shown at top of output view.

**shadcn/ui Primitives:** `Alert`, `List`

**Design Tokens:** Warm Amber (background and border), Slate (text)

**Props Interface:**

```ts
interface FlaggedIssuesBannerProps {
  flaggedIssues: string[];
}
```

**Clinical Safety Rules:**

- Must appear when flagged_issues is not empty
- Do NOT block finalisation — warn only. Doctor has clinical authority to finalise despite flagged issues.

---

## Action Components

### Component 10: GenerateButton

**File Path:** `src/components/actions/GenerateButton.tsx`

**Purpose:** Trigger AI generation from PatientInput form. Disabled when required fields missing or offline.

**shadcn/ui Primitives:** `Button`

**Design Tokens:** Clinical Teal (background), Pure White (text)

**Props Interface:**

```ts
interface GenerateButtonProps {
  isValid: boolean;
  isGenerating: boolean;
  isOffline: boolean;
  onClick: () => void;
}
```

**Clinical Safety Rules:**

- Disabled when required fields are missing
- Disabled when offline (AI generation requires internet)
- Shows loading spinner during generation

---

### Component 11: FinaliseButton

**File Path:** `src/components/actions/FinaliseButton.tsx`

**Purpose:** Finalise a draft record (Doctor only). Shows confirmation modal before action.

**shadcn/ui Primitives:** `Button`, `Dialog` (confirmation)

**Design Tokens:** Deep Navy (background), Pure White (text)

**Props Interface:**

```ts
interface FinaliseButtonProps {
  recordId: string;
  status: "draft" | "finalised" | "archived";
  userRole: "doctor" | "nurse" | "admin";
  onFinalise: () => void;
}
```

**Clinical Safety Rules:**

- Only visible to Doctor role
- Disabled when status !== 'draft'
- Requires confirmation modal: "Are you sure? No further edits will be allowed."

---

### Component 12: PrintButton

**File Path:** `src/components/actions/PrintButton.tsx`

**Purpose:** Print or generate PDF of finalised discharge record. Triggers browser print dialog.

**shadcn/ui Primitives:** `Button`

**Design Tokens:** Clinical Teal (background), Pure White (text)

**Props Interface:**

```ts
interface PrintButtonProps {
  recordId: string;
  status: "draft" | "finalised" | "archived";
  userRole: "doctor" | "nurse" | "admin";
  onPrint: () => void;
}
```

**Clinical Safety Rules:**

- Only enabled when status === 'finalised'
- Invisible to Admin role
- Must log audit event (action: 'print') before opening print dialog

---

### Component 13: WhatsAppShareButton

**File Path:** `src/components/actions/WhatsAppShareButton.tsx`

**Purpose:** Share patient-friendly instructions via WhatsApp (plain text only, no Mode 1).

**shadcn/ui Primitives:** `Button`

**Design Tokens:** #25D366 (WhatsApp green), Pure White (text)

**Props Interface:**

```ts
interface WhatsAppShareButtonProps {
  recordId: string;
  patientFriendlyOutput: string;
  translatedOutput?: string | null;
  translationLanguage?: "ha" | "yo" | "ig";
  translationConfidence?: "high" | "low" | "failed";
  status: "draft" | "finalised" | "archived";
  userRole: "doctor" | "nurse" | "admin";
  onShare: () => void;
}
```

**Clinical Safety Rules:**

- Only share Mode 2 (patient-friendly instructions) — never Mode 1
- Only enabled when status === 'finalised'
- Invisible to Admin role
- Strip all markdown and separators before sharing
- If translation confidence is not 'high', share English version with warning

---

### Component 14: ExportPDFButton

**File Path:** `src/components/actions/ExportPDFButton.tsx`

**Purpose:** Export discharge record as PDF for clinical records (includes Mode 1 for doctors/nurses).

**shadcn/ui Primitives:** `Button`

**Design Tokens:** Deep Navy (background), Pure White (text)

**Props Interface:**

```ts
interface ExportPDFButtonProps {
  recordId: string;
  status: "draft" | "finalised" | "archived";
  userRole: "doctor" | "nurse" | "admin";
  onExport: () => void;
}
```

**Clinical Safety Rules:**

- Only enabled when status === 'finalised'
- Invisible to Admin role
- Must log audit event (action: 'export') before generating PDF

---

### Component 15: ArchiveButton

**File Path:** `src/components/actions/ArchiveButton.tsx`

**Purpose:** Archive a finalised record (soft delete). Doctor or Admin only.

**shadcn/ui Primitives:** `Button`, `Dialog` (confirmation)

**Design Tokens:** Warm Amber (background), Pure White (text)

**Props Interface:**

```ts
interface ArchiveButtonProps {
  recordId: string;
  status: "draft" | "finalised" | "archived";
  userRole: "doctor" | "nurse" | "admin";
  onArchive: () => void;
}
```

**Clinical Safety Rules:**

- Only visible to Doctor and Admin roles
- Only enabled when status === 'finalised'
- Requires confirmation modal: "Archive this record? It will be hidden from active lists."

---

## Layout Components

### Component 16: AppShell

**File Path:** `src/components/layout/AppShell.tsx`

**Purpose:** Main layout wrapper with sidebar and top navigation. Handles responsive mobile layout.

**shadcn/ui Primitives:** `Sheet` (mobile sidebar)

**Design Tokens:** Deep Navy (sidebar), Cool Off-White (background)

**Props Interface:**

```ts
interface AppShellProps {
  children: React.ReactNode;
}
```

---

### Component 17: Sidebar

**File Path:** `src/components/layout/Sidebar.tsx`

**Purpose:** Navigation sidebar with links based on user role. Collapsible on mobile.

**shadcn/ui Primitives:** `NavLink`, `Separator`

**Design Tokens:** Deep Navy (background), Cool Grey (inactive links), Clinical Teal (active)

**Props Interface:**

```ts
interface SidebarProps {
  userRole: "doctor" | "nurse" | "admin";
  isOpen: boolean;
  onClose: () => void;
}
```

---

### Component 18: TopNav

**File Path:** `src/components/layout/TopNav.tsx`

**Purpose:** Top navigation bar with user menu, notifications, and mobile menu toggle.

**shadcn/ui Primitives:** `Avatar`, `DropdownMenu`, `Button`

**Design Tokens:** Pure White (background), Slate (text), Clinical Teal (hover)

**Props Interface:**

```ts
interface TopNavProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
  onLogout: () => void;
}
```

---

### Component 19: RoleGate

**File Path:** `src/components/layout/RoleGate.tsx`

**Purpose:** Conditionally render children based on user role. Server-side check still required on API routes.

**shadcn/ui Primitives:** None

**Design Tokens:** None

**Props Interface:**

```ts
interface RoleGateProps {
  allowedRoles: Array<"doctor" | "nurse" | "admin">;
  userRole?: "doctor" | "nurse" | "admin";
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
```

**Clinical Safety Rules:**

- This is a UI convenience only — never rely on this for security
- API routes must independently verify permissions

---

## Shared Components

### Component 20: StatusBadge

**File Path:** `src/components/shared/StatusBadge.tsx`

**Purpose:** Display record status (draft, finalised, archived) with appropriate colour.

**shadcn/ui Primitives:** `Badge`

**Design Tokens:** Warm Amber (draft), Clinical Teal (finalised), Cool Grey (archived)

**Props Interface:**

```ts
interface StatusBadgeProps {
  status: "draft" | "finalised" | "archived";
}
```

---

### Component 21: AuditLogTable

**File Path:** `src/components/shared/AuditLogTable.tsx`

**Purpose:** Display audit log entries in a sortable, filterable table. Admin only.

**shadcn/ui Primitives:** `Table`, `Button` (pagination)

**Design Tokens:** Pure White (background), Slate (text), Cool Grey (borders)

**Props Interface:**

```ts
interface AuditLogTableProps {
  recordId: string;
  initialPage?: number;
  pageSize?: number;
}
```

---

### Component 22: ConfirmModal

**File Path:** `src/components/shared/ConfirmModal.tsx`

**Purpose:** Reusable confirmation dialog for destructive or irreversible actions (finalise, archive).

**shadcn/ui Primitives:** `Dialog`, `Button`

**Design Tokens:** Warm Amber (danger button), Deep Navy (cancel)

**Props Interface:**

```ts
interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}
```

---

### Component 23: OfflineBanner

**File Path:** `src/components/shared/OfflineBanner.tsx`

**Purpose:** Show banner when user loses internet connection. Indicates that form drafts will be saved locally.

**shadcn/ui Primitives:** `Alert`

**Design Tokens:** Warm Amber (background), Slate (text)

**Props Interface:**

```ts
interface OfflineBannerProps {
  isOffline: boolean;
  hasDraft: boolean;
}
```

---

### Component 24: LoadingSpinner

**File Path:** `src/components/shared/LoadingSpinner.tsx`

**Purpose:** Reusable loading spinner for async operations.

**shadcn/ui Primitives:** `Loader2` (icon)

**Design Tokens:** Clinical Teal (spinner colour)

**Props Interface:**

```ts
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}
```

---

### Component 25: Toast

**File Path:** `src/components/shared/Toast.tsx`

**Purpose:** Notification toast for success, error, warning, and info messages.

**shadcn/ui Primitives:** `Toast` (from shadcn/ui toast component)

**Design Tokens:** Clinical Teal (success), Warm Amber (error/warning), Deep Navy (info)

**Props Interface:** (uses shadcn/ui toast API)

---

### Component 26: ErrorBoundary

**File Path:** `src/components/shared/ErrorBoundary.tsx`

**Purpose:** React error boundary to catch rendering errors and show fallback UI.

**shadcn/ui Primitives:** `Card`, `Button`

**Design Tokens:** Warm Amber (error border), Slate (text)

**Props Interface:**

```ts
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
```

**Clinical Safety Rules:**

- Must log error to console and (optionally) to error tracking service
- Must not expose stack traces to users

---

## Component Dependency Diagram

```
AppShell
├── Sidebar
├── TopNav
└── RoleGate (wraps pages)

PatientInputForm
├── MedicationRow (dynamic)
├── ProcedureList
├── LanguageSelector
├── GenerateButton
└── OfflineBanner

OutputViewer
├── ClinicalSummaryPanel
├── PatientInstructionsPanel
├── TranslationPanel
├── MissingFieldsBanner
├── FlaggedIssuesBanner
├── FinaliseButton
├── PrintButton
├── WhatsAppShareButton
├── ExportPDFButton
├── ArchiveButton
└── StatusBadge

AuditLogViewer (admin only)
├── AuditLogTable
└── ConfirmModal

Shared across all
├── LoadingSpinner
├── Toast
├── ConfirmModal
└── ErrorBoundary
```

---

## Constraints for this file

- **Never skip RoleGate on protected UI sections** — client-side convenience only, not security
- **Never expose Edit buttons to non-owner nurses** — only their own drafts
- **Never render ClinicalSummaryPanel to Admin users** — PRD §6.4
- **Never enable Print/Share buttons on draft records**
- **Never show low-confidence translations to patients** — fallback to English
- **Never use inline styles** — use Tailwind CSS or design tokens
- **Never forget loading and error states** — every async component needs both
- **Never hardcopy component logic** — use the props interfaces defined here
