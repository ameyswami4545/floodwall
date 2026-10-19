import { LEDGER_ENTRIES, LEDGER_FACTS, LEDGER_HEAD_DIGEST } from "../content";

export function LandingLedgerSection() {
  return (
    <section
      className="section split-section split-section-reverse"
      id="ledger"
      aria-labelledby="ledger-title"
    >
      <div className="card feature-card">
        <p className="kicker">Tamper-evident ledger</p>
        <h2 id="ledger-title">Every verdict, chained and signed.</h2>
        <p className="feature-copy">
          Every decision, release, expiry, and outcome is appended with its evidence: the action,
          the reason, and each policy&rsquo;s verdict. A retroactive edit anywhere in history
          breaks the chain.
        </p>
        <ul className="feature-points">
          {LEDGER_FACTS.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
      </div>
      <div className="card dark-panel">
        <div className="panel-head">
          <span>Recent records</span>
          <span className="panel-status">Valid chain</span>
        </div>
        <ol className="panel-rows">
          {LEDGER_ENTRIES.map(({ verdict, agent, intent }) => (
            <li className="ledger-row" key={`${verdict}-${agent}`}>
              <span className={`verdict verdict-${verdict}`}>{verdict}</span>
              <span>{agent}</span>
              <span>{intent}</span>
            </li>
          ))}
        </ol>
        <div className="panel-foot">
          <span>Head digest</span>
          <code>{LEDGER_HEAD_DIGEST}</code>
        </div>
      </div>
    </section>
  );
}
