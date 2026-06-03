"use client";

import { Check } from "lucide-react";

export function PricingSection() {
  const tiers = [
    {
      name: "Clinic",
      price: "₦45,000",
      desc: "For small clinics and private practices.",
      features: [
        "Up to 5 clinician accounts",
        "30-day free pilot",
        "NDPR 2019 data compliance",
        "Standard Mode 1 & 2 outputs",
        "Hausa, Yoruba, Igbo translation",
        "Mobile-first responsive access",
        "Email support",
      ],
      cta: "Start Free Pilot",
      popular: false,
    },
    {
      name: "Hospital",
      price: "₦180,000",
      desc: "For medium hospitals and regional medical centers.",
      features: [
        "Up to 50 clinician accounts",
        "30-day free pilot",
        "NDPR 2019 data compliance",
        "Standard Mode 1 & 2 outputs",
        "Hausa, Yoruba, Igbo translation",
        "Mobile-first responsive access",
        "Priority email + chat support",
        "Custom facility header config",
      ],
      cta: "Start Free Pilot",
      popular: true,
    },
    {
      name: "System",
      price: "Custom",
      desc: "For large teaching hospitals and state healthcare networks.",
      features: [
        "Unlimited clinician accounts",
        "30-day free pilot",
        "NDPR 2019 data compliance",
        "Standard Mode 1 & 2 outputs",
        "Hausa, Yoruba, Igbo translation",
        "Mobile-first responsive access",
        "Dedicated account manager",
        "FHIR EMR integration foundation",
        "SLA and uptime guarantees",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="bg-white py-20 lg:py-28 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-deep-navy sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Choose the plan that fits your facility. All tiers include our standard 30-day free onboarding pilot.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, idx) => (
            <div
              key={idx}
              className={`relative flex flex-col rounded-2xl p-8 border ${
                tier.popular
                  ? "border-[#0B6E6E] shadow-xl bg-slate-50/30 md:scale-105 z-10"
                  : "border-slate-200 shadow-sm bg-white"
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-clinical-teal px-4 py-1 text-xs font-bold uppercase tracking-wider text-white">
                  MOST POPULAR
                </span>
              )}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-deep-navy">{tier.name}</h3>
                <p className="text-sm text-slate-500 mt-2">{tier.desc}</p>
                <div className="mt-4 flex items-baseline gap-1 text-deep-navy">
                  <span className="text-4xl font-extrabold tracking-tight">{tier.price}</span>
                  {tier.price !== "Custom" && <span className="text-slate-500 text-sm font-semibold">/month</span>}
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                {tier.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-3 text-sm text-slate-600">
                    <Check className="h-5 w-5 text-clinical-teal shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href={tier.price === "Custom" ? "/contact" : "/#demo-request"}
                className={`inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent text-sm font-medium whitespace-nowrap transition-all w-full py-6 font-semibold ${
                  tier.popular
                    ? "bg-clinical-teal hover:bg-clinical-teal/90 text-white"
                    : "bg-deep-navy hover:bg-deep-navy/90 text-white"
                }`}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-slate-400">
          Prices shown exclude 7.5% VAT. All plans billed monthly in Naira (₦). Pricing subject to change with 30-day notice.
        </p>
      </div>
    </section>
  );
}
