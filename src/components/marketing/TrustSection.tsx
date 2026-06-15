import { Check } from "lucide-react";

const GUARDRAILS = [
  "Never invents clinical data",
  "Never prescribes medications",
  "Doctor has final sign-off",
  "Every action is audit-logged",
];

const BADGES = [
  "NDPR 2019 Compliant",
  "AES-256 Encryption",
  "FMOH Standards Aligned",
];

export function TrustSection() {
  return (
    <section id="trust" aria-labelledby="trust-heading" className="bg-pure-white py-20 lg:py-24">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 id="trust-heading" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-deep-navy mb-3">
          AI You Can Trust
        </h2>
        <p className="text-lg text-cool-grey mb-10">
          Lafiyanku assists clinicians. It never replaces clinical judgement.
        </p>

        <div className="space-y-4 mb-10">
          {GUARDRAILS.map((item) => (
            <div key={item} className="flex items-center justify-center gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-clinical-teal/10">
                <Check className="h-3.5 w-3.5 text-clinical-teal" />
              </div>
              <span className="text-slate font-medium">{item}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {BADGES.map((badge) => (
            <span
              key={badge}
              className="rounded-full bg-cool-off-white px-4 py-2 text-sm text-slate font-medium"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
