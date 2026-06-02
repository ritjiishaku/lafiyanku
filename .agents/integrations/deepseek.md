````md
# File: .agents/integrations/deepseek.md

# Version: 1.0

# Last updated: 2026-06-02

# PRD reference: CFW-PRD-001 v1.0

# Purpose: Complete DeepSeek API integration reference for CareFlow AI — API endpoint, models, authentication, parameters, prompt templates, error handling, rate limits, and data residency considerations.

## Overview

CareFlow AI uses **DeepSeek API** for both AI generation (Mode 1 + Mode 2 discharge summaries) and translation (Hausa, Yoruba, Igbo). All calls are made directly from Next.js API routes using `fetch`. No third-party SDKs or orchestration layers are used.

---

## API Endpoint

| Environment | Endpoint                                                                              |
| ----------- | ------------------------------------------------------------------------------------- |
| Production  | `https://api.deepseek.com/v1/chat/completions`                                        |
| Development | `https://api.deepseek.com/v1/chat/completions` (same endpoint, use different API key) |

**Note:** DeepSeek does not have a separate development endpoint. Use a development API key with lower rate limits or a test account.

---

## Authentication

All API requests require a Bearer token in the `Authorization` header.

```bash
Authorization: Bearer ${DEEPSEEK_API_KEY}
```
````

### Environment Variable

```bash
DEEPSEEK_API_KEY=sk-your-actual-api-key-here
```

### Obtaining an API Key

