import { MODEL_STAGES } from "../../constants/landing";
import { cardCopy, landingSection, tag } from "../../styles/classes";
import { SectionHeading } from "../shared/SectionHeading";

export function LandingModelSection() {
  return (
    <section className={landingSection} id="model" aria-labelledby="model-title">
      <SectionHeading id="model-title" kicker="The model">
        Agents submit intents. Production gets decisions.
      </SectionHeading>
      <div className="grid grid-cols-4 gap-px overflow-hidden rounded-card border border-line bg-line shadow-card tablet:grid-cols-[1fr]">
        {MODEL_STAGES.map(({ title, copy }) => (
          <article
            className="flex flex-col gap-6 [background:linear-gradient(180deg,rgba(255,255,255,0.94),rgba(232,242,248,0.62)),#fff] p-card"
            key={title}
          >
            <h3 className={tag}>{title}</h3>
            <p className={cardCopy}>{copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
