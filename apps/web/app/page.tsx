import { PageShell } from "@/components/layout/PageShell";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { WaitlistSection } from "@/components/landing/WaitlistSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <PageShell>
      <SiteHeader />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <FAQSection />
      <WaitlistSection />
      <LandingFooter />
    </PageShell>
  );
}
