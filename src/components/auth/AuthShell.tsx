"use client";

import Link from "next/link";

interface AuthShellProps {
  children: React.ReactNode;
  variant?: "default" | "facility";
}

const FEATURES = [
  "Clinical summary + plain-language for every patient",
  "Translate into Hausa, Yoruba, and Igbo",
  "NDPR 2019 compliant with full audit trail",
  "Aligned with FMOH patient record standards",
];

export function AuthShell({ children, variant = "default" }: AuthShellProps) {
  return (
    <div className="flex h-dvh bg-cool-off-white">
      <div className="hidden lg:flex lg:w-[42%] xl:w-[45%] flex-col bg-deep-navy text-white p-10 xl:p-14 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(11,110,110,0.10),transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.5'%3E%3Ccircle cx='2' cy='2' r='1'/%3E%3C/g%3E%3C/svg%3E\")" }} />

        <Link href="/" className="self-start py-3 text-lg font-bold text-white hover:text-clinical-teal transition-colors relative z-10">
          CareFlow
        </Link>

        <div className="flex-1 flex flex-col justify-center -mt-6 relative z-10">
          {variant === "facility" ? (
            <>
              <p className="text-xs font-semibold text-clinical-teal tracking-widest uppercase mb-3">Get started</p>
              <h2 className="text-3xl xl:text-4xl font-extrabold leading-tight max-w-sm">
                Register your facility
              </h2>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed max-w-sm">
                Create an admin account to manage your hospital or clinic. Add doctors and nurses after signing in.
              </p>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold text-clinical-teal tracking-widest uppercase mb-3">CareFlow</p>
              <h2 className="text-3xl xl:text-4xl font-extrabold leading-tight max-w-sm">
                Discharge documentation for Nigerian hospitals
              </h2>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed max-w-sm">
                Every patient receives instructions they can understand — in English, Hausa, Yoruba, or Igbo.
              </p>
            </>
          )}

          <hr className="border-slate-800 mt-8 max-w-sm" />

          <ul className="mt-6 space-y-3">
            {FEATURES.map((text) => (
              <li key={text} className="text-sm text-slate-300 flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-clinical-teal" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-5 py-8 overflow-y-auto">
        <div className="w-full max-w-md">
          <Link href="/" className="block text-center py-3 text-lg font-bold text-deep-navy hover:text-clinical-teal transition-colors mb-6 lg:hidden">
            CareFlow
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
