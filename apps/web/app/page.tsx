import { SiteHeader } from "@/components/landing/SiteHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { ReviewShowcase } from "@/components/landing/ReviewShowcase";
import { CompetitorsSection } from "@/components/landing/CompetitorsSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { InstallCtaSection } from "@/components/landing/InstallCtaSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-[#171717]">
      <div className="mx-auto max-w-[1000px] border-x border-[#e9e9e9]">
        <SiteHeader />
        <HeroSection />
        <FeaturesGrid />
        <FeaturesSection />
        <ReviewShowcase />
        <CompetitorsSection />
        <FAQSection />
        <InstallCtaSection />
        <LandingFooter />
      </div>
    </main>
  );
}
