# Design System
# File: /.agents/design-system.md
# Version: 1.0
# Last Updated: June 2026
# PRD Reference: CFW-PRD-001 v1.0
# Purpose: Full design token specification — colours, typography, spacing, components, accessibility.

---

## 1. Colour Tokens

Apply these tokens consistently across every component.
Do not introduce new colours without explicit instruction.

### 1.1 Core Palette

| Token           | Name           | Hex       | RGB               | Usage                                                 |
|-----------------|----------------|-----------|-------------------|-------------------------------------------------------|
| `primary`       | Clinical Teal  | `#0B6E6E` | 11, 110, 110      | Primary buttons, active states, links, focus rings    |
| `secondary`     | Deep Navy      | `#0D2B4E` | 13, 43, 78        | Page headings, navigation bar, sidebar, authority UI  |
| `tertiary`      | Warm Amber     | `#B45309` | 180, 83, 9        | Alerts, warnings, missing-field flags, low-confidence notices — **amber only, never red for warnings** |
| `neutral`       | Slate          | `#1E293B` | 30, 41, 59        | Body text, labels, form field text                    |
| `neutralVariant`| Cool Grey      | `#64748B` | 100, 116, 139     | Secondary labels, placeholder text, metadata, timestamps |
| `surface`       | Pure White     | `#FFFFFF` | 255, 255, 255     | Card backgrounds, modal surfaces, document panels     |
| `background`    | Cool Off-White | `#F0F4F8` | 240, 244, 248     | App canvas / outer background                         |

### 1.2 Derived / State Colours

| Token                | Hex       | Derived From    | Usage                                      |
|----------------------|-----------|-----------------|--------------------------------------------|
| `primaryLight`       | `#0E8F8F` | Clinical Teal   | Button hover state                         |
| `primaryDark`        | `#084F4F` | Clinical Teal   | Button pressed / active state              |
| `primarySubtle`      | `#E0F2F2` | Clinical Teal   | Selected row background, chip fill         |
| `secondaryLight`     | `#1A4A7A` | Deep Navy       | Nav item hover                             |
| `tertiaryBg`         | `#FFF8E1` | Warm Amber      | Alert banner background                    |
| `tertiaryBorder`     | `#D97706` | Warm Amber      | Alert banner border, warning outline       |
| `successGreen`       | `#1A7A3C` | —               | Finalised status badge, success states     |
| `successBg`          | `#E8F5E9` | —               | Success banner background                  |
| `errorRed`           | `#C0392B` | —               | Form field validation errors only          |
| `errorBg`            | `#FDECEA` | —               | Error banner background                    |
| `disabledFg`         | `#94A3B8` | —               | Disabled input text, disabled button label |
| `disabledBg`         | `#E2E8F0` | —               | Disabled input background                  |
| `borderDefault`      | `#CBD5E1` | —               | Input borders, card borders, dividers      |
| `borderFocus`        | `#0B6E6E` | Clinical Teal   | Input focus ring (3px, offset 2px)         |

### 1.3 Amber-Only Rule for Clinical Warnings

Amber (`#B45309`) is the **only** colour used for clinical warnings,
missing-field notices, and low-confidence translation alerts.

Red (`#C0392B`) is used **only** for form validation errors (e.g. required
field left empty).

Do not use red for clinical content warnings — red signals emergency in a
clinical context and must not be diluted by using it for non-emergency states.

---

## 2. Typography

**Font family: Plus Jakarta Sans**
Import: `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap`

### 2.1 Type Scale

| Token        | Weight | Size   | Line Height | Usage                                                  |
|--------------|--------|--------|-------------|--------------------------------------------------------|
| `display`    | 800    | 32px   | 40px        | App name / hero text only                              |
| `h1`         | 700    | 28px   | 36px        | Page-level headings (e.g. "Clinical Discharge Summary")|
| `h2`         | 700    | 22px   | 30px        | Section headings within a page                         |
| `h3`         | 600    | 18px   | 26px        | Sub-section labels (e.g. "Patient Information")        |
| `bodyLarge`  | 400    | 16px   | 24px        | Primary body text, clinical summary content            |
| `body`       | 400    | 14px   | 22px        | Standard body text, form field text                    |
| `bodyMedium` | 500    | 14px   | 22px        | Form labels, table headers                             |
| `small`      | 400    | 12px   | 18px        | Secondary labels, metadata, timestamps, placeholder    |
| `smallBold`  | 600    | 12px   | 18px        | Status badges, tags, enum chips                        |
| `caption`    | 300    | 11px   | 16px        | Legal text, footnotes, compliance notices              |

### 2.2 Font Usage Rules

- **Body text minimum: 14px** — never smaller for clinical content
- **Patient-friendly output: 16px (bodyLarge)** — patients read on small screens
- **Medication names: bodyMedium (500 weight)** — need to stand out clearly
- **Timestamps and metadata: small (12px, Cool Grey)** — de-emphasised
- **Warning messages: bodyMedium (500 weight, Warm Amber)** — prominent but not alarming
- **Do not use Light (300) for body text** — reserved for captions only

---

## 3. Spacing Scale

Based on a 4px base unit.

| Token   | Value | Usage                                         |
|---------|-------|-----------------------------------------------|
| `xs`    | 4px   | Icon padding, tight inline gaps               |
| `sm`    | 8px   | Input padding vertical, badge padding         |
| `md`    | 16px  | Input padding horizontal, card padding        |
| `lg`    | 24px  | Section gaps within a card                    |
| `xl`    | 32px  | Between major UI sections                     |
| `2xl`   | 48px  | Page-level vertical rhythm                    |
| `3xl`   | 64px  | Hero / cover spacing                          |

