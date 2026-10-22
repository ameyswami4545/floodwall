import { ROADMAP } from "../../constants/landing";
import { SectionHeading } from "../shared/SectionHeading";

export function LandingRoadmapSection() {
  return (
    <section className="section" id="roadmap" aria-labelledby="roadmap-title">
      <SectionHeading id="roadmap-title" kicker="Roadmap">
        From a wall to a replayable control plane.
      </SectionHeading>
      <ol className="roadmap-grid">
        {ROADMAP.map(({ version, title, copy }) => (
          <li className="card roadmap-card" key={version}>
            <span className="tag">{version}</span>
            <h3>{title}</h3>
            <p className="card-copy">{copy}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
