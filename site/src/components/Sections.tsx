import { LEDGER_ENTRIES, MODEL_STAGES, ROADMAP } from "../content";

export function ModelSection() {
  return (
    <section className="section" id="model" aria-labelledby="model-title">
      <SectionHeading id="model-title" kicker="The model">
        Agents submit intents. Production gets decisions.
      </SectionHeading>
      <div className="model-rail">
        {MODEL_STAGES.map(({ title, copy }) => (
          <article className="model-stage" key={title}>
            <h3 className="tag">{title}</h3>
            <p>{copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function GateLedgerSection() {
  return (
    <section className="section split-section">
      <article className="card feature-card" id="gate" aria-labelledby="gate-title">
        <p className="kicker">Policy gate</p>
        <h2 id="gate-title">One hard reject blocks the change.</h2>
        <p>
          Reference policies cover global destructive actions, blast-radius urgency, and resource
          allowlists. The policy trait stays small so teams can add rules that match their own
          release discipline. A deferred change is held, not dropped, until a human releases or
          expires it.
        </p>
      </article>
      <article className="card ledger-panel" id="ledger" aria-labelledby="ledger-title">
        <div className="ledger-head">
          <h2 id="ledger-title">Tamper-evident ledger</h2>
          <span>Valid chain</span>
        </div>
        <ol className="ledger-rows">
          {LEDGER_ENTRIES.map(({ verdict, agent, intent }) => (
            <li className="ledger-row" key={`${verdict}-${agent}`}>
              <span className={`verdict verdict-${verdict}`}>{verdict}</span>
              <span>{agent}</span>
              <span>{intent}</span>
            </li>
          ))}
        </ol>
      </article>
    </section>
  );
}

export function RoadmapSection() {
  return (
    <section className="section" id="roadmap" aria-labelledby="roadmap-title">
      <SectionHeading id="roadmap-title" kicker="Roadmap">
        From a wall to a replayable control plane.
      </SectionHeading>
      <ol className="roadmap-grid">
        {ROADMAP.map(({ version, title, copy }) => (
          <li className="card roadmap-card" key={version}>
            <span className="roadmap-version">{version}</span>
            <h3>{title}</h3>
            <p>{copy}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function SectionHeading({ id, kicker, children }: { id: string; kicker: string; children: string }) {
  return (
    <header className="section-heading">
      <p className="kicker">{kicker}</p>
      <h2 id={id} className="display-heading">
        {children}
      </h2>
    </header>
  );
}
