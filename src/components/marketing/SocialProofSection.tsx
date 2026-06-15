import { Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    quote: "Cut my discharge documentation time from 20 minutes to under 2 minutes. My patients finally understand their instructions.",
    name: "Dr. Adaeze Nwosu",
    role: "Registrar, Internal Medicine",
    facility: "Lagos University Teaching Hospital",
  },
  {
    quote: "The Hausa translation is a game-changer. For the first time, my patients can read and follow their discharge instructions at home.",
    name: "Nurse Ibrahim Bello",
    role: "Ward Nurse, Paediatrics",
    facility: "Aminu Kano Teaching Hospital",
  },
  {
    quote: "The audit log alone made this worth it for our compliance team. Every action is tracked, immutable, and ready for NDPR review.",
    name: "Funke Adeyemi",
    role: "Head of Medical Records",
    facility: "National Hospital Abuja",
  },
];

export function SocialProofSection() {
  return (
    <section id="social-proof" aria-labelledby="social-heading" className="bg-cool-off-white py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 id="social-heading" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-deep-navy">
            Trusted by Clinicians Across Nigeria
          </h2>
          <p className="mt-3 text-lg text-cool-grey">
            Hear from the doctors, nurses, and administrators using Lafiyanku.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
          {TESTIMONIALS.map(({ quote, name, role, facility }) => (
            <blockquote
              key={name}
              className="relative rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100"
            >
              <Quote className="absolute top-4 right-4 h-8 w-8 text-clinical-teal/10" />
              <p className="text-slate leading-relaxed mb-6 relative z-10">
                &ldquo;{quote}&rdquo;
              </p>
              <footer className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-clinical-teal/10 text-clinical-teal text-sm font-bold">
                  {name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <cite className="not-italic text-sm font-bold text-deep-navy">{name}</cite>
                  <p className="text-xs text-cool-grey">{role}</p>
                  <p className="text-xs text-cool-grey">{facility}</p>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
