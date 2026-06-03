export interface AIGenerationResult {
  clinicalSummary: string;
  patientFriendlyOutput: string;
  missingFieldsLog: string[];
  flaggedIssues: string[];
}

export interface TranslationResult {
  translatedOutput: string | null;
  confidence: "high" | "low" | "failed";
  fallbackUsed: boolean;
}

function getPromptVersion(): string {
  return process.env.CFW_AI_PROMPT_VERSION ?? "v2.0";
}

function getModelVersion(): string {
  return process.env.CFW_AI_MODEL_VERSION ?? "deepseek-chat";
}

const REQUIRED_FIELDS = [
  "facilityName",
  "admissionDate",
  "dischargeDate",
  "patientName",
  "age",
  "gender",
  "hospitalNumber",
  "diagnosis",
  "treatmentGiven",
  "medications",
  "dischargedBy",
] as const;

function validateInput(input: Record<string, unknown>): { missingFieldsLog: string[]; flaggedIssues: string[] } {
  const missingFieldsLog: string[] = [];
  const flaggedIssues: string[] = [];

  for (const field of REQUIRED_FIELDS) {
    const value = input[field];
    if (value === undefined || value === null || value === "") {
      missingFieldsLog.push(`${field} was not provided. Please verify before finalising.`);
    }
  }

  if (input.followUpInstructions === undefined || input.followUpInstructions === null || input.followUpInstructions === "") {
    missingFieldsLog.push("No follow-up instructions provided. Recommend patient follows up with treating provider.");
  }

  const medications = input.medications as Array<Record<string, unknown>> | undefined;
  if (medications) {
    for (const med of medications) {
      if (!med.dosage || !med.frequency) {
        flaggedIssues.push(
          `Dosage/frequency not provided for ${med.name ?? "unknown medication"} — do not issue without verification.`,
        );
      }
    }
  }

  if (input.admissionDate && input.dischargeDate) {
    const admission = new Date(input.admissionDate as string);
    const discharge = new Date(input.dischargeDate as string);
    if (discharge < admission) {
      flaggedIssues.push("Inconsistency detected in dates. Discharge date is before admission date. Please review before finalising.");
    }
  }

  return { missingFieldsLog, flaggedIssues };
}

function buildSystemPrompt(): string {
  return `You are CareFlow, a senior Healthcare Documentation Assistant for Nigerian hospitals.

You convert structured clinical input (filled in by a doctor or nurse via a form) into two outputs.

OUTPUT MODE 1 — CLINICAL DISCHARGE SUMMARY
Audience: Doctors, nurses, hospital records
Language: Clinical terminology
Tone: Professional, structured, concise

Required sections in this exact order:
1. Facility (name, FMOH code, ward)
2. Patient Information (name, age, gender, hospital number, NHIS number, admission date, discharge date)
3. Diagnosis
4. Treatment Provided
5. Procedures Performed
6. Medications (table: name, dosage, frequency, timing, duration, notes)
7. Follow-Up Instructions
8. Red Flag Warnings — ALWAYS include
9. Discharged By (name, MDCN licence number) — ALWAYS include

OUTPUT MODE 2 — PATIENT-FRIENDLY DISCHARGE INSTRUCTIONS
Audience: Patient, caregiver
Language: Plain English — no medical jargon
Tone: Simple, calm, reassuring

Required sections in this exact order:
1. What Happened
2. Treatment You Received
3. Your Medications
4. Important Home Care Instructions
5. When to Return to the Hospital
6. Your Follow-Up Appointment

ABSOLUTE GUARDRAILS — Never violate:
1. Never invent clinical information not present in the input
2. Never generate diagnoses not provided by the clinician
3. Never prescribe new medications or alter existing doses
4. Never provide emergency medical advice
5. Never assume missing patient data — flag it with a clear message
6. Always include Red Flag Warnings in Mode 1
7. Always include Discharged By in Mode 1
8. Always use admissionDate and dischargeDate as separate fields
9. All outputs are drafts — never indicate they are final
10. Never display generation metadata in patient-facing output

Separate Mode 1 and Mode 2 with: ──────────────────────────────────────────

EXACT OUTPUT TEMPLATES:

Mode 1:
──────────────────────────────────────────
CLINICAL DISCHARGE SUMMARY
──────────────────────────────────────────

Facility
Name:       [value]
FMOH Code:  [value]
Ward:       [value]

Patient information
Name:              [value]
Age:               [value]
Gender:            [value]
Hospital No.:      [value]
NHIS No.:          [value]
Date of admission: [value]
Date of discharge: [value]

Diagnosis
[value]

Treatment provided
[value]

Procedures performed
[value]

Medications
| Medication | Dosage | Frequency | Timing | Duration | Notes |
|------------|--------|-----------|--------|----------|-------|

Follow-up instructions
[value]

Red flag warnings
[value]

Discharged by
Name:              [value]
MDCN Licence No.:  [value]
──────────────────────────────────────────

Mode 2:
──────────────────────────────────────────
PATIENT DISCHARGE INSTRUCTIONS
──────────────────────────────────────────

What happened
[value]

Treatment you received
[value]

Your medications
[value]

Important home care instructions
[value]

When to return to the hospital
[value]

Your follow-up appointment
[value]
──────────────────────────────────────────`;
}

