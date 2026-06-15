"use client";

import { useState, useCallback } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    question: "Is Lafiyanku a replacement for clinical judgement?",
    answer: "No. Lafiyanku is a documentation drafting tool. It generates discharge summaries and patient instructions from your clinical input. All output is a draft until reviewed and finalised by a licensed Doctor. The AI never makes clinical decisions, prescribes medications, or alters treatment plans.",
  },
  {
    question: "What languages are supported?",
    answer: "Patient instructions can be translated into English (default), Hausa, Yoruba, and Igbo. Clinical summaries are always in English. Translations include confidence scoring — low-confidence translations are flagged so you can review them before finalising.",
  },
  {
    question: "Is my patient data secure?",
    answer: "Yes. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Data is stored in Supabase with Row Level Security enforcing multi-tenant isolation — no cross-hospital access. We are fully NDPR 2019 compliant with immutable audit logs retained for 7 years.",
  },
  {
    question: "Does it work offline?",
    answer: "The input form works offline on 3G or lower connections. Form data is cached locally using Offline First design and synced to the server when connectivity is restored. AI generation requires an internet connection.",
  },
  {
    question: "How much does it cost?",
    answer: "Lafiyanku offers a 30-day free pilot with no credit card required. After the pilot, pricing is based on the number of clinicians at your facility. Contact us for a custom quote.",
  },
  {
    question: "How do I get started?",
    answer: "Click 'Start Free Pilot' on this page, fill in your facility details, and we will set up your account within 24 hours. You will receive login credentials via WhatsApp and can start generating discharge summaries immediately.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = useCallback((idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  }, []);

  return (
    <section id="faq" aria-labelledby="faq-heading" className="bg-pure-white py-20 lg:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 id="faq-heading" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-deep-navy">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map(({ question, answer }, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-xl border transition-colors ${
                  isOpen ? "border-clinical-teal/30 bg-clinical-teal/5" : "border-slate-200 bg-white"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left touch-target-min"
                >
                  <span className="text-sm sm:text-base font-semibold text-deep-navy">{question}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-cool-grey transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-clinical-teal" : ""
                    }`}
                  />
                </button>
                <div
                  id={`faq-answer-${idx}`}
                  role="region"
                  aria-labelledby={`faq-question-${idx}`}
                  hidden={!isOpen}
                >
                  <div className="px-5 pb-5 text-sm text-slate leading-relaxed">
                    {answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
