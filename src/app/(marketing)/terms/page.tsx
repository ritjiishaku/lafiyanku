import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use — Lafiyanku",
  description:
    "Terms and conditions governing the use of Lafiyanku clinical discharge documentation platform.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <h1 className="text-3xl font-bold text-deep-navy mb-8">Terms of Use</h1>
      <p className="text-sm text-cool-grey mb-6">Last updated: June 2026</p>

      <div className="prose prose-slate max-w-none space-y-8 text-[15px] leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-deep-navy mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Lafiyanku (&ldquo;the Platform&rdquo;), you agree to be bound by these Terms of
            Use. If you do not agree to these terms, do not use the Platform.
          </p>
          <p>
            These Terms constitute a legally binding agreement between you (&ldquo;User&rdquo;, &ldquo;you&rdquo;)
            and Lafiyanku (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-deep-navy mb-3">2. Description of Service</h2>
          <p>
            Lafiyanku is an AI-powered clinical discharge documentation assistant. It converts structured
            clinical input (filled in by a doctor or nurse) into:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Mode 1:</strong> A professional clinical discharge summary for hospital records</li>
            <li><strong>Mode 2:</strong> Patient-friendly instructions in plain language</li>
            <li><strong>Translation:</strong> Patient-friendly instructions translated into Hausa, Yoruba, or Igbo (on request)</li>
          </ul>
          <p className="mt-3 font-medium text-warm-amber">
            IMPORTANT: Lafiyanku is a documentation tool. It does not provide medical advice, diagnosis, or
            treatment. All clinical decisions remain the sole responsibility of the treating clinician.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-deep-navy mb-3">3. Eligibility</h2>
          <p>
            Lafiyanku is designed for use by licensed healthcare professionals (Doctors and Nurses) and
            healthcare facility administrators in Nigeria. By using the Platform, you represent and warrant
            that:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>You are a licensed healthcare professional or healthcare facility administrator</li>
            <li>You have the authority to enter into these Terms</li>
            <li>Your use of the Platform complies with all applicable laws and regulations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-deep-navy mb-3">4. User Accounts</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Each account is for a single, named user. Shared accounts are prohibited.</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials</li>
            <li>You must notify us immediately of any unauthorised use of your account</li>
            <li>We reserve the right to suspend or terminate accounts that violate these Terms</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-deep-navy mb-3">5. Clinical Responsibility</h2>
          <p className="font-medium text-warm-amber">
            Lafiyanku is a drafting assistant. It does not replace clinical judgement.
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li><strong>Doctor-finalised model:</strong> All AI-generated output is a draft until reviewed and finalised by a licensed Doctor</li>
            <li><strong>Clinical review:</strong> Clinicians must review, edit, and verify all output before it is finalised or shared with patients</li>
            <li><strong>No autonomous decisions:</strong> The AI does not make clinical decisions, prescribe medications, or alter treatment plans</li>
            <li><strong>Accuracy:</strong> While we endeavour to ensure accuracy, AI-generated output may contain errors. The treating clinician bears full responsibility for the accuracy of discharge documentation</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-deep-navy mb-3">6. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Use the Platform for any purpose other than clinical discharge documentation</li>
            <li>Attempt to access unauthorised areas of the Platform or other users&apos; data</li>
            <li>Interfere with or disrupt the Platform&apos;s infrastructure</li>
            <li>Use the Platform to process data that is unlawful, harmful, or violates the rights of others</li>
            <li>Reverse-engineer, decompile, or attempt to extract the source code of the Platform</li>
            <li>Use automated tools (bots, scrapers) to access the Platform</li>
            <li>Share your account credentials with unauthorised individuals</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-deep-navy mb-3">7. Intellectual Property</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>The Platform, including its software, design, and documentation, is owned by Lafiyanku and protected by intellectual property laws</li>
            <li>Clinical content you input and the discharge documentation you generate remain your intellectual property</li>
            <li>We claim no ownership over clinical data processed through the Platform</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-deep-navy mb-3">8. Data Protection</h2>
          <p>
            Your use of the Platform is also governed by our{" "}
            <a href="/privacy" className="text-clinical-teal hover:underline">Privacy Policy</a> and{" "}
            <a href="/ndpr" className="text-clinical-teal hover:underline">NDPR Compliance</a> page.
            By using the Platform, you consent to the collection, use, and storage of data as described
            in those documents.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-deep-navy mb-3">9. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>The Platform is provided &ldquo;as is&rdquo; without warranties of any kind, express or implied</li>
            <li>We do not warrant that the Platform will be uninterrupted, error-free, or secure</li>
            <li>We are not liable for any clinical decisions made based on AI-generated output</li>
            <li>Our total liability shall not exceed the fees paid by you in the 12 months preceding the claim</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-deep-navy mb-3">10. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless Lafiyanku from any claims, losses, or damages arising
            from your use of the Platform, including but not limited to clinical decisions made based on
            AI-generated output that you failed to properly review.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-deep-navy mb-3">11. Termination</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>You may terminate your account at any time by contacting us</li>
            <li>We may suspend or terminate your account for violation of these Terms</li>
            <li>Upon termination, your right to use the Platform ceases immediately</li>
            <li>We will retain your data as described in our Privacy Policy</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-deep-navy mb-3">12. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be
            resolved in the courts of competent jurisdiction in Lagos State, Nigeria.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-deep-navy mb-3">13. Changes to Terms</h2>
          <p>
            We may update these Terms from time to time. We will notify you of material changes by posting
            the updated Terms on the Platform and, where appropriate, by email. Continued use of the Platform
            after changes constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-deep-navy mb-3">14. Contact</h2>
          <p>
            For questions about these Terms of Use:
          </p>
          <p>
            Email:{" "}
            <a href="mailto:legal@lafiyanku.com" className="text-clinical-teal hover:underline">
              legal@lafiyanku.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
