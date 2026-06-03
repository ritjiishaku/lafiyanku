"use client";

import { ArrowRight, Shield, Activity, Users } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-deep-navy h-dvh flex items-center text-white">
      {/* Background layers */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(11,110,110,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(11,110,110,0.08),transparent_50%)]" />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 relative z-10 py-8 lg:py-16">
        {/* Logo */}
        <div className="mb-6 lg:mb-0">
          <Link href="/" className="text-lg font-bold tracking-tight text-white sm:text-2xl hover:text-clinical-teal transition-colors">
            CareFlow
          </Link>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
          {/* Left — Text */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left space-y-5 lg:space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-clinical-teal/30 bg-clinical-teal/10 px-3 py-1 sm:px-4 sm:py-1.5 text-[10px] sm:text-xs font-semibold tracking-wide text-clinical-teal">
              <Shield className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              NDPR 2019 COMPLIANT
            </div>

            <h1 className="text-[clamp(1.75rem,6vw,4rem)] font-extrabold tracking-tight leading-[1.1] text-white max-w-xl">
              Your patients leave with documents they{' '}
              <span className="text-clinical-teal">cannot read.</span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-slate-300 leading-relaxed max-w-lg">
              CareFlow fixes that. AI-powered discharge documentation in Hausa, Yoruba, and Igbo — built for Nigerian hospitals and clinics.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto pt-1">
              <a
                href="/contact"
                className="group inline-flex items-center justify-center gap-2 rounded-lg border border-transparent bg-clinical-teal text-white hover:bg-clinical-teal/90 text-base sm:text-lg font-bold px-8 py-4 sm:px-10 sm:py-5 shadow-xl shadow-clinical-teal/25 hover:shadow-[0_0_30px_rgba(11,110,110,0.35)] transition-all duration-200 whitespace-nowrap text-center w-full sm:w-auto hover:-translate-y-0.5 active:translate-y-0"
              >
                Request a Demo
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
              <Link
                href="/auth?view=signup"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-600/50 bg-slate-800/50 text-white hover:bg-slate-700/60 text-base sm:text-lg font-semibold px-8 py-4 sm:px-10 sm:py-5 shadow-lg shadow-black/20 transition-all duration-200 whitespace-nowrap text-center w-full sm:w-auto hover:-translate-y-0.5 active:translate-y-0"
              >
                Sign Up
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
              {[
                { icon: Shield, label: "NDPR 2019 Compliant" },
                { icon: Activity, label: "FMOH Aligned" },
                { icon: Users, label: "30-Day Free Pilot" },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-700/80 bg-slate-800/40 px-2.5 py-1 sm:px-3.5 sm:py-1.5 text-[10px] sm:text-xs font-medium text-slate-300"
                >
                  <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-clinical-teal" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Right — Mockup (hidden on mobile) */}
          <div className="hidden lg:block lg:col-span-7" aria-hidden="true">
            <div className="relative rounded-2xl bg-slate-950/60 p-5 border border-slate-800/80 shadow-2xl shadow-black/30 backdrop-blur-sm">
              {/* Window chrome */}
              <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3.5 mb-4">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-[10px] text-slate-500 font-mono tracking-tight">careflow-dual-engine.log</span>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-clinical-teal/60 animate-pulse" />
                  <span className="text-[10px] text-clinical-teal/60 font-mono">AI READY</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mode 1 */}
                <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 text-[10px] leading-relaxed font-mono text-slate-300">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-2.5">
                    <div className="h-2 w-2 rounded-full bg-clinical-teal/60" />
                    <span className="font-bold uppercase tracking-wider text-[11px] text-clinical-teal">Clinical Summary</span>
                  </div>
                  <p className="text-slate-500 mb-2 text-[9px] uppercase tracking-wider"># FOR HOSPITAL RECORDS</p>
                  <p className="mb-1"><span className="text-slate-500">Patient:</span> Emeka Obi, 45y M</p>
                  <p className="mb-1"><span className="text-slate-500">Diagnosis:</span> Severe Malaria, Type 2 DM</p>
                  <p className="mb-1"><span className="text-slate-500">Medications:</span></p>
                  <div className="border border-slate-800 rounded bg-slate-950/80 p-2 mb-2 space-y-0.5">
                    <p className="text-slate-400">- Artemether/Lumefantrine 80/480mg PO BID x 3d</p>
                    <p className="text-slate-400">- Metformin 500mg PO BID with meals</p>
                  </div>
                  <p className="text-red-400/90 font-bold text-[9px] uppercase tracking-wider">⚠ Red Flags: High fever, confusion, decreased urine output.</p>
                </div>

                {/* Mode 2 */}
                <div className="rounded-lg border border-clinical-teal/20 bg-slate-900/80 p-4 text-[11px] leading-relaxed text-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-amber-500/60" />
                      <span className="font-bold uppercase tracking-wider text-[11px] text-amber-500">Patient Info</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/10 text-amber-500/90 rounded border border-amber-500/20 font-semibold">YORUBA</span>
                  </div>
                  <p className="font-semibold text-clinical-teal mb-0.5">Ohun ti o ṣẹlẹ:</p>
                  <p className="text-slate-400 mb-2">Ibà lọ́wọ́ọ́ kòkòrò ibà àti àtọ̀gbẹ (Type 2 Diabetes).</p>
                  <p className="font-semibold text-clinical-teal mb-0.5">Awọn oogun rẹ:</p>
                  <div className="border border-slate-800 rounded bg-slate-950/80 p-2 mb-2 text-[10px] space-y-1">
                    <p className="text-slate-300"><span className="font-bold text-amber-500/90">Artemether/Lumefantrine:</span> Mu ni igba meji lojoojumọ fún ọjọ mẹta.</p>
                    <p className="text-slate-300"><span className="font-bold text-amber-500/90">Metformin:</span> Mu ni igba meji lojoojumọ pẹlu ounjẹ.</p>
                  </div>
                  <p className="text-red-400/80 text-[9px] font-semibold">Tẹle itọnisọna dokita ti iba ba ga tabi ti ito ba dinku.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
