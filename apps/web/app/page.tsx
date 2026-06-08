import { AnnouncementBar } from "@/components/landing/AnnouncementBar";
import { HeroSection } from "@/components/landing/HeroSection";
import { LandingDetails } from "@/components/landing/LandingDetails";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-pr-paper text-pr-ink">
      <AnnouncementBar />
      <SiteHeader />
      <HeroSection />
      <LandingDetails />
      <LandingFooter />
    </main>
  );
}
