import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Lafiyanku",
  description:
    "How Lafiyanku collects, uses, stores, and protects your data. NDPR 2019 compliant.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <h1 className="text-3xl font-bold text-deep-navy mb-8">Privacy Policy</h1>
      <p className="text-sm text-cool-grey mb-6">Last updated: June 2026</p>

      <div className="prose prose-slate max-w-none space-y-8 text-[15px] leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-deep-navy mb-3">1. Introduction</h2>
          <p>
            Lafiyanku (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is an AI-powered clinical discharge
            documentation assistant built for Nigerian hospitals, clinics, and telemedicine providers. We are
            committed to protecting the privacy and security of all personal and clinical data processed through
            our platform.
          </p>
          <p>
            This Privacy Policy explains how we collect, use, store, and share information when you use our
            services. By using Lafiyanku, you agree to the practices described in this policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-deep-navy mb-3">2. Data We Collect</h2>
          <h3 className="text-lg font-medium text-deep-navy mt-4 mb-2">2.1 Account Information</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Full name, email address, and role (Doctor, Nurse, or Admin)</li>
            <li>Hospital/facility affiliation and MDCN licence number (if provided)</li>
          </ul>

          <h3 className="text-lg font-medium text-deep-navy mt-4 mb-2">2.2 Clinical Data</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Patient input data submitted by clinicians (names, diagnoses, medications, treatment details)</li>
            <li>AI-generated discharge summaries and patient-friendly instructions</li>
            <li>Translation outputs (Hausa, Yoruba, Igbo)</li>
          </ul>
          <p>
            Clinical data is processed solely for the purpose of generating discharge documentation. We do not
            use clinical data for marketing, profiling, or any purpose beyond documentation generation.
          </p>

          <h3 className="text-lg font-medium text-deep-navy mt-4 mb-2">2.3 Usage Data</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Login timestamps, IP addresses (for audit logging and security)</li>
            <li>Actions performed on the platform (generate, edit, finalise, export)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-deep-navy mb-3">3. How We Use Your Data</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Discharge documentation:</strong> To generate, translate, and deliver clinical discharge summaries and patient-friendly instructions</li>
            <li><strong>Audit compliance:</strong> To maintain immutable audit logs as required by NDPR 2019 Article 2.6</li>
            <li><strong>Security:</strong> To authenticate users, enforce role-based access, and detect unauthorised access</li>
            <li><strong>Service improvement:</strong> Aggregated, anonymised usage patterns may be used to improve the platform</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-deep-navy mb-3">4. Data Storage and Security</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>All data is encrypted in transit (TLS 1.3) and at rest (AES-256)</li>
            <li>Data is stored in Supabase (PostgreSQL) with Row Level Security enforcing multi-tenant isolation</li>
            <li>Audit logs are immutable — they cannot be updated or deleted by any user or system</li>
            <li>We implement role-based access control (Doctor, Nurse, Admin) enforced server-side</li>
            <li>Regular security assessments and penetration testing</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-deep-navy mb-3">5. Data Sharing</h2>
          <p>
            We do not sell, rent, or share your personal or clinical data with third parties, except:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>AI processing:</strong> Clinical input is sent to our AI provider (DeepSeek) for document generation. Data is processed ephemerally and not retained by the AI provider beyond the generation request.</li>
            <li><strong>Legal requirements:</strong> If required by law, regulation, or valid legal process</li>
            <li><strong>With your consent:</strong> When you explicitly authorise sharing (e.g., printing or WhatsApp sharing of patient instructions)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-deep-navy mb-3">6. Data Retention</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Account data:</strong> Retained while your account is active, deleted within 30 days of account closure</li>
            <li><strong>Clinical records:</strong> Retained for the period required by Nigerian healthcare regulations (minimum 6 years)</li>
            <li><strong>Audit logs:</strong> Retained for 7 years as required by NDPR 2019</li>
            <li><strong>Usage logs:</strong> Retained for 12 months, then anonymised</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-deep-navy mb-3">7. Your Rights</h2>
          <p>Under NDPR 2019, you have the right to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Access your personal data</li>
            <li>Rectify inaccurate personal data</li>
            <li>Request deletion of your personal data (subject to legal retention requirements)</li>
            <li>Object to processing of your personal data</li>
            <li>Data portability</li>
          </ul>
          <p>
            To exercise these rights, contact us at{" "}
            <a href="mailto:privacy@lafiyanku.com" className="text-clinical-teal hover:underline">
              privacy@lafiyanku.com
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-deep-navy mb-3">8. Data Residency</h2>
          <p>
            All data is stored and processed within Nigeria. We do not transfer personal data outside of Nigeria.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-deep-navy mb-3">9. Children&apos;s Privacy</h2>
          <p>
            Lafiyanku is not intended for use by individuals under the age of 18. We do not knowingly collect
            personal data from children.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-deep-navy mb-3">10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of material changes by
            posting the updated policy on our platform and, where appropriate, by email.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-deep-navy mb-3">11. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or our data practices, contact us at:
          </p>
          <p>
            Email:{" "}
            <a href="mailto:privacy@lafiyanku.com" className="text-clinical-teal hover:underline">
              privacy@lafiyanku.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
