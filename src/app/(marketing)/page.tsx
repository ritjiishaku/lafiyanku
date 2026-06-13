import { HeroSection } from "@/components/marketing/HeroSection";
import { ProblemSection } from "@/components/marketing/ProblemSection";
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection";
import { FeaturesSection } from "@/components/marketing/FeaturesSection";
import { TrustSection } from "@/components/marketing/TrustSection";
import { DemoSection } from "@/components/marketing/DemoSection";

export default function MarketingLandingPage() {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TrustSection />
      <DemoSection />
    </>
  );
}
