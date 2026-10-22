import { Link } from "react-router";
import { ConsoleBadge } from "../../components/console/ConsoleBadge";
import { ConsolePageHeader } from "../../components/console/ConsolePageHeader";
import { ConsoleStat } from "../../components/console/ConsoleStat";
import { CONSOLE_PATHS, OVERVIEW_STATS } from "../../constants/console";
import { usePlane } from "../../hooks/usePlane";

export function OverviewPage() {
  const { state, dispatch } = usePlane();
  const hasQueued = state.intents.some((i) => i.status === "queued");
  const recent = state.ledger.slice(-5).reverse();

  return (
    <>
      <ConsolePageHeader
        title="Overview"
        description={`Logical tick ${state.tick}. Run a tick to gate everything in the queue.`}
        actions={
          <>
            <Link className="console-button secondary" to={CONSOLE_PATHS.newIntent}>
              Submit intent
            </Link>
            <button className="console-button" onClick={() => dispatch({ type: "tick" })} disabled={!hasQueued}>
              Run tick
            </button>
          </>
        }
      />

      <section className="console-stats">
        {OVERVIEW_STATS.map(({ label, hint, value }) => (
          <ConsoleStat key={label} label={label} value={value(state)} hint={hint} />
        ))}
      </section>

      <section className="console-card">
        <div className="console-card-head">
          <h2>Recent decisions</h2>
          <Link to={CONSOLE_PATHS.ledger}>Open ledger</Link>
        </div>
        <ul className="console-list">
          {recent.map((record) => (
            <li key={record.seq}>
              <Link to={CONSOLE_PATHS.intent(record.intentId)} className="console-row">
                <span className="console-mono console-muted">#{record.seq}</span>
                <span className="console-grow">
                  <strong>{record.agent}</strong>
                  <span className="console-muted"> · {record.summary}</span>
                </span>
                {record.verdict ? (
                  <ConsoleBadge value={record.verdict} />
                ) : (
                  <span className="console-muted">{record.kind}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
