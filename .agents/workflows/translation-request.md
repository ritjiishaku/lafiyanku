# Translation Request Workflow
# File: /.agents/workflows/translation-request.md
# Version: 1.0
# Last Updated: June 2026
# PRD Reference: CFW-PRD-001 v1.0
# Purpose: Step-by-step agent instructions for the Translation Request workflow — automatic and on-demand.

---

## Overview

Translation converts the Mode 2 (patient-friendly) output into Hausa, Yoruba,
or Igbo. It can be triggered automatically at generation time or on-demand
after a record is created. This workflow covers both trigger paths.

**Permitted roles:** Doctor · Nurse (to request) · Admin (to view result only)
**Translates:** Mode 2 (patientFriendlyOutput) only — never Mode 1
**Supported languages:** ha (Hausa) · yo (Yoruba) · ig (Igbo)

---

## Trigger Path 1 — Automatic (At Generation Time)

### When It Fires

Trigger Path 1 fires when `PatientInput.languageRequested` is set to
`ha`, `yo`, or `ig` before the clinician clicks "Generate Discharge Record".

The AI generation engine handles Mode 1, Mode 2, AND translation in a
single call. No separate API call is required.

### Step 1 — Translation Is Part of Generation Response

The generation response includes:

```json
{
  "data": {
    "clinicalSummary": "...",
    "patientFriendlyOutput": "...",
    "translatedOutput": "...",
    "translationLanguage": "ha",
    "translationConfidence": "high"
  }
}
```

### Step 2 — Write TranslationRequest Row [DB WRITE]

After the DischargeRecord is written, write a TranslationRequest row:

```
INSERT TranslationRequest {
  requestId:      generateUUID()
  recordId:       DischargeRecord.recordId
  sourceText:     DischargeRecord.patientFriendlyOutput
  targetLanguage: "ha"
  outputText:     response.data.translatedOutput
  confidence:     response.data.translationConfidence
  fallbackUsed:   translationConfidence IN ["low", "failed"] ? true : false
  requestedAt:    now() UTC
  completedAt:    now() UTC
}
```

### Step 3 — Confidence Branch

```
IF translationConfidence = "high"
  → Store translatedOutput in DischargeRecord.translatedOutput
  → Display translated tab in output panel
  → No warning required

IF translationConfidence IN ["low", "failed"]
  → Set fallbackUsed = true
  → Store English patientFriendlyOutput in DischargeRecord.translatedOutput
  → Set DischargeRecord.translationConfidence = translationConfidence
  → Display amber warning banner on translation tab:
    "⚠ Translation into [language] could not be completed with sufficient confidence.
    The English version has been provided. We recommend having a native [language] speaker
    verify the instructions before sharing with the patient."
END IF
```

---

## Trigger Path 2 — On-Demand (Post-Generation)

### When It Fires

Trigger Path 2 fires when a clinician clicks "Translate" on an existing
DischargeRecord that either:
- Has no translation yet (`translatedOutput` is null), OR
- Has a low-confidence or failed translation and the clinician clicks "Retranslate"

**Permitted on:** Both draft and finalised records
**Permitted roles:** Doctor · Nurse

### Step 1 — Role Check

```
IF user.role NOT IN ["doctor", "nurse"]
  → Return HTTP 403
  → Display: "You do not have permission to request a translation."
  → STOP
END IF
```

### Step 2 — Language Selection

If no language was set at generation time, present a language selector:

```
┌─────────────────────────────────────────────┐
│  Translate Patient Instructions             │
│                                             │
│  Select language:                           │
│  ○ Hausa                                    │
│  ○ Yoruba                                   │
│  ○ Igbo                                     │
│                                             │
│  [Cancel]         [Request Translation]     │
└─────────────────────────────────────────────┘
```

If a language was already set (from PatientInput), pre-select it.
Allow the clinician to change it.

### Step 3 — Write TranslationRequest (pending) [DB WRITE]

