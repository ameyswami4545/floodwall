import { ROADMAP } from "../../constants/landing";
import { cx } from "../../helpers/cx";
import { card, cardCopy, landingSection, tag } from "../../styles/classes";
import { SectionHeading } from "../shared/SectionHeading";

export function LandingRoadmapSection() {
  return (
    <section className={landingSection} id="roadmap" aria-labelledby="roadmap-title">
      <SectionHeading id="roadmap-title" kicker="Roadmap">
        From a wall to a replayable control plane.
      </SectionHeading>
      <ol className="grid grid-cols-4 gap-4 tablet:grid-cols-2 mobile:grid-cols-[1fr]">
        {ROADMAP.map(({ version, title, copy }) => (
          <li className={cx(card, "flex flex-col p-card")} key={version}>
            <span className={tag}>{version}</span>
            <h3 className="mt-6 mb-3 text-title leading-tight font-semibold text-ink">{title}</h3>
            <p className={cardCopy}>{copy}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