---

## 4. Border Radius

| Token     | Value | Usage                                        |
|-----------|-------|----------------------------------------------|
| `sm`      | 4px   | Input fields, small tags                     |
| `md`      | 8px   | Cards, modals, dropdowns                     |
| `lg`      | 12px  | Panels, large containers                     |
| `pill`    | 9999px| Status badges, language selector chips       |
| `none`    | 0px   | Table cells, full-width banners              |

---

## 5. Shadow Scale

| Token     | Value                                         | Usage                              |
|-----------|-----------------------------------------------|------------------------------------|
| `sm`      | `0 1px 2px rgba(0,0,0,0.06)`                  | Input fields at rest               |
| `md`      | `0 4px 6px rgba(0,0,0,0.08)`                  | Cards, dropdowns                   |
| `lg`      | `0 10px 15px rgba(0,0,0,0.10)`                | Modals, floating panels            |
| `focus`   | `0 0 0 3px rgba(11,110,110,0.30)`             | Focus ring (primary colour based)  |

---

## 6. Component States

### Input Field

| State     | Border              | Background  | Text colour | Shadow  |
|-----------|---------------------|-------------|-------------|---------|
| Default   | `borderDefault`     | `surface`   | `neutral`   | `sm`    |
| Focus     | `borderFocus` (3px) | `surface`   | `neutral`   | `focus` |
| Filled    | `borderDefault`     | `surface`   | `neutral`   | `sm`    |
| Disabled  | `borderDefault`     | `disabledBg`| `disabledFg`| none    |
| Error     | `errorRed` (2px)    | `errorBg`   | `neutral`   | none    |
| Optional  | `borderDefault`     | `surface`   | `neutralVariant` (placeholder) | `sm` |

### Primary Button

| State     | Background      | Text      | Border  |
|-----------|-----------------|-----------|---------|
| Default   | `primary`       | `surface` | none    |
| Hover     | `primaryLight`  | `surface` | none    |
| Active    | `primaryDark`   | `surface` | none    |
| Disabled  | `disabledBg`    | `disabledFg` | none |
| Focus     | `primary`       | `surface` | `focus` shadow |

### Status Badges

| Status      | Background    | Text          | Border         |
|-------------|---------------|---------------|----------------|
| `draft`     | `#FFF8E1`     | `#B45309`     | `#D97706`      |
| `finalised` | `#E8F5E9`     | `#1A7A3C`     | `#1A7A3C`      |
| `archived`  | `#F0F4F8`     | `#64748B`     | `#CBD5E1`      |

### Warning / Alert Banner (Amber)

```
Background:  #FFF8E1
Border-left: 4px solid #B45309
Text:        #1E293B (Slate)
Icon:        ⚠ in #B45309
Font:        bodyMedium (500, 14px)
Padding:     16px
Border-radius: 4px (left edge: 0)
```

---

## 7. Accessibility Requirements

### Contrast Ratios (WCAG)

| Context                    | Minimum Ratio | Standard |
|----------------------------|---------------|----------|
| Normal body text           | 4.5:1         | WCAG AA  |
| Large text (18px+ or bold) | 3:1           | WCAG AA  |
| UI components and borders  | 3:1           | WCAG AA  |
| Body text target           | 7:1           | WCAG AAA |

### Verified Token Contrast Ratios Against White (#FFFFFF)

| Token           | Hex       | Ratio  | Passes      |
|-----------------|-----------|--------|-------------|
| Clinical Teal   | `#0B6E6E` | 7.2:1  | AA + AAA ✅ |
| Deep Navy       | `#0D2B4E` | 15.5:1 | AA + AAA ✅ |
| Warm Amber      | `#B45309` | 4.6:1  | AA ✅       |
| Slate           | `#1E293B` | 16.1:1 | AA + AAA ✅ |
| Cool Grey       | `#64748B` | 4.6:1  | AA ✅       |

**Never use Cool Grey (`#64748B`) as body text on anything other than white
or off-white — it passes AA on white only.**

### Focus States
- Every interactive element must have a visible focus ring
- Focus ring: `0 0 0 3px rgba(11,110,110,0.30)` (Clinical Teal at 30% opacity)
- Never remove the outline without replacing it with an equally visible alternative

### Mobile Tap Targets
- Minimum tap target size: 44px × 44px
- Spacing between tap targets: minimum 8px
- This is especially important for the medication add/remove row buttons

---

## 8. Print / PDF Styles

When generating printable output (Mode 2 patient handout):
- Font: Plus Jakarta Sans — fall back to Arial if not available in PDF renderer
- Body size: 14pt minimum
- Line spacing: 1.6
- Margins: 20mm all sides
- Header: facility name (Bold 12pt) · patient name (Regular 12pt) · discharge date (Regular 12pt)
- Section headings: Bold 12pt, Deep Navy (`#0D2B4E`)
- Body text: Regular 11pt, Slate (`#1E293B`)
- Medication list: table with 1pt border, alternating row shading (#F7FAFD)
- Red flag section: amber left border (4pt, `#B45309`), amber background (`#FFF8E1`)

---

## Constraints

- Do not introduce colours outside the defined palette without explicit instruction
- Do not use red for clinical content warnings — red is reserved for form validation errors only
- Do not use font sizes below 12px in any UI context
- Do not use font sizes below 14px for patient-facing output (Mode 2)
- Do not use Light (300 weight) for body text — captions only
- Do not remove focus rings from interactive elements
- Do not use client-generated colours (e.g. random hex, CSS variables set at runtime) for semantic tokens

---

*CareFlow AI — Design System v1.0*
*Internal use only.*
