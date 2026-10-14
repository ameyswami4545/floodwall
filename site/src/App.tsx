import { Hero } from "./components/Hero";
import { GateLedgerSection, ModelSection, RoadmapSection } from "./components/Sections";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";

export default function App() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <ModelSection />
        <GateLedgerSection />
        <RoadmapSection />
      </main>
      <SiteFooter />
    </>
  );
}
