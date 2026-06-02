````md
# File: .agents/skills/ai-provider.ts.md

# Version: 1.0

# Last updated: 2026-06-02

# PRD reference: CFW-PRD-001 v1.0

# Purpose: The AI provider abstraction layer specification — TypeScript interfaces, function signatures, DeepSeek implementation, prompt templates, timeout handling, and error mapping.

## Overview

The AI provider abstraction layer isolates all DeepSeek API calls behind a clean interface. This allows swapping DeepSeek for another LLM provider by changing only one file. All other parts of the application import from `@/services/ai-provider` and never call DeepSeek directly.

**File location:** `src/services/ai-provider.ts`

---

## TypeScript Interfaces

### GenerateDischargeInput

```ts
export interface GenerateDischargeInput {
  // Patient identification
  patientName: string;
  hospitalNumber: string;
  age: number;
  gender: "Male" | "Female" | "Other";

  // Clinical data
  diagnosis: string;
  treatmentGiven: string;
  proceduresPerformed: string[];
  medications: Medication[];
  followUpInstructions?: string;
  additionalNotes?: string;

  // Metadata
  dischargedBy: string;
  clinicianLicenseNo?: string;
}
```
````

### Medication (sub-interface)

```ts
export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  timing?: string;
  duration?: string;
  notes?: string;
}
```

### GenerateDischargeOutput

```ts
export interface GenerateDischargeOutput {
  clinicalSummary: string; // Mode 1 — professional discharge summary
  patientFriendlyOutput: string; // Mode 2 — plain language instructions
  modelVersion: string; // e.g., "deepseek-chat"
  generationTimeMs: number; // Total time taken
  promptTokens?: number; // Optional: token usage
  completionTokens?: number; // Optional: token usage
}
```

### TranslateTextInput

```ts
export interface TranslateTextInput {
  sourceText: string; // English Mode 2 output
  targetLanguage: "ha" | "yo" | "ig";
}
```

### TranslateTextOutput

```ts
export interface TranslateTextOutput {
  translatedText: string; // Translated output
  confidence: "high" | "low" | "failed";
  modelVersion: string; // e.g., "deepseek-chat"
  translationTimeMs: number; // Total time taken
}
```

---

## Exported Function Signatures

```ts
/**
 * Generate clinical discharge summary (Mode 1) and patient-friendly instructions (Mode 2)
 * from structured patient input.
 *
 * @param input - Structured patient data
 * @returns Generated outputs with metadata
 * @throws {Error} - Throws with error code mapped from DeepSeek API
 */
export async function generateDischarge(
  input: GenerateDischargeInput,
): Promise<GenerateDischargeOutput>;

/**
 * Translate patient-friendly instructions from English to Hausa, Yoruba, or Igbo.
 *
 * @param input - Source text and target language
 * @returns Translated text with confidence score
 * @throws {Error} - Throws with error code mapped from DeepSeek API
 */
export async function translateText(
  input: TranslateTextInput,
): Promise<TranslateTextOutput>;
```

---

## DeepSeek Implementation

### Constants

```ts
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL ||
  "https://api.deepseek.com/v1/chat/completions";
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";
const DEEPSEEK_MAX_TOKENS = parseInt(
  process.env.DEEPSEEK_MAX_TOKENS || "4000",
  10,
);
const DEEPSEEK_TEMPERATURE = parseFloat(
  process.env.DEEPSEEK_TEMPERATURE || "0.3",
);
const DEEPSEEK_TIMEOUT_MS = parseInt(
  process.env.DEEPSEEK_TIMEOUT_MS || "25000",
  10,
);

// Validate required environment variables
if (!DEEPSEEK_API_KEY) {
  throw new Error("DEEPSEEK_API_KEY environment variable is not set");
}
```

---

## System Prompts (Full Text)

### System Prompt for Discharge Generation (Mode 1 + Mode 2)

```ts
const SYSTEM_PROMPT_DISCHARGE = `You are a clinical documentation assistant for Nigerian hospitals. Your task is to generate two outputs from the structured patient data provided.

## OUTPUT MODE 1: CLINICAL DISCHARGE SUMMARY

Generate a professional discharge summary for hospital records with these exact sections and section headings:

──────────────────────────────────────────
CLINICAL DISCHARGE SUMMARY
──────────────────────────────────────────

Facility
Name:       [facilityName]
FMOH Code:  [facilityCode if available]
Ward:       [wardName]

Patient information
Name:              [patientName]
Age:               [age] years
Gender:            [gender]
Hospital No.:      [hospitalNumber]
NHIS No.:          [nhisNumber if available]
Date of admission: [admissionDate]
Date of discharge: [dischargeDate]

Diagnosis
[diagnosis field content]

Treatment provided
[treatmentGiven field content]

