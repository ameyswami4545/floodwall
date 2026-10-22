import { MODEL_STAGES } from "../../constants/landing";
import { SectionHeading } from "../shared/SectionHeading";

export function LandingModelSection() {
  return (
    <section className="section" id="model" aria-labelledby="model-title">
      <SectionHeading id="model-title" kicker="The model">
        Agents submit intents. Production gets decisions.
      </SectionHeading>
      <div className="model-rail">
        {MODEL_STAGES.map(({ title, copy }) => (
          <article className="model-stage" key={title}>
            <h3 className="tag">{title}</h3>
            <p className="card-copy">{copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
