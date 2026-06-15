import { Clock, Languages, LayoutGrid, ShieldCheck, Wifi } from "lucide-react";

const ROWS = [
  {
    icon: Clock,
    feature: "Time to generate",
    manual: "15–30 minutes",
    lafiyanku: "Under 30 seconds",
  },
  {
    icon: Languages,
    feature: "Patient language",
    manual: "English only (clinical jargon)",
    lafiyanku: "English, Hausa, Yoruba, Igbo",
  },
  {
    icon: LayoutGrid,
    feature: "Format consistency",
    manual: "Varies by clinician",
    lafiyanku: "FMOH-aligned, standardised",
  },
  {
    icon: ShieldCheck,
    feature: "Audit trail",
    manual: "Paper-based, incomplete",
    lafiyanku: "100% digital, immutable logs",
  },
  {
    icon: Wifi,
    feature: "Offline support",
    manual: "Not available",
    lafiyanku: "Works on 3G, Android 8+",
  },
];

export function ComparisonTable() {
  return (
    <section id="comparison" aria-labelledby="comparison-heading" className="bg-pure-white py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 id="comparison-heading" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-deep-navy">
            Lafiyanku vs Manual Documentation
          </h2>
          <p className="mt-3 text-lg text-cool-grey">See the difference side by side.</p>
        </div>

        {/* Mobile: stacked cards */}
        <div className="sm:hidden space-y-4">
          {ROWS.map(({ icon: Icon, feature, manual, lafiyanku }) => (
            <div key={feature} className="rounded-2xl bg-cool-off-white overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200">
                <Icon className="h-4 w-4 text-clinical-teal" />
                <span className="text-sm font-bold text-deep-navy">{feature}</span>
              </div>
              <div className="grid grid-cols-2 divide-x divide-slate-200">
                <div className="px-4 py-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-warm-amber">Manual</span>
                  <p className="text-sm text-slate mt-1">{manual}</p>
                </div>
                <div className="px-4 py-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-clinical-teal">Lafiyanku</span>
                  <p className="text-sm text-slate mt-1 font-medium">{lafiyanku}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: table */}
        <div className="hidden sm:block">
          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-deep-navy text-white">
                  <th scope="col" className="text-left px-6 py-4 font-semibold">Feature</th>
                  <th scope="col" className="text-left px-6 py-4 font-semibold">Manual Documentation</th>
                  <th scope="col" className="text-left px-6 py-4 font-semibold">Lafiyanku</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map(({ icon: Icon, feature, manual, lafiyanku }, idx) => (
                  <tr key={feature} className={idx % 2 === 0 ? "bg-white" : "bg-cool-off-white"}>
                    <td className="px-6 py-4 font-medium text-deep-navy">
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-clinical-teal" />
                        {feature}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-cool-grey">{manual}</td>
                    <td className="px-6 py-4 font-medium text-slate">{lafiyanku}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
