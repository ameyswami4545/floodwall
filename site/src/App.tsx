import { useCenteredSectionLinks } from "./hooks";
import { LandingFooter } from "./landing/LandingFooter";
import { LandingGateSection } from "./landing/LandingGateSection";
import { LandingHeader } from "./landing/LandingHeader";
import { LandingHero } from "./landing/LandingHero";
import { LandingLedgerSection } from "./landing/LandingLedgerSection";
import { LandingModelSection } from "./landing/LandingModelSection";
import { LandingRoadmapSection } from "./landing/LandingRoadmapSection";

export default function App() {
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
