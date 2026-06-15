import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NDPR Compliance — Lafiyanku",
  description:
    "How Lafiyanku complies with Nigeria Data Protection Regulation (NDPR) 2019 and related regulations.",
};

export default function NdprPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <h1 className="text-3xl font-bold text-deep-navy mb-8">NDPR Compliance</h1>
      <p className="text-sm text-cool-grey mb-6">Last updated: June 2026</p>

      <div className="prose prose-slate max-w-none space-y-8 text-[15px] leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-deep-navy mb-3">1. About NDPR</h2>
          <p>
            The Nigeria Data Protection Regulation (NDPR) 2019, issued by the National Information Technology
            Development Agency (NITDA), is the primary data protection law governing the processing of personal
            data in Nigeria. It establishes rules for the collection, storage, processing, and transfer of
            personal data, with specific requirements for sensitive personal data — including health data.
          </p>
          <p>
            Lafiyanku is designed from the ground up to comply with NDPR 2019 requirements, as well as related
            regulations including the Nigeria Data Protection Act (NDPA) 2023 and FMOH patient record standards.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-deep-navy mb-3">2. Lawful Basis for Processing</h2>
          <p>
            We process personal and clinical data under the following lawful bases as defined by NDPR 2019:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Consent:</strong> Users explicitly consent to data processing during registration and when submitting clinical data</li>
            <li><strong>Contract:</strong> Processing is necessary for the performance of a contract (providing discharge documentation services to healthcare facilities)</li>
            <li><strong>Legal obligation:</strong> Processing is required to comply with healthcare regulations and audit requirements</li>
            <li><strong>Vital interests:</strong> Processing may be necessary to protect the vital interests of patients (timely discharge documentation)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-deep-navy mb-3">3. Data Protection Measures</h2>

          <h3 className="text-lg font-medium text-deep-navy mt-4 mb-2">3.1 Encryption</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Data in transit: TLS 1.3 minimum</li>
            <li>Data at rest: AES-256 encryption</li>
          </ul>

          <h3 className="text-lg font-medium text-deep-navy mt-4 mb-2">3.2 Access Control</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Role-based access control (Doctor, Nurse, Admin) enforced server-side</li>
            <li>Multi-tenant facility isolation via Row Level Security (RLS)</li>
            <li>Session-based authentication with 8-hour maximum session duration</li>
            <li>Rate limiting on authentication endpoints</li>
          </ul>

          <h3 className="text-lg font-medium text-deep-navy mt-4 mb-2">3.3 Audit Logging</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>100% action logging — no action on a discharge record occurs without an audit log entry</li>
            <li>Audit logs are immutable (UPDATE and DELETE blocked at database level via triggers)</li>
            <li>Each log entry records: user ID, role, action, timestamp, IP address, and changes (if applicable)</li>
            <li>Audit logs retained for 7 years as required by healthcare regulations</li>
          </ul>

          <h3 className="text-lg font-medium text-deep-navy mt-4 mb-2">3.4 Data Residency</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>All data stored and processed within Nigeria</li>
            <li>No cross-border data transfers</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-deep-navy mb-3">4. Data Subject Rights</h2>
          <p>Under NDPR 2019, data subjects have the following rights:</p>

          <div className="my-4 space-y-3 sm:space-y-0">
            {/* Mobile: cards */}
            <div className="sm:hidden space-y-3">
              {[
                { right: "Access", desc: "Request a copy of all personal data we hold about you" },
                { right: "Rectification", desc: "Request correction of inaccurate personal data" },
                { right: "Erasure", desc: "Request deletion of personal data (subject to legal retention requirements)" },
                { right: "Objection", desc: "Object to processing of personal data for specific purposes" },
                { right: "Portability", desc: "Request transfer of personal data in a structured, machine-readable format" },
              ].map(({ right, desc }) => (
                <div key={right} className="rounded-xl border border-border bg-cool-off-white p-4">
                  <div className="text-sm font-bold text-deep-navy mb-1">{right}</div>
                  <div className="text-sm text-slate">{desc}</div>
                </div>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 font-medium text-deep-navy">Right</th>
                    <th className="text-left py-2 font-medium text-deep-navy">Description</th>
                  </tr>
                </thead>
                <tbody className="text-slate">
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4 font-medium">Access</td>
                    <td className="py-2">Request a copy of all personal data we hold about you</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4 font-medium">Rectification</td>
                    <td className="py-2">Request correction of inaccurate personal data</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4 font-medium">Erasure</td>
                    <td className="py-2">Request deletion of personal data (subject to legal retention requirements)</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4 font-medium">Objection</td>
                    <td className="py-2">Object to processing of personal data for specific purposes</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4 font-medium">Portability</td>
                    <td className="py-2">Request transfer of personal data in a structured, machine-readable format</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <p>
            To exercise any of these rights, contact our Data Protection Officer at{" "}
            <a href="mailto:dpo@lafiyanku.com" className="text-clinical-teal hover:underline">
              dpo@lafiyanku.com
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-deep-navy mb-3">5. Data Breach Notification</h2>
          <p>
            In the event of a personal data breach, Lafiyanku will:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Notify NITDA within 72 hours of becoming aware of the breach</li>
            <li>Notify affected data subjects without undue delay</li>
            <li>Document the breach, its effects, and the remedial actions taken</li>
            <li>Implement measures to prevent recurrence</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-deep-navy mb-3">6. Data Protection Impact Assessment</h2>
          <p>
            Lafiyanku has conducted a Data Protection Impact Assessment (DPIA) for all processing activities
            involving health data. The DPIA evaluates risks to data subjects and documents the technical and
            organisational measures implemented to mitigate those risks.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-deep-navy mb-3">7. Third-Party Processors</h2>
          <p>Our data processors include:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Supabase:</strong> Database hosting (PostgreSQL). Data stored in Nigeria. Data processing agreement in place.</li>
            <li><strong>Vercel:</strong> Application hosting. No patient data stored by Vercel beyond transient request processing.</li>
            <li><strong>DeepSeek:</strong> AI processing. Clinical data is processed ephemerally and not retained beyond the generation request.</li>
          </ul>
          <p>
            All third-party processors are contractually obligated to comply with NDPR 2019 requirements.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-deep-navy mb-3">8. Contact</h2>
          <p>
            For NDPR compliance questions or to exercise your data rights:
          </p>
          <p>
            Data Protection Officer:{" "}
            <a href="mailto:dpo@lafiyanku.com" className="text-clinical-teal hover:underline">
              dpo@lafiyanku.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
