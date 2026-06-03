"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: "Is CareFlow secure?",
      answer: "Yes. CareFlow is built with strict privacy guardrails. We enforce TLS 1.3 for data in transit and AES-256 for data at rest. We maintain full NDPR 2019 compliance and enforce an immutable audit log trail on all discharge records.",
    },
    {
      question: "Does it work with our EMR?",
      answer: "CareFlow runs as a standalone app today. We are building the foundations for FHIR EMR integration (scoping for OpenMRS, Meditech, and other popular systems) as part of our upcoming v1.1 release.",
    },
    {
      question: "What if the AI makes a mistake?",
      answer: "CareFlow is designed as a drafting assistant. Every generated summary and patient instruction starts as a draft. A licensed Doctor must review, edit, and finalise the record before it can be exported, shared, or printed.",
    },
    {
      question: "Can our nurses use it?",
      answer: "Yes. Registered nurses can enter patient inputs, trigger the AI generation engine, and edit drafts. However, they cannot finalise records — the final sign-off is restricted strictly to the Doctor role.",
    },
    {
      question: "Which languages does it support?",
      answer: "We support English, Hausa, Yoruba, and Igbo. The AI engine automatically translates the patient-friendly instructions (Mode 2) on demand. If translation confidence is low, the system defaults to English with a warning flag.",
    },
    {
      question: "How long does the pilot take?",
      answer: "Our standard hospital pilot runs for 30 days. Our team manages training, onboarding, and setup for all your clinical staff.",
    },
  ];

  return (
    <section id="faq" className="bg-white py-20 lg:py-28 scroll-mt-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-deep-navy sm:text-4xl">
            Common Questions
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Learn more about how CareFlow handles security, integrations, and accuracy.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="border-b border-slate-200 pb-4"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between text-left py-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-clinical-teal rounded-md"
                >
                  <span className="text-lg font-semibold text-deep-navy hover:text-clinical-teal transition-colors duration-200">
                    {faq.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-slate-500 shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-500 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="mt-2 text-slate-600 leading-relaxed text-sm pr-6 animate-in fade-in slide-in-from-top-1 duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