1. Create account at [platform.deepseek.com](https://platform.deepseek.com)
2. Navigate to API Keys section
3. Click "Create new key"
4. Copy the key immediately (only shown once)

### Free Credits

- New accounts receive 5 million free tokens (approximately 500-1,000 discharge summaries)
- After free credits, pay-as-you-go pricing applies

---

## Models

| Model               | Purpose                               | Cost (input/output per 1M tokens) |
| ------------------- | ------------------------------------- | --------------------------------- |
| `deepseek-chat`     | Generation + Translation (default)    | $0.14 / $0.28                     |
| `deepseek-reasoner` | Complex clinical reasoning (fallback) | $0.14 / $0.28 (same pricing)      |

**Recommendation:** Use `deepseek-chat` for all CareFlow AI calls. `deepseek-reasoner` may be used for pilot testing if more detailed reasoning is needed.

---

## Request Parameters

| Parameter           | Value                    | Description                                |
| ------------------- | ------------------------ | ------------------------------------------ |
| `model`             | `deepseek-chat`          | Model identifier                           |
| `messages`          | Array of ChatML messages | System + user prompts                      |
| `temperature`       | `0.3`                    | Low for clinical accuracy (0.0-1.0)        |
| `max_tokens`        | `4000`                   | Maximum output tokens                      |
| `stream`            | `false`                  | Disable streaming (simpler implementation) |
| `top_p`             | `0.9`                    | Nucleus sampling (default)                 |
| `frequency_penalty` | `0.0`                    | No penalty                                 |
| `presence_penalty`  | `0.0`                    | No penalty                                 |

---

## ChatML Prompt Format

DeepSeek uses the ChatML format with special tokens:

```
<|im_start|>system
[system prompt content]
<|im_end|>
<|im_start|>user
[user message content]
<|im_end|>
<|im_start|>assistant
[assistant response]
<|im_end|>
```

### Implementation in `fetch` (messages array)

```ts
const messages = [
  { role: "system", content: SYSTEM_PROMPT },
  { role: "user", content: userMessage },
];
```

DeepSeek automatically converts this to ChatML format. Do not manually add `<|im_start|>` tokens.

---

## System Prompts (Full Text)

### Discharge Generation System Prompt

```ts
const SYSTEM_PROMPT_DISCHARGE = `You are a clinical documentation assistant for Nigerian hospitals. Your task is to generate two outputs from the structured patient data provided.

## OUTPUT MODE 1: CLINICAL DISCHARGE SUMMARY

Generate a professional discharge summary for hospital records with these exact sections:

DISCHARGE SUMMARY

1. Patient Identification
   - Name: [patientName]
   - Hospital Number: [hospitalNumber]
   - Age: [age] years
   - Gender: [gender]
   - Admission Date: [admissionDate]
   - Discharge Date: [dischargeDate]

2. Diagnosis
   [diagnosis field content]

3. Treatment Given During Admission
   [treatmentGiven field content]

4. Procedures Performed (if any)
   [proceduresPerformed array as bullet list; if empty, write "None"]

5. Medications at Discharge
   [For each medication: name, dosage, frequency, timing, duration, notes]

6. Follow-Up Instructions
   [followUpInstructions field content; if empty, write "None provided"]

7. Red Flag Warnings
   [Must always be present. If none provided, write:]
   "No specific red flag warnings were documented. If you experience worsening symptoms, fever, difficulty breathing, or any concerning change, return to the hospital immediately."

8. Discharged By
   [dischargedBy] (MDCN: [clinicianLicenseNo] if provided; otherwise write "Licence number not recorded")

## OUTPUT MODE 2: PATIENT-FRIENDLY INSTRUCTIONS

Generate plain language instructions the patient can understand (6th grade reading level). Use these exact sections:

YOUR DISCHARGE INSTRUCTIONS

What brought you to the hospital?
[Rewrite diagnosis in plain language. Example: "You have high blood pressure and diabetes."]

What we did for you
[Rewrite treatmentGiven in plain language]

Medicines to take at home
[Numbered list. For each medication:]
[number]. [name] — [dosage], [frequency], [timing], for [duration]. [notes as separate sentence if present]

When to come back to the hospital
[Rewrite followUpInstructions; if empty, write "Please schedule a follow-up appointment with your doctor as discussed."]

DANGER SIGNS — GO BACK TO THE HOSPITAL IMMEDIATELY IF:
[Rewrite red flag warnings as simple bullet points]

Signed by: [dischargedBy]
Date: [current date]

## CRITICAL GUARDRAILS
- Never invent clinical information not in the input
- Never generate diagnoses not provided
- Never prescribe new medications or alter doses
- Never remove the Red Flag Warnings section
- Never use clinical jargon in Mode 2
- Never include generation metadata in the output

Generate both outputs in a single response. Start with "DISCHARGE SUMMARY" and end with the "Signed by" line.`;
```

### Translation System Prompt

```ts
const SYSTEM_PROMPT_TRANSLATION = `You are a medical translator for Nigerian hospitals. Translate the following patient discharge instructions from English to the target language.

SUPPORTED LANGUAGES:
- ha: Hausa
- yo: Yoruba
- ig: Igbo

RULES:
- Preserve all section headings exactly as they appear
- Do not translate the "Signed by" or "Date" lines — leave them in English
- Keep medication names in English (generic names are acceptable)
- Use plain, everyday language appropriate for the target language
- Maintain the same structure (line breaks, numbered lists, bullet points)

OUTPUT FORMAT:
Return ONLY the translated text. No explanations, no metadata, no JSON wrapper.`;
```

---

## Complete cURL Example

### Generation Request

```bash
curl -X POST https://api.deepseek.com/v1/chat/completions \
  -H "Authorization: Bearer ${DEEPSEEK_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat",
    "messages": [
      {
        "role": "system",
        "content": "You are a clinical documentation assistant..."
      },
      {
        "role": "user",
        "content": "Patient Data: {\"patientName\": \"Mrs. Ngozi Okonkwo\", ...}"
      }
    ],
    "temperature": 0.3,
    "max_tokens": 4000,
    "stream": false
  }'
```

### Response Example

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1700000000,
  "model": "deepseek-chat",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "DISCHARGE SUMMARY\n\n1. Patient Identification\n..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 1500,
    "completion_tokens": 800,
    "total_tokens": 2300
  }
}
```

---

## Error Handling

| HTTP Status    | Error Code   | Handling Strategy                                                                |
| -------------- | ------------ | -------------------------------------------------------------------------------- |
| 200            | Success      | Parse and validate response                                                      |
| 400            | Bad Request  | Log request body (redacted), return `GENERATION_FAILED`                          |
| 401            | Unauthorized | Check `DEEPSEEK_API_KEY` env var; return `DEEPSEEK_AUTH_FAILED`                  |
| 429            | Rate Limited | Exponential backoff (1s, 2s, 4s) up to 3 retries; return `DEEPSEEK_RATE_LIMITED` |
| 500            | Server Error | Retry once; if persists, return `GENERATION_FAILED`                              |
| Timeout (>25s) | AbortError   | Return `GENERATION_TIMEOUT`                                                      |

### Rate Limits (DeepSeek default)

| Plan          | Requests per Minute | Tokens per Minute |
| ------------- | ------------------- | ----------------- |
| Free Tier     | 30                  | 60,000            |
| Pay-as-you-go | Higher              | Higher            |

**Recommendation:** Implement client-side rate limiting (10 requests per minute per user) to stay within DeepSeek limits.

---

## Timeout Configuration

```ts
const DEEPSEEK_TIMEOUT_MS = 25000; // 25 seconds

const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), DEEPSEEK_TIMEOUT_MS);

const response = await fetch(DEEPSEEK_API_URL, {
  // ... options
  signal: controller.signal,
});

