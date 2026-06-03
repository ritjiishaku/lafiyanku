"use client";

import Link from "next/link";
import { Phone } from "lucide-react";
import { ContactForm } from "./ContactForm";

const WHATSAPP = "+2349064957884";
const WA_URL = `https://wa.me/${WHATSAPP.replace(/[^0-9]/g, "")}`;

export function ContactSection() {
  return (
    <section id="contact" className="flex flex-col items-center justify-center bg-gradient-to-br from-clinical-teal/5 via-cool-off-white to-cool-off-white px-3 sm:px-4 py-8 sm:py-12 min-h-dvh scroll-mt-20">
      <Link href="/" className="mb-4 text-xl font-bold tracking-tight text-deep-navy sm:text-2xl hover:text-clinical-teal transition-colors shrink-0">
        CareFlow
      </Link>
      <div className="w-full max-w-xl">
        <div className="bg-white rounded-lg shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          {/* Header with WhatsApp */}
          <div className="bg-gradient-to-r from-clinical-teal/5 to-deep-navy/5 px-4 sm:px-5 py-4 sm:py-5 text-center border-b border-slate-100">
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-clinical-teal text-white px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm font-bold hover:bg-clinical-teal/90 transition-colors shadow-lg shadow-clinical-teal/20 mb-2"
            >
              <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              {WHATSAPP}
            </a>
            <h2 className="text-lg sm:text-xl font-bold text-deep-navy">Request a Demo</h2>
            <p className="mt-0.5 text-xs text-cool-grey">We&apos;ll get back to you within 24 hours.</p>
          </div>

          {/* Form */}
          <div className="overflow-y-auto">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
