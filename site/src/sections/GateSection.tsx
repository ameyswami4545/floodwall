import { GATE_POLICIES } from "../content";

export function GateSection() {
  return (
    <section className="section split-section" id="gate" aria-labelledby="gate-title">
      <div className="card feature-card">
        <p className="kicker">Policy gate</p>
        <h2 id="gate-title">One hard reject blocks the change.</h2>
        <p className="feature-copy">
          Reference policies cover global destructive actions, blast-radius urgency, and resource
          allowlists. The policy trait stays small so teams can add rules that match their own
          release discipline. A deferred change is held, not dropped, until a human releases or
          expires it.
        </p>
      </div>
      <div className="card dark-panel">
        <div className="panel-head">
          <span>Reference policies</span>
          <span>Harshest verdict wins</span>
        </div>
        <ul className="panel-rows">
          {GATE_POLICIES.map(({ name, rule, verdict }) => (
            <li className="policy-row" key={name}>
              <div>
                <code>{name}</code>
                <p>{rule}</p>
              </div>
              <span className={`verdict-badge verdict-${verdict}`}>{verdict}</span>
            </li>
          ))}
        </ul>
        <div className="panel-foot">
          <span>Add your own</span>
          <code>impl Policy for YourRule</code>
        </div>
      </div>
    </section>
  );
}