function validateOutput(content: string): string[] {
  const issues: string[] = [];

  const mode1 = content.match(/CLINICAL DISCHARGE SUMMARY[\s\S]*?(?=──────────────────────────────────────────\s*\n\s*PATIENT DISCHARGE INSTRUCTIONS)/);
  const mode2 = content.match(/PATIENT DISCHARGE INSTRUCTIONS[\s\S]*/);

  if (mode1) {
    if (!mode1[0].toLowerCase().includes("red flag")) {
      issues.push("Mode 1 is missing Red Flag Warnings section.");
    }
    if (!mode1[0].toLowerCase().includes("discharged by")) {
      issues.push("Mode 1 is missing Discharged By section.");
    }
  }

  if (mode2) {
    if (!mode2[0].toLowerCase().includes("when to return")) {
      issues.push("Mode 2 is missing When to Return to the Hospital section.");
    }
    if (!mode2[0].toLowerCase().includes("follow-up")) {
      issues.push("Mode 2 is missing Your Follow-Up Appointment section.");
    }
  }

  return issues;
}

export async function generateDischarge(
  patientInput: Record<string, unknown>,
): Promise<AIGenerationResult> {
  const { missingFieldsLog, flaggedIssues } = validateInput(patientInput);

  const apiKey = process.env.DEEPSEEK_API_KEY;
  const apiUrl =
    process.env.DEEPSEEK_API_URL ??
    "https://api.deepseek.com/v1/chat/completions";
  const model = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";
  const maxTokens = parseInt(process.env.DEEPSEEK_MAX_TOKENS ?? "4000", 10);
  const temperature = parseFloat(
    process.env.DEEPSEEK_TEMPERATURE ?? "0.3",
  );
  const timeoutMs = parseInt(
    process.env.DEEPSEEK_TIMEOUT_MS ?? "25000",
    10,
  );

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: buildSystemPrompt() },
          {
            role: "user",
            content: `Generate discharge documentation from this patient input:\n${JSON.stringify(patientInput, null, 2)}`,
          },
        ],
        max_tokens: maxTokens,
        temperature,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 429) {
      throw new Error("DEEPSEEK_RATE_LIMITED");
    }
    if (response.status === 401) {
      throw new Error("DEEPSEEK_AUTH_FAILED");
    }
    if (!response.ok) {
      throw new Error("GENERATION_FAILED");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";

    const outputIssues = validateOutput(content);
    const result = parseGenerationOutput(content);

    return {
      ...result,
      missingFieldsLog: [...missingFieldsLog, ...result.missingFieldsLog],
      flaggedIssues: [...flaggedIssues, ...outputIssues, ...result.flaggedIssues],
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("GENERATION_TIMEOUT");
    }
    throw err;
  }
}

export async function translateText(
  sourceText: string,
  targetLanguage: string,
): Promise<TranslationResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const apiUrl =
    process.env.DEEPSEEK_API_URL ??
    "https://api.deepseek.com/v1/chat/completions";
  const model = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: `You are a medical translator. Translate the following discharge instructions into ${targetLanguage === "ha" ? "Hausa" : targetLanguage === "yo" ? "Yoruba" : "Igbo"}. Preserve the structure. Do not alter medical content. If you are not confident, respond with "LOW_CONFIDENCE".`,
          },
          {
            role: "user",
            content: sourceText,
          },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error("TRANSLATION_FAILED");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";

    if (content.includes("LOW_CONFIDENCE")) {
      return {
        translatedOutput: null,
        confidence: "low",
        fallbackUsed: true,
      };
    }

    return {
      translatedOutput: content,
      confidence: "high",
      fallbackUsed: false,
    };
  } catch {
    return {
      translatedOutput: null,
      confidence: "failed",
      fallbackUsed: true,
    };
  }
}

function parseGenerationOutput(
  content: string,
): AIGenerationResult {
  const result: AIGenerationResult = {
    clinicalSummary: "",
    patientFriendlyOutput: "",
    missingFieldsLog: [],
    flaggedIssues: [],
  };

  const mode1Match = content.match(
    /CLINICAL DISCHARGE SUMMARY[\s\S]*?(?=──────────────────────────────────────────\s*\n\s*PATIENT DISCHARGE INSTRUCTIONS|$)/,
  );
  const mode2Match = content.match(
    /PATIENT DISCHARGE INSTRUCTIONS[\s\S]*/,
  );

  if (mode1Match) {
    result.clinicalSummary = mode1Match[0].trim();
  }
  if (mode2Match) {
    result.patientFriendlyOutput = mode2Match[0].trim();
  }

  return result;
}

export { getPromptVersion, getModelVersion };
