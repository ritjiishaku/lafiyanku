import type { Metadata } from "next";
import { PricingSection } from "@/components/marketing/PricingSection";

export const metadata: Metadata = {
  title: "Pricing — CareFlow",
  description: "Simple, transparent pricing for Nigerian hospitals and clinics. Start your 30-day free pilot.",
};

export default function PricingPage() {
  return (
    <div className="py-12 bg-white">
      <PricingSection />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-20">
        <h3 className="text-xl font-bold text-deep-navy mb-6 text-center">Compare Plan Features</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm text-slate-600">
            <thead>
              <tr className="border-b border-slate-200">
                <th scope="col" className="py-3 px-4 font-bold text-deep-navy">Feature</th>
                <th scope="col" className="py-3 px-4 font-bold text-deep-navy">Clinic</th>
                <th scope="col" className="py-3 px-4 font-bold text-deep-navy">Hospital</th>
                <th scope="col" className="py-3 px-4 font-bold text-deep-navy">System</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Clinician Seats</td>
                <td className="py-3 px-4">Up to 5</td>
                <td className="py-3 px-4">Up to 50</td>
                <td className="py-3 px-4">Unlimited</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Native Translations</td>
                <td className="py-3 px-4">Included (ha/yo/ig)</td>
                <td className="py-3 px-4">Included (ha/yo/ig)</td>
                <td className="py-3 px-4">Included (ha/yo/ig)</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">NDPR & Health Security</td>
                <td className="py-3 px-4">Compliant</td>
                <td className="py-3 px-4">Compliant</td>
                <td className="py-3 px-4">Compliant + SLAs</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">Audit Logs</td>
                <td className="py-3 px-4">Included</td>
                <td className="py-3 px-4">Included</td>
                <td className="py-3 px-4">Included</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-3 px-4 font-medium">FHIR Integration</td>
                <td className="py-3 px-4">No</td>
                <td className="py-3 px-4">No</td>
                <td className="py-3 px-4">Yes (Custom Config)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
