import { NextResponse } from "next/server";
import { createServiceClient } from "@/services/supabase-server";
import { generateDischarge, getPromptVersion, getModelVersion } from "@/services/ai-provider";

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const now = Date.now();
  const lastRequest = rateLimitMap.get(ip);

  if (lastRequest && now - lastRequest < RATE_LIMIT_WINDOW) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in an hour." },
      { status: 429 }
    );
  }

  try {
    const patientInput = await req.json();

    const required = ["facilityName", "admissionDate", "dischargeDate", "patientName", "age", "gender", "hospitalNumber", "diagnosis", "treatmentGiven", "medications", "dischargedBy"];
    for (const field of required) {
      if (patientInput[field] === undefined || patientInput[field] === null || patientInput[field] === "") {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Trigger AI generation
    const result = await generateDischarge(patientInput);

    // Save to database
    const supabase = createServiceClient();
    const patientId = crypto.randomUUID();
    const recordId = crypto.randomUUID();

    await supabase.from("patient_inputs").insert({
      patient_id: patientId,
      facility_name: patientInput.facilityName,
      admission_date: patientInput.admissionDate,
      discharge_date: patientInput.dischargeDate,
      patient_name: patientInput.patientName,
      age: patientInput.age,
      gender: patientInput.gender,
      hospital_number: patientInput.hospitalNumber,
      diagnosis: patientInput.diagnosis,
      treatment_given: patientInput.treatmentGiven,
      medications: JSON.stringify(patientInput.medications ?? []),
      discharged_by: patientInput.dischargedBy,
    }).throwOnError();

    await supabase.from("discharge_records").insert({
      record_id: recordId,
      patient_input_id: patientId,
      generated_at: new Date().toISOString(),
      generated_by_user_id: "demo-user",
      prompt_version: getPromptVersion(),
      model_version: getModelVersion(),
      clinical_summary: result.clinicalSummary,
      patient_friendly_output: result.patientFriendlyOutput,
      status: "draft",
    }).throwOnError();

    // Save timestamp for rate limit
    rateLimitMap.set(ip, now);

    return NextResponse.json({
      recordId,
      clinicalSummary: result.clinicalSummary,
      patientFriendlyOutput: result.patientFriendlyOutput,
    });
  } catch (err: unknown) {
    console.error("Demo generation error:", err);
    return NextResponse.json(
      { error: "Generation failed" },
      { status: 500 }
    );
  }
}
