import { useCenteredSectionLinks } from "../hooks";
import { LandingFooter } from "./LandingFooter";
import { LandingGateSection } from "./LandingGateSection";
import { LandingHeader } from "./LandingHeader";
import { LandingHero } from "./LandingHero";
import { LandingLedgerSection } from "./LandingLedgerSection";
import { LandingModelSection } from "./LandingModelSection";
import { LandingRoadmapSection } from "./LandingRoadmapSection";
import "./landing-header.css";
import "./landing-hero.css";
import "./landing-sections.css";
import "./landing-footer.css";

export function LandingPage() {
  useCenteredSectionLinks();

  return (
    <>
      <LandingHeader />
      <main>
        <LandingHero />
        <LandingModelSection />
        <LandingGateSection />
        <LandingLedgerSection />
        <LandingRoadmapSection />
      </main>
      <LandingFooter />
    </>
  );
}