Procedures performed
[List procedures, or state "None documented" if not applicable]

Medications
| Medication | Dosage | Frequency | Timing | Duration | Notes |
|------------|--------|-----------|--------|----------|-------|

Follow-up instructions
[followUpInstructions field content; if empty, write "None provided"]

Red flag warnings
[Must always be present. If none provided, write:]
"No specific red flag warnings were documented. If you experience worsening symptoms, fever, difficulty breathing, or any concerning change, return to the hospital immediately."

Discharged by
Name:              [dischargedBy]
MDCN Licence No.:  [clinicianLicenseNo if provided; otherwise write "Not recorded"]

──────────────────────────────────────────

## OUTPUT MODE 2: PATIENT-FRIENDLY INSTRUCTIONS

Generate plain language instructions the patient can understand (6th grade reading level). Use these exact sections and section headings:

──────────────────────────────────────────
PATIENT DISCHARGE INSTRUCTIONS
──────────────────────────────────────────

What happened
[Rewrite diagnosis in plain language. Example: "You have high blood pressure and diabetes."]

Treatment you received
[Rewrite treatmentGiven in plain language]

Your medications
[Numbered list. For each medication:]
[number]. [name] — [dosage], [frequency], [timing], for [duration]. [notes as separate sentence if present]

Important home care instructions
[Home care guidance]

When to return to the hospital
[Rewrite red flag warnings as simple bullet points]

Your follow-up appointment
[Rewrite followUpInstructions; if empty, write "Please schedule a follow-up appointment with your doctor as discussed."]

Signed by: [dischargedBy]
Date: [current date]

## CRITICAL GUARDRAILS
- Never invent clinical information not in the input
- Never generate diagnoses not provided
- Never prescribe new medications or alter doses
- Never remove the Red Flag Warnings section
- Never use clinical jargon in Mode 2
- Never include generation metadata in the output

Generate both outputs in a single response. Start with "CLINICAL DISCHARGE SUMMARY" and end with the "Signed by" line.`;
```

### System Prompt for Translation

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
Return ONLY the translated text. No explanations, no metadata, no JSON wrapper.

CONFIDENCE SCORING (internal only):
- high: You are confident the translation is accurate (≥90% semantic equivalence)
- low: You are uncertain about some parts

If you are uncertain about any medical term, leave it in English with a brief note in parentheses.`;
```

---

## Complete Implementation

### generateDischarge Function

```ts
export async function generateDischarge(
  input: GenerateDischargeInput,
): Promise<GenerateDischargeOutput> {
  const startTime = Date.now();

  // Build user message with all input data
  const userMessage = `Patient Data:
- Patient Name: ${input.patientName}
- Hospital Number: ${input.hospitalNumber}
- Age: ${input.age}
- Gender: ${input.gender}
- Diagnosis: ${input.diagnosis}
- Treatment Given: ${input.treatmentGiven}
- Procedures Performed: ${input.proceduresPerformed.join(", ") || "None"}
- Medications: ${JSON.stringify(input.medications, null, 2)}
- Follow-Up Instructions: ${input.followUpInstructions || "None provided"}
- Additional Notes: ${input.additionalNotes || "None"}
- Discharged By: ${input.dischargedBy}
- Clinician License No: ${input.clinicianLicenseNo || "Not recorded"}

Current date: ${new Date().toLocaleDateString("en-CA")}`;

  // Build ChatML messages array
  const messages = [
    { role: "system", content: SYSTEM_PROMPT_DISCHARGE },
    { role: "user", content: userMessage },
  ];

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEEPSEEK_TIMEOUT_MS);

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: messages,
        temperature: DEEPSEEK_TEMPERATURE,
        max_tokens: DEEPSEEK_MAX_TOKENS,
        stream: false,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 429) {
        throw new Error("DEEPSEEK_RATE_LIMITED");
      }
      if (response.status === 401) {
        throw new Error("DEEPSEEK_AUTH_FAILED");
      }
      throw new Error(
        `DEEPSEEK_API_ERROR: ${response.status} - ${JSON.stringify(errorData)}`,
      );
    }

    const data = await response.json();
    const fullOutput = data.choices[0]?.message?.content || "";

    if (!fullOutput) {
      throw new Error("DEEPSEEK_EMPTY_RESPONSE");
    }

    // Split output into clinical summary and patient-friendly instructions
    const mode2Marker = "PATIENT DISCHARGE INSTRUCTIONS";
    const mode2Index = fullOutput.indexOf(mode2Marker);

    if (mode2Index === -1) {
      throw new Error("DEEPSEEK_MISSING_MODE2");
    }

    const clinicalSummary = fullOutput.substring(0, mode2Index).trim();
    const patientFriendlyOutput = fullOutput.substring(mode2Index).trim();

    // Validate required sections exist
    if (!clinicalSummary.includes("Red flag warnings")) {
      throw new Error("DEEPSEEK_MISSING_RED_FLAGS");
    }
    if (!clinicalSummary.includes("Discharged by")) {
      throw new Error("DEEPSEEK_MISSING_DISCHARGED_BY");
    }
    if (!patientFriendlyOutput.includes("When to return to the hospital")) {
      throw new Error("DEEPSEEK_MISSING_DANGER_SIGNS");
    }

    const generationTimeMs = Date.now() - startTime;

    return {
      clinicalSummary,
      patientFriendlyOutput,
      modelVersion: DEEPSEEK_MODEL,
      generationTimeMs,
      promptTokens: data.usage?.prompt_tokens,
      completionTokens: data.usage?.completion_tokens,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      throw new Error("GENERATION_TIMEOUT");
    }

    throw error;
  }
}
```

