import { ClipboardCheck, Sparkles, CheckCircle2 } from "lucide-react";

const STEPS = [
  {
    number: 1,
    icon: ClipboardCheck,
    title: "Input",
    description: "Fill a structured form with the patient\u2019s clinical details.",
  },
  {
    number: 2,
    icon: Sparkles,
    title: "Generate",
    description: "CareFlow drafts the clinical summary and patient instructions.",
  },
  {
    number: 3,
    icon: CheckCircle2,
    title: "Finalise",
    description: "Review, edit if needed, and finalise. Print or share via WhatsApp.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-pure-white py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-deep-navy">
            How It Works
          </h2>
          <p className="mt-3 text-lg text-cool-grey">Three steps. Under 30 seconds.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {STEPS.map(({ number, icon: Icon, title, description }, idx) => (
            <div key={number} className="relative flex flex-col items-center text-center">
              {idx < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-6 left-[calc(50%+2rem)] w-[calc(100%-4rem)] border-t-2 border-dashed border-slate-200" />
              )}

              <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-clinical-teal text-white text-lg font-bold mb-4 shadow-md shadow-clinical-teal/20">
                {number}
              </div>

              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-clinical-teal/10 mb-3">
                <Icon className="h-5 w-5 text-clinical-teal" />
              </div>

              <h3 className="text-lg font-bold text-deep-navy mb-2">{title}</h3>
              <p className="text-sm text-cool-grey leading-relaxed max-w-xs">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
