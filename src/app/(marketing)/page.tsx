import type { Metadata } from "next";
import { HeroSection } from "@/components/marketing/HeroSection";
import { ProblemSection } from "@/components/marketing/ProblemSection";
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection";
import { FeaturesSection } from "@/components/marketing/FeaturesSection";
import { ComparisonTable } from "@/components/marketing/ComparisonTable";
import { SocialProofSection } from "@/components/marketing/SocialProofSection";
import { TrustSection } from "@/components/marketing/TrustSection";
import { FaqSection } from "@/components/marketing/FaqSection";
import { DemoSection } from "@/components/marketing/DemoSection";

export const metadata: Metadata = {
  title: "Lafiyanku — AI Discharge Documentation for Nigerian Hospitals",
  description:
    "Generate clinical discharge summaries and patient-friendly instructions in English, Hausa, Yoruba, and Igbo. NDPR compliant. Start your free 30-day pilot.",
};

export default function MarketingLandingPage() {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <FeaturesSection />
      <ComparisonTable />
      <SocialProofSection />
      <TrustSection />
      <FaqSection />
      <DemoSection />
    </>
  );
}
