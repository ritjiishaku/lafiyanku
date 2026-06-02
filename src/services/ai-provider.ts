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

function buildSystemPrompt(): string {
  return `You are CareFlow AI, a clinical discharge documentation assistant for Nigerian hospitals.
Generate two outputs from the structured patient input:
1. Mode 1 — Clinical Discharge Summary (professional, structured)
2. Mode 2 — Patient-Friendly Discharge Instructions (plain language)

Never invent clinical information. Never prescribe medications. Never alter doses.
Always include Red Flag Warnings in Mode 1.
Always include Discharged By in Mode 1.`;
}

export async function generateDischarge(
  patientInput: Record<string, unknown>,
): Promise<AIGenerationResult> {
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
            content: `Generate discharge documentation from this input:\n${JSON.stringify(patientInput, null, 2)}`,
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

    return parseGenerationOutput(content);
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
