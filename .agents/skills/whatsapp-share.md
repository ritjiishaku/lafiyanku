# WhatsApp Share Skill
# File: /.agents/skills/whatsapp-share.md
# Version: 1.0
# Last Updated: June 2026
# PRD Reference: CFW-PRD-001 v1.0
# Purpose: How to prepare Mode 2 output for WhatsApp delivery — formatting, rules, AuditLog.

---

## 1. WhatsApp Share — Core Rule

**Mode 2 (patient-friendly output) only.**
Mode 1 (clinical summary) must NEVER be shared via WhatsApp or any
unencrypted messaging channel under any circumstance.

This is a non-negotiable security and clinical governance rule.

---

## 2. Who Can Share via WhatsApp

| Role   | Can WhatsApp Share | Notes                                              |
|--------|--------------------|----------------------------------------------------|
| Doctor | ✅                 | Can share Mode 2                                   |
| Nurse  | ✅                 | Can share Mode 2                                   |
| Admin  | ❌                 | Cannot share — return 403                          |

Record must be **finalised** before WhatsApp share is available.
Draft records cannot be shared. See export-print.md for the same rule.

---

## 3. Text Preparation Rules

WhatsApp does not render markdown, tables, or separator lines. The plain
text must be prepared as follows:

| Transformation                        | Rule                                              |
|---------------------------------------|---------------------------------------------------|
| Section separator lines (`──────`)   | Remove entirely — replace with a blank line       |
| Section headings (e.g. "What happened")| Keep as plain text — add a blank line before it  |
| Medication table                      | Convert to numbered plain-text list (see below)   |
| Bold / italic formatting              | Remove all — WhatsApp bold uses `*text*` but keep it plain for safety |
| Maximum lines per section             | 3–4 lines                                         |
| Final section                         | Always the red flag / when-to-return message      |
| Character limit                       | Keep under 1500 characters total where possible   |

---

## 4. Medication List Format for WhatsApp

Tables do not render in WhatsApp. Convert each medication row to a numbered
plain-text line:

**From (table format):**
```
| Amlodipine | 5mg | Once daily | Any time | Ongoing | — |
| Metformin  | 500mg | Twice daily | With food | Ongoing | — |
```

**To (WhatsApp format):**
```
Your medications:
1. Amlodipine (5mg) — Take once daily.
2. Metformin (500mg) — Take twice daily with food.
```

---

## 5. Full WhatsApp Text Template

```
PATIENT DISCHARGE INSTRUCTIONS
[Facility Name] — [Discharge Date DD/MM/YYYY]
Patient: [Patient Name]

What happened
[Plain-language diagnosis explanation — max 3 lines]

Treatment you received
[Plain-language treatment summary — max 3 lines]

Your medications
1. [Medication name] ([dosage]) — [frequency], [timing if available].
2. [Medication name] ([dosage]) — [frequency], [timing if available].
[Continue for all medications]

Important home care
[Home care instructions — max 3 lines]

Your follow-up appointment
[Follow-up in plain language — max 2 lines]

WHEN TO RETURN TO HOSPITAL IMMEDIATELY
[Red flag warning signs — plain language — always the last section]

[Language version below if available and confidence is high]
─
[Translated version in ha/yo/ig — same plain-text format]
```

---

## 6. Translated Version in WhatsApp

If `DischargeRecord.translatedOutput` is non-null and
`translationConfidence` is `high`:
- Append the translated version below the English version
- Separate with a single dashed line: `─`
- Translated version uses the same plain-text format rules

If `translationConfidence` is `low` or `failed`:
- Do not append the low-confidence translation
- Append this line instead:
  `"(Translation into [language] not available — English only)"`

---

## 7. How to Trigger WhatsApp Share in the UI

The "Share via WhatsApp" button:
- Appears on the output panel after a record is finalised
- Opens a system share sheet (on mobile) or copies plain text to clipboard (on desktop)
- On mobile: uses the `https://wa.me/?text=[encoded text]` deep link
- On desktop: copies text to clipboard and shows a toast: "Instructions copied to clipboard — paste into WhatsApp"
- Button is disabled on draft records with tooltip: "Finalise this record before sharing."

---

## 8. AuditLog Entry for WhatsApp Share

Every WhatsApp share must write an AuditLog entry.

```json
{
  "logId": "generated-uuid",
  "recordId": "DischargeRecord.recordId",
  "userId": "authenticated-user-id",
  "userRole": "nurse",
  "action": "export",
  "timestamp": "2026-06-02T10:30:00Z",
  "ipAddress": "request.ip",
  "changesDiff": null,
  "notes": "Mode 2 shared via WhatsApp. Language: ha. Translation included: true."
}
```

---

## Constraints

- Never share Mode 1 (clinical summary) via WhatsApp under any circumstance
- Never share a draft record — record must be finalised first
- Never allow Admin role to share via WhatsApp
- Never include generation metadata (promptVersion, modelVersion,
  generatedAt, generatedByUserId) in WhatsApp text
- Never include section separator lines (`──────`) in WhatsApp text
- Never include medication tables — convert to numbered plain-text list
- Never share a low-confidence translation — use English with a note instead
- Never skip the AuditLog entry for any WhatsApp share action
- The red flag / when-to-return section must always be the last section in
  the WhatsApp message

---

*CareFlow AI — WhatsApp Share Skill v1.0*
