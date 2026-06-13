import { FileText, Languages, Smartphone, ShieldCheck } from "lucide-react";

const FEATURES = [
  {
    icon: FileText,
    title: "Dual-Mode Output",
    description: "Hospital-grade clinical records and patient-friendly instructions, generated at the same time.",
  },
  {
    icon: Languages,
    title: "Instant Translation",
    description: "Hausa, Yoruba, and Igbo translations with confidence scoring. Low-confidence translations are flagged for review.",
  },
  {
    icon: Smartphone,
    title: "Built for Nigeria",
    description: "Offline-first form caching. Mobile-optimised. Works on 3G and Android 8+.",
  },
  {
    icon: ShieldCheck,
    title: "100% NDPR Compliant",
    description: "Immutable audit logs. Role-based access. AES-256 encryption. Data stays in Nigeria.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-cool-off-white py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-deep-navy">
            Why CareFlow
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-clinical-teal/10 mb-4">
                <Icon className="h-5 w-5 text-clinical-teal" />
              </div>
              <h3 className="text-lg font-bold text-deep-navy mb-2">{title}</h3>
              <p className="text-sm text-cool-grey leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