### translateText Function

```ts
export async function translateText(
  input: TranslateTextInput,
): Promise<TranslateTextOutput> {
  const startTime = Date.now();

  const userMessage = `Translate the following text to ${input.targetLanguage.toUpperCase()}:

${input.sourceText}

Remember: Do NOT translate the "Signed by" or "Date" lines. Leave them in English.`;

  const messages = [
    { role: "system", content: SYSTEM_PROMPT_TRANSLATION },
    { role: "user", content: userMessage },
  ];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout for translation

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: messages,
        temperature: 0.2, // Lower temperature for translation
        max_tokens: 2000,
        stream: false,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`TRANSLATION_API_ERROR: ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.choices[0]?.message?.content || "";

    if (!translatedText) {
      throw new Error("TRANSLATION_EMPTY_RESPONSE");
    }

    // Simple confidence heuristic: if translated text is too similar to source or too short
    const similarity = calculateSimpleSimilarity(
      input.sourceText,
      translatedText,
    );
    let confidence: "high" | "low" | "failed" = "high";

    if (
      similarity > 0.8 ||
      translatedText.length < input.sourceText.length * 0.5
    ) {
      confidence = "low";
    }

    const translationTimeMs = Date.now() - startTime;

    return {
      translatedText,
      confidence,
      modelVersion: DEEPSEEK_MODEL,
      translationTimeMs,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      throw new Error("TRANSLATION_TIMEOUT");
    }

    throw new Error("TRANSLATION_FAILED");
  }
}

// Helper function for similarity (basic heuristic)
function calculateSimpleSimilarity(source: string, target: string): number {
  const sourceLength = source.length;
  const targetLength = target.length;
  const lengthRatio =
    Math.min(sourceLength, targetLength) / Math.max(sourceLength, targetLength);
  return lengthRatio;
}
```

---

## Error Mapping Table

| DeepSeek Error            | CareFlow Error Code     | HTTP Status |
| ------------------------- | ----------------------- | ----------- |
| Timeout (AbortError)      | `GENERATION_TIMEOUT`    | 500         |
| 429 Rate Limit            | `DEEPSEEK_RATE_LIMITED` | 500         |
| 401 Unauthorized          | `DEEPSEEK_AUTH_FAILED`  | 500         |
| Empty response            | `GENERATION_FAILED`     | 500         |
| Missing Mode 2 section    | `GENERATION_FAILED`     | 500         |
| Missing Red Flag Warnings | `GENERATION_FAILED`     | 500         |
| Network error             | `GENERATION_FAILED`     | 500         |
| Translation timeout       | `TRANSLATION_FAILED`    | 500         |
| Translation empty         | `TRANSLATION_FAILED`    | 500         |
| Any other error           | `INTERNAL_SERVER_ERROR` | 500         |

---

## Swapping the AI Provider

To replace DeepSeek with another provider (e.g., OpenAI, Anthropic, Google Gemini):

1. Create a new file `src/services/ai-provider-openai.ts`
2. Implement the same interfaces (`GenerateDischargeInput`, `GenerateDischargeOutput`, etc.)
3. Update the import in all API routes to point to the new provider
4. Update environment variables

**No other changes are required.** The abstraction layer ensures the rest of the application remains unchanged.

---

## Constraints for this file

- **Never expose the DeepSeek API key to the browser** — use server-side only
- **Never skip the timeout handler** — DeepSeek calls must timeout after 25 seconds
- **Never hardcode the system prompt in multiple places** — use constants
- **Never assume the AI response format** — always validate and throw if missing sections
- **Never skip validation of required sections** — Red Flag Warnings and Discharged By must be present
- **Never log the full API response with PHI** — redact patient names and hospital numbers
- **Never bypass the abstraction layer** — other files must import from `ai-provider.ts`, not call DeepSeek directly
- **Never change the interface without updating all implementations** — maintain backward compatibility
