import { AlertTriangle, Languages, LayoutGrid, FileText, Pill, Globe } from "lucide-react";

const PROBLEMS = [
  {
    icon: AlertTriangle,
    title: "Rushed discharges",
    description: "Clinicians produce incomplete summaries under time pressure. Patients leave confused.",
  },
  {
    icon: Languages,
    title: "Language barriers",
    description: "Patients can\u2019t read clinical jargon. Instructions go unfollowed.",
  },
  {
    icon: LayoutGrid,
    title: "No standard format",
    description: "Every facility documents differently. No FMOH-aligned structure.",
  },
];

const SOLUTIONS = [
  {
    icon: FileText,
    title: "AI-drafted records",
    description: "Complete discharge summaries generated in seconds.",
  },
  {
    icon: Pill,
    title: "Plain-language instructions",
    description: "Patient-friendly explanations in the patient\u2019s own language.",
  },
  {
    icon: Globe,
    title: "FMOH-aligned output",
    description: "Standardised clinical format matching national guidelines.",
  },
];

export function ProblemSection() {
  return (
    <section id="problem" className="bg-cool-off-white py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-deep-navy">
            Why CareFlow Exists
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-deep-navy mb-6">The Problem</h3>
            {PROBLEMS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex gap-4 rounded-2xl bg-white p-5 border-l-4 border-warm-amber shadow-sm"
              >
                <div className="shrink-0 mt-0.5">
                  <Icon className="h-5 w-5 text-warm-amber" />
                </div>
                <div>
                  <h4 className="font-bold text-slate">{title}</h4>
                  <p className="text-sm text-cool-grey mt-1 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-deep-navy mb-6">The Solution</h3>
            {SOLUTIONS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex gap-4 rounded-2xl bg-white p-5 border-l-4 border-clinical-teal shadow-sm"
              >
                <div className="shrink-0 mt-0.5">
                  <Icon className="h-5 w-5 text-clinical-teal" />
                </div>
                <div>
                  <h4 className="font-bold text-slate">{title}</h4>
                  <p className="text-sm text-cool-grey mt-1 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
