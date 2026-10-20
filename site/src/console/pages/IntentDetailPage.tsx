import type { ReactNode } from "react";
import { Link, useParams } from "react-router";
import { Badge, Empty, PageHeader } from "../components";
import { PATHS } from "../paths";
import { OPERATOR, usePlane } from "../store";
import { describeAction, type IntentStatus } from "../types";

export function IntentDetailPage() {
  const { id } = useParams();
  const { state, dispatch } = usePlane();
  const intent = state.intents.find((i) => String(i.id) === id);

  if (!intent) {
    return (
      <>
        <PageHeader title="Intent not found" />
        <Link to={PATHS.intents}>Back to intents</Link>
      </>
    );
  }

  const history = state.ledger.filter((r) => r.intentId === intent.id);

  // What a person can do next depends on where the intent is in the flow.
  const nextSteps: Partial<Record<IntentStatus, ReactNode>> = {
    queued: (
      <button className="console-button" onClick={() => dispatch({ type: "tick" })}>
        Run tick
      </button>
    ),
    held: (
      <>
        <button className="console-button secondary" onClick={() => dispatch({ type: "expire", id: intent.id, by: OPERATOR })}>
          Expire
        </button>
        <button className="console-button" onClick={() => dispatch({ type: "release", id: intent.id, by: OPERATOR })}>
          Release
        </button>
      </>
    ),
    "in-flight": (
      <>
        <button
          className="console-button secondary"
          onClick={() => dispatch({ type: "complete", id: intent.id, outcome: "failed" })}
        >
          Report failed
        </button>
        <button
          className="console-button"
          onClick={() => dispatch({ type: "complete", id: intent.id, outcome: "succeeded" })}
        >
          Report succeeded
        </button>
      </>
    ),
  };

  return (
    <>
      <Link className="console-back" to={PATHS.intents}>
        ← Intents
      </Link>
      <PageHeader title={`Intent #${intent.id}`} description={describeAction(intent.action)} actions={nextSteps[intent.status]} />

      <section className="console-card">
        <dl className="console-facts">
          <div>
            <dt>Status</dt>
            <dd>
              <Badge value={intent.status} />
            </dd>
          </div>
          <div>
            <dt>Agent</dt>
            <dd>{intent.agent}</dd>
          </div>
          <div>
            <dt>Priority</dt>
            <dd>{intent.priority}</dd>
          </div>
          <div>
            <dt>Blast radius</dt>
            <dd>{intent.blast}</dd>
          </div>
          <div>
            <dt>Submitted</dt>
            <dd>tick {intent.submittedAt}</dd>
          </div>
          {intent.releasedBy && (
            <div>
              <dt>Released by</dt>
              <dd>{intent.releasedBy}</dd>
            </div>
          )}
        </dl>
      </section>

      <section className="console-card">
        <div className="console-card-head">
          <h2>Gate verdicts</h2>
          <span className="console-muted">Harshest verdict wins</span>
        </div>
        {intent.verdicts ? (
          <ul className="console-list">
            {intent.verdicts.map((v) => (
              <li key={v.policy} className="console-row">
                <span className="console-grow">
                  <code>{v.policy}</code>
                  {v.reason && <span className="console-muted"> · {v.reason}</span>}
                </span>
                <Badge value={v.verdict} />
              </li>
            ))}
          </ul>
        ) : (
          <Empty>Not gated yet. Run a tick to send it through the gate.</Empty>
        )}
      </section>

      <section className="console-card">
        <div className="console-card-head">
          <h2>Ledger history</h2>
        </div>
        {history.length ? (
          <ul className="console-list">
            {history.map((r) => (
              <li key={r.seq} className="console-row">
                <span className="console-mono console-muted">#{r.seq}</span>
                <span className="console-grow">
                  {r.kind} · {r.summary}
                </span>
                <span className="console-muted">tick {r.tick}</span>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>Nothing recorded yet.</Empty>
        )}
      </section>
    </>
  );
}