clearTimeout(timeoutId);
```

**Why 25 seconds?** Vercel serverless functions timeout at 60 seconds (Hobby plan). Allow 25s for DeepSeek + 5s for processing = 30s buffer.

---

## Response Validation

Before returning to the client, validate that the response contains:

### For Generation:

- [ ] Contains `DISCHARGE SUMMARY` heading
- [ ] Contains `YOUR DISCHARGE INSTRUCTIONS` heading
- [ ] Contains `Red Flag Warnings` section
- [ ] Contains `Discharged By` section
- [ ] Contains `DANGER SIGNS` section
- [ ] Mode 2 ends with `Signed by:` and `Date:`

### For Translation:

- [ ] Response is not empty
- [ ] Response length > 20 characters
- [ ] Does not contain error patterns (e.g., "I cannot translate")

If validation fails, throw `GENERATION_FAILED` or `TRANSLATION_FAILED`.

---

## Confidence Scoring for Translation

DeepSeek does not provide native confidence scores. Use this heuristic:

```ts
function calculateConfidence(
  source: string,
  target: string,
): "high" | "low" | "failed" {
  if (!target || target.length === 0) return "failed";

  // If target is suspiciously short (<50% of source)
  if (target.length < source.length * 0.5) return "low";

  // If target suspiciously similar to source (no translation occurred)
  const similarity = calculateSimilarity(source, target);
  if (similarity > 0.8) return "low";

  return "high";
}

function calculateSimilarity(a: string, b: string): number {
  const shorter = a.length < b.length ? a : b;
  const longer = a.length < b.length ? b : a;
  if (longer.length === 0) return 1.0;
  const editDistance = levenshteinDistance(shorter, longer);
  return (longer.length - editDistance) / longer.length;
}
```

---

## Data Residency Considerations

**Important:** DeepSeek servers are located in China. Nigerian patient data may be transferred to China when using the API.

### Mitigation for v1.0:

1. Obtain explicit patient consent for cross-border data transfer
2. Document in audit log that DeepSeek API was used
3. Pilot with de-identified data only
4. For v1.1/v2.0, migrate to:
   - Local LLM deployment (Nigeria-based hosting)
   - African cloud provider (AWS Cape Town with data residency add-on)
   - Alternative LLM with Nigeria presence

### Consent Language for Patients:

> "Your discharge summary will be processed by an artificial intelligence service that may transfer data outside Nigeria. By accepting this document, you consent to this transfer."

---

## Health Check Endpoint

```ts
// app/api/ai-health/route.ts
export async function GET() {
  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [{ role: "user", content: 'Say "OK"' }],
        max_tokens: 5,
      }),
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      return NextResponse.json({ status: "healthy" });
    }
    return NextResponse.json(
      { status: "unhealthy", error: await response.text() },
      { status: 500 },
    );
  } catch (error) {
    return NextResponse.json(
      { status: "unhealthy", error: error.message },
      { status: 500 },
    );
  }
}
```

---

## Cost Estimation

| Operation                                         | Average Input Tokens | Average Output Tokens | Cost per Operation |
| ------------------------------------------------- | -------------------- | --------------------- | ------------------ |
| Discharge Generation                              | 1,200                | 2,000                 | $0.00073           |
| Translation (per language)                        | 800                  | 600                   | $0.00020           |
| **Total per discharge (English + 1 translation)** | 2,000                | 2,600                 | **$0.00093**       |

**5 million free tokens** ≈ 1,000 discharges (English only) or 500 discharges (with translations)

---

## Troubleshooting

| Issue                      | Likely Cause                        | Solution                                                          |
| -------------------------- | ----------------------------------- | ----------------------------------------------------------------- |
| `401 Unauthorized`         | Invalid or expired API key          | Regenerate key in DeepSeek console                                |
| `429 Rate Limited`         | Too many requests                   | Implement exponential backoff; reduce concurrent users            |
| Timeout (>25s)             | DeepSeek congestion or large prompt | Reduce `max_tokens`; simplify prompt                              |
| Empty response             | DeepSeek refused to respond         | Check content safety filters; reduce temperature                  |
| Missing sections in output | Model didn't follow prompt          | Increase `temperature` to 0.5; retry                              |
| Translation not accurate   | Model not fluent in target language | Use `deepseek-reasoner`; consider human review for low confidence |

---

## Constraints for this file

- **Never expose `DEEPSEEK_API_KEY` to the browser** — use only in server API routes
- **Never skip timeout handling** — 25s max, otherwise abort
- **Never assume response format** — validate all required sections before using
- **Never skip error mapping** — translate DeepSeek errors to CareFlow error codes
- **Never log full API requests/responses with PHI** — redact patient names and hospital numbers
- **Never hardcode API URLs** — use environment variables
- **Never use streaming (stream: true)** for v1.0 — simpler without it
- **Never ignore data residency implications** — document and obtain consent
