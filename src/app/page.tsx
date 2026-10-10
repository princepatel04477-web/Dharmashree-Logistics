import type { Metadata } from "next";
import { CommitmentsSection } from "@/components/home/CommitmentsSection";
import { HeroSection } from "@/components/home/HeroSection";
import { IndustriesSection } from "@/components/home/IndustriesSection";
import { NetworkSection } from "@/components/home/NetworkSection";
import { ProcessSection } from "@/components/home/ProcessSection";
import { QuoteBand } from "@/components/home/QuoteBand";
import { ServicesSection } from "@/components/home/ServicesSection";
import { StatsStrip } from "@/components/home/StatsStrip";
import { hero } from "@/content/home";

/* Home page. The layout owns `<main>`, so this route returns the sections
   only. Section order and grounds: hero (photo under --brand-deep) · facts strip
   (--brand) · services (white) · network (--brand-tint) · process (white) ·
   industries (--brand-tint) · commitments (white) · quote band (photo under
   --brand-deep), so the page alternates white and blue grounds all the way
   down. Two sections are data-gated: the facts strip shows the four services
   as chips until `company.ts` has the figures (house rule 4), and `services.ts`
   being empty drops the services section. */

export const metadata: Metadata = {
  title: "Freight & Transport across India",
  description: hero.body,
};

export default function Home() {
  return (
    <>
      <HeroSection />
      <StatsStrip />
      <ServicesSection />
      <NetworkSection />
      <ProcessSection />
      <IndustriesSection />
      <CommitmentsSection />
      <QuoteBand />
    </>
  );
}
