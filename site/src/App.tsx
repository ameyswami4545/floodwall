import { LandingFooter } from "./components/landing/LandingFooter";
import { LandingGateSection } from "./components/landing/LandingGateSection";
import { LandingHeader } from "./components/landing/LandingHeader";
import { LandingHero } from "./components/landing/LandingHero";
import { LandingLedgerSection } from "./components/landing/LandingLedgerSection";
import { LandingModelSection } from "./components/landing/LandingModelSection";
import { LandingRoadmapSection } from "./components/landing/LandingRoadmapSection";

export default function App() {
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
