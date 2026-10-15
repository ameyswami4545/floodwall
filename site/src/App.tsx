import { useCenteredSectionLinks } from "./hooks";
import { GateSection } from "./sections/GateSection";
import { Hero } from "./sections/Hero";
import { LedgerSection } from "./sections/LedgerSection";
import { ModelSection } from "./sections/ModelSection";
import { RoadmapSection } from "./sections/RoadmapSection";
import { SiteFooter } from "./sections/SiteFooter";
import { SiteHeader } from "./sections/SiteHeader";

export default function App() {
  useCenteredSectionLinks();

  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <ModelSection />
        <GateSection />
        <LedgerSection />
        <RoadmapSection />
      </main>
      <SiteFooter />
    </>
  );
}
