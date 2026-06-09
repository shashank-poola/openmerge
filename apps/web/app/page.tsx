import { PageShell } from "@/components/layout/PageShell";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { CompetitorsSection } from "@/components/landing/CompetitorsSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { WaitlistSection } from "@/components/landing/WaitlistSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <PageShell>
      <SiteHeader />
      <HeroSection />
      <FeaturesGrid />
      <FeaturesSection />
      <CompetitorsSection />
      <FAQSection />
      <WaitlistSection />
      <LandingFooter />
    </PageShell>
  );
}
