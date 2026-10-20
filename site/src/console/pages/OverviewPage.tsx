import { Link } from "react-router";
import { Badge, PageHeader, Stat } from "../components";
import { PATHS } from "../paths";
import { usePlane } from "../store";

export function OverviewPage() {
  const { state, dispatch } = usePlane();
  const count = (status: string) => state.intents.filter((i) => i.status === status).length;
  const recent = state.ledger.slice(-5).reverse();

  return (
    <>
      <PageHeader
        title="Overview"
        description={`Logical tick ${state.tick}. Run a tick to gate everything in the queue.`}
        actions={
          <>
            <Link className="console-button secondary" to={PATHS.newIntent}>
              Submit intent
            </Link>
            <button className="console-button" onClick={() => dispatch({ type: "tick" })} disabled={!count("queued")}>
              Run tick
            </button>
          </>
        }
      />

      <section className="console-stats">
        <Stat label="Queued" value={count("queued")} hint="Waiting for the gate" />
        <Stat label="In flight" value={count("in-flight")} hint="Admitted, not reported back" />
        <Stat label="On hold" value={count("held")} hint="Deferred, needs a human" />
        <Stat label="Ledger records" value={state.ledger.length} hint="Hash-chained" />
      </section>

      <section className="console-card">
        <div className="console-card-head">
          <h2>Recent decisions</h2>
          <Link to={PATHS.ledger}>Open ledger</Link>
        </div>
        <ul className="console-list">
          {recent.map((record) => (
            <li key={record.seq}>
              <Link to={PATHS.intent(record.intentId)} className="console-row">
                <span className="console-mono console-muted">#{record.seq}</span>
                <span className="console-grow">
                  <strong>{record.agent}</strong>
                  <span className="console-muted"> · {record.summary}</span>
                </span>
                {record.verdict ? <Badge value={record.verdict} /> : <span className="console-muted">{record.kind}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
