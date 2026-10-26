import { MODEL_STAGES } from "../../constants/landing";
import { cardCopy, landingSection } from "../../styles/classes";
import { SectionHeading } from "../shared/SectionHeading";
import { Tag } from "../shared/Tag";

export function LandingModelSection() {
  return (
    <section className={landingSection} id="model" aria-labelledby="model-title">
      <SectionHeading id="model-title" kicker="The model">
        Agents submit intents. Production gets decisions.
      </SectionHeading>
      <div className="grid grid-cols-3 gap-px overflow-hidden rounded-card border border-line bg-line shadow-card tablet:grid-cols-[1fr]">
        {MODEL_STAGES.map(({ title, copy }) => (
          <article
            className="flex flex-col gap-6 [background:linear-gradient(180deg,rgba(255,255,255,0.94),rgba(232,242,248,0.62)),#fff] p-card"
            key={title}
          >
            <Tag render={<h3 />}>{title}</Tag>
            <p className={cardCopy}>{copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