```
INSERT TranslationRequest {
  requestId:      generateUUID()
  recordId:       DischargeRecord.recordId
  sourceText:     DischargeRecord.patientFriendlyOutput
  targetLanguage: selectedLanguage
  outputText:     null
  confidence:     null
  fallbackUsed:   false
  requestedAt:    now() UTC
  completedAt:    null
}
```

### Step 4 — Call Translation Engine

```
POST /translation/request
Body: {
  requestId:      TranslationRequest.requestId
  sourceText:     DischargeRecord.patientFriendlyOutput
  targetLanguage: selectedLanguage
  promptVersion:  "v2.0"
}
```

Show loading state: "Translating into [language]…"

```
IF request times out (> 15 seconds)
  → Display: "Translation timed out. Please try again."
  → Update TranslationRequest { confidence: "failed", fallbackUsed: true, completedAt: now() }
  → STOP
END IF
```

### Step 5 — Handle Translation Response

```
IF confidence = "high"
  → Update TranslationRequest {
      outputText:  response.translatedOutput
      confidence:  "high"
      fallbackUsed: false
      completedAt: now() UTC
    }
  → Update DischargeRecord {
      translatedOutput:      response.translatedOutput
      translationLanguage:   selectedLanguage
      translationConfidence: "high"
    }
  → Display translated tab — no warning

IF confidence IN ["low", "failed"]
  → Update TranslationRequest {
      outputText:   DischargeRecord.patientFriendlyOutput  (English fallback)
      confidence:   response.confidence
      fallbackUsed: true
      completedAt:  now() UTC
    }
  → Update DischargeRecord {
      translatedOutput:      DischargeRecord.patientFriendlyOutput
      translationLanguage:   selectedLanguage
      translationConfidence: response.confidence
    }
  → Display amber warning banner:
    "⚠ Translation into [language] could not be completed with sufficient confidence.
    English version provided."
END IF
```

### Step 6 — Write AuditLog [DB WRITE]

```
INSERT AuditLog {
  logId:       generateUUID()
  recordId:    DischargeRecord.recordId
  userId:      user.id
  userRole:    user.role
  action:      "edit"
  timestamp:   now() UTC
  ipAddress:   request.ip
  changesDiff: {
    "translatedOutput":      { "before": oldValue, "after": newValue },
    "translationLanguage":   { "before": oldLang,  "after": selectedLanguage },
    "translationConfidence": { "before": oldConf,  "after": response.confidence }
  }
  notes: "On-demand translation requested: [language]. Confidence: [confidence].
          FallbackUsed: [true/false]."
}
```

---

## Translation Rules (What the AI Must Follow)

These rules apply in both trigger paths:

1. Translate Mode 2 (patientFriendlyOutput) only — never translate Mode 1
2. Preserve the original medical meaning exactly
3. Prioritise clarity over word-for-word translation
4. Use culturally understandable phrasing for Nigerian patients
5. Never produce a dangerous or misleading medical translation
6. Keep medication names in their original form — do not translate drug names
7. If confidence is low, do not return the low-confidence translation as
   the primary output — return English with a clearly stated warning

---

## Error Branch Summary

| Error Condition               | Response                                                         |
|-------------------------------|------------------------------------------------------------------|
| Wrong role                    | HTTP 403; "No permission" message                                |
| Unsupported language requested| Default to English; state supported languages: ha · yo · ig      |
| Translation timeout           | Update TranslationRequest as failed; amber warning; try-again UI |
| Translation engine error      | Same as timeout handling                                         |
| AuditLog write fails          | Critical error; system alert; do not proceed silently            |

---

## Constraints

- Never translate Mode 1 (clinical summary) — Mode 2 only
- Never return a low-confidence translation without clearly flagging it
- Never translate drug/medication names — preserve them as-is
- Never skip writing a TranslationRequest row for every translation job
- Never set fallbackUsed = false when confidence is low or failed
- Never allow Admin to trigger a translation request
- Never allow translation of unsupported languages — default to English

---

*CareFlow — Translation Request Workflow v1.0*
