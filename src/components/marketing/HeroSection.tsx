import Link from "next/link";
import { ArrowRight, Shield, Activity, CheckCircle } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative bg-deep-navy min-h-[calc(100dvh-4rem)] flex flex-col text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(11,110,110,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(11,110,110,0.08),transparent_50%)]" />

      <div className="flex-1 flex items-center min-h-0">
        <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 relative z-10 py-12 lg:py-16">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 xl:gap-16 items-center">

            <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left space-y-5 lg:space-y-6">
              <h1 className="text-[clamp(1.5rem,4.5vw,3rem)] font-extrabold tracking-tight leading-[1.1] text-white max-w-xl">
                Discharge documents your patients can{" "}
                <span className="text-clinical-teal">actually understand.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-lg">
                AI-powered summaries in English, Hausa, Yoruba, and Igbo. Built for Nigerian hospitals.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Link
                  href="/register-facility"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-clinical-teal text-white hover:bg-clinical-teal/90 text-sm sm:text-base font-bold px-6 py-3 shadow-lg shadow-clinical-teal/25 hover:shadow-[0_0_25px_rgba(11,110,110,0.3)] transition-all duration-200 whitespace-nowrap w-full sm:w-auto hover:-translate-y-0.5 active:translate-y-0"
                >
                  Start Free Pilot
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/#how-it-works"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600/50 bg-slate-800/50 text-white hover:bg-slate-700/60 text-sm sm:text-base font-semibold px-6 py-3 shadow-lg shadow-black/20 transition-all duration-200 whitespace-nowrap w-full sm:w-auto hover:-translate-y-0.5 active:translate-y-0"
                >
                  See How It Works
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
                {[
                  { icon: Shield, label: "NDPR Compliant" },
                  { icon: Activity, label: "FMOH Aligned" },
                  { icon: CheckCircle, label: "30-Day Free Pilot — No Card Required" },
                ].map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/80 bg-slate-800/40 px-3 py-1 text-[11px] font-medium text-slate-300"
                  >
                    <Icon className="h-3 w-3 text-clinical-teal" />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div className="hidden lg:block lg:col-span-7" aria-hidden="true">
              <div className="relative rounded-2xl bg-slate-950/60 border border-slate-800/80 shadow-2xl shadow-black/30 backdrop-blur-sm p-4 xl:p-5">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono tracking-tight">careflow-output.log</span>
                  <div className="ml-auto flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-clinical-teal/60 animate-pulse" />
                    <span className="text-[10px] text-clinical-teal/60 font-mono">AI READY</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 text-[10px] leading-relaxed font-mono text-slate-300">
                    <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 mb-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-clinical-teal/60" />
                      <span className="font-bold uppercase tracking-wider text-[11px] text-clinical-teal">Clinical Summary</span>
                    </div>
                    <p className="text-slate-500 mb-2 text-[9px] uppercase tracking-wider"># FOR HOSPITAL RECORDS</p>
                    <p className="mb-1"><span className="text-slate-500">Patient:</span> Emeka Obi, 45y M</p>
                    <p className="mb-1"><span className="text-slate-500">Diagnosis:</span> Severe Malaria, Type 2 DM</p>
                    <p className="mb-1"><span className="text-slate-500">Medications:</span></p>
                    <div className="border border-slate-800 rounded-lg bg-slate-950/80 p-2 mb-2 space-y-0.5">
                      <p className="text-slate-400">- Artemether/Lumefantrine 80/480mg PO BID x 3d</p>
                      <p className="text-slate-400">- Metformin 500mg PO BID with meals</p>
                    </div>
                    <p className="text-red-400/90 font-bold text-[9px] uppercase tracking-wider">⚠ Red Flags: High fever, confusion.</p>
                  </div>

                  <div className="rounded-xl border border-clinical-teal/20 bg-slate-900/80 p-4 text-[11px] leading-relaxed text-slate-200">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500/60" />
                        <span className="font-bold uppercase tracking-wider text-[11px] text-amber-500">Patient Instructions</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/10 text-amber-500/90 rounded-md border border-amber-500/20 font-semibold">YORUBA</span>
                    </div>
                    <p className="font-semibold text-clinical-teal mb-1 text-[10px]">Ohun ti o ṣẹlẹ:</p>
                    <p className="text-slate-400 mb-2">Ibà lọ́wọ́ọ́ kòkòrò ibà àti àtọ̀gbẹ.</p>
                    <p className="font-semibold text-clinical-teal mb-1 text-[10px]">Awọn oogun rẹ:</p>
                    <div className="border border-slate-800 rounded-lg bg-slate-950/80 p-2 mb-2 text-[10px] space-y-0.5">
                      <p className="text-slate-300"><span className="font-bold text-amber-500/90">Artemether/Lumefantrine:</span> Mu ni igba meji lojoojumọ.</p>
                      <p className="text-slate-300"><span className="font-bold text-amber-500/90">Metformin:</span> Mu ni igba meji pẹlu ounjẹ.</p>
                    </div>
                    <p className="text-red-400/80 text-[9px] font-semibold">Tẹle itọnisọna dokita.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
