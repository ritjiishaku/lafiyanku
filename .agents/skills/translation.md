# Translation Skill
# File: /.agents/skills/translation.md
# Version: 1.0
# Last Updated: June 2026
# PRD Reference: CFW-PRD-001 v1.0
# Purpose: How to handle translation requests — trigger, languages, confidence, fallback, schema write.

---

## 1. Supported Languages

| Language | ISO Code | Notes                                              |
|----------|----------|----------------------------------------------------|
| English  | `en`     | Default — always available; never requires translation |
| Hausa    | `ha`     | Northern Nigeria primary language                  |
| Yoruba   | `yo`     | Southwestern Nigeria primary language              |
| Igbo     | `ig`     | Southeastern Nigeria primary language              |

If a language outside this list is requested, default to English and return:
`"Translation into [language] is not currently supported. English version provided."`

---

## 2. When to Trigger Translation

### Trigger 1 — At Generation Time (Automatic)
If `PatientInput.languageRequested` is `ha`, `yo`, or `ig`, the translation
is triggered automatically as part of the generation request.

The AI generation engine handles both Mode 1 + Mode 2 generation AND
translation in the same call. The translated output is returned in the
`translatedOutput` field of the generation response.

### Trigger 2 — On-Demand Post-Generation (Manual)
After a DischargeRecord exists, a Doctor or Nurse can request a translation
from the output panel via a "Translate" button. This triggers a separate
TranslationRequest.

---

## 3. TranslationRequest Schema

One row written per translation job.

```json
{
  "requestId": "generated-uuid",
  "recordId": "DischargeRecord.recordId",
  "sourceText": "PatientFriendlyOutput English text...",
  "targetLanguage": "ha",
  "outputText": "Translated Hausa text...",
  "confidence": "high",
  "fallbackUsed": false,
  "requestedAt": "2026-06-02T10:30:00Z",
  "completedAt": "2026-06-02T10:30:12Z"
}
```

---

## 4. Confidence Handling

The AI translation engine returns one of three confidence levels:

| Confidence | Meaning                                                    | Action                                                     |
|------------|------------------------------------------------------------|------------------------------------------------------------|
| `high`     | Translation is reliable and safe for clinical use          | Store `outputText`; display translated output to clinician |
| `low`      | Translation is uncertain — clinical risk if used as-is     | Set `fallbackUsed: true`; store English as `outputText`; show amber warning banner |
| `failed`   | Translation could not be completed                         | Set `fallbackUsed: true`; store English as `outputText`; show amber warning banner |

### Low Confidence / Failed Response — Amber Warning Banner

```
⚠ Translation into Hausa could not be completed with sufficient confidence.
  The English version has been provided instead.
  We recommend having the patient instructions verified by a native Hausa speaker
  before sharing with the patient.
```

Style: amber background (`#FFF8E1`), amber left border 4px (`#B45309`),
bodyMedium text, Slate (`#1E293B`) text colour.

---

## 5. Translation Rules (What the AI Must Follow)

These rules govern how the AI generates translations. They apply to all
three supported languages.

1. Preserve the original medical meaning exactly
2. Prioritise clarity over word-for-word literal translation
3. Use culturally understandable phrasing where possible
4. Never produce a dangerous or misleading medical translation
5. Translate Mode 2 (patient-friendly) only — never translate Mode 1
6. If translation confidence is low, do not return the low-confidence
   translation as the primary output — return English with a warning
7. Medication names should remain in their original form (do not translate
   drug names — e.g. Amlodipine stays "Amlodipine" in Hausa output)

---

## 6. DischargeRecord Update After Translation

After a successful translation, update the DischargeRecord:

```json
{
  "translatedOutput": "...",
  "translationLanguage": "ha",
  "translationConfidence": "high"
}
```

If fallback was used:

```json
{
  "translatedOutput": "[English patient-friendly output — translation not available]",
  "translationLanguage": "ha",
  "translationConfidence": "low"
}
```

---

## 7. AuditLog Entry for Translation

Translation does not have its own `action` enum value. Log it under the
generation or edit action with a note:

```json
{
  "action": "generate",
  "notes": "Translation requested: ha. Confidence: high. FallbackUsed: false."
}
```

For on-demand post-generation translation:

```json
{
  "action": "edit",
  "notes": "On-demand translation requested: yo. Confidence: low. FallbackUsed: true — English provided.",
  "changesDiff": {
    "translatedOutput": { "before": null, "after": "[English fallback]" },
    "translationLanguage": { "before": null, "after": "yo" },
    "translationConfidence": { "before": null, "after": "low" }
  }
}
```

---

## 8. UI — Translation Panel

When a translated output is available, display it as a third tab or panel:

- Tab label: `"[Language name] Instructions"` (e.g. "Hausa Instructions")
- If `fallbackUsed: true`, tab label shows: `"Hausa Instructions (English fallback)"`
- Amber badge on the tab if fallback was used: `⚠ Fallback`
- Translated content displayed in the same section structure as Mode 2
- A "Retranslate" button appears if confidence was `low` or `failed`

---

## Constraints

- Never translate Mode 1 (clinical summary) — translate Mode 2 only
- Never return a low-confidence translation without clearly flagging it
- Never block the clinician from viewing the output when translation fails —
  show English with a warning instead
- Never translate into a language outside: en · ha · yo · ig
- Never translate drug names — keep medication names in their original form
- Never skip writing a TranslationRequest row for every translation job
- Never use a fallback without setting `fallbackUsed: true` in the schema

---

*CareFlow — Translation Skill v1.0*
