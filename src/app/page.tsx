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

/* Home page (Prompt 05). Editorial rhythm straight from Maa Sheetla: numbered
   sections, one hairline between each, generous `--space-section` padding and
   asymmetric 12-column grids — never a row of equal cards. The layout owns
   `<main>`, so this route returns the sections only.

   Section order: hero · stats ledger · services · network · process ·
   industries · commitments · quote band. Two of them are data-gated and
   therefore absent until their content exists: `services.ts` is still empty
   and every company figure is null, so H2 and the stats strip render nothing
   (house rule 4). */

export const metadata: Metadata = {
  title: "Freight & Transport from Surat",
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
