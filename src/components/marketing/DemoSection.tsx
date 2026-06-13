import { ContactForm } from "@/app/(marketing)/contact/ContactForm";
import { Phone } from "lucide-react";

const WHATSAPP = "+2349064957884";
const WA_URL = `https://wa.me/${WHATSAPP.replace(/[^0-9]/g, "")}`;

export function DemoSection() {
  return (
    <section id="demo" className="bg-gradient-to-br from-deep-navy to-clinical-teal py-20 lg:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.05),transparent_50%)]" />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Ready to Transform Your Hospital&apos;s Discharge Process?
          </h2>
          <p className="text-lg text-white/70">
            Start your 30-day free pilot. No credit card required.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 border border-white/10 overflow-hidden">
          <ContactForm />
        </div>

        <div className="mt-6 text-center">
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            <Phone className="h-3.5 w-3.5" />
            Or message us on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
