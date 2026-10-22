import { Link, useParams } from "react-router";
import { ConsoleBadge } from "../../components/console/ConsoleBadge";
import { ConsoleEmpty } from "../../components/console/ConsoleEmpty";
import { ConsoleIntentSteps } from "../../components/console/ConsoleIntentSteps";
import { ConsolePageHeader } from "../../components/console/ConsolePageHeader";
import { CONSOLE_PATHS } from "../../constants/console";
import { describeAction } from "../../helpers/gate";
import { usePlane } from "../../hooks/usePlane";

export function IntentDetailPage() {
  const { id } = useParams();
  const { state } = usePlane();
  const intent = state.intents.find((i) => String(i.id) === id);

  if (!intent) {
    return (
      <>
        <ConsolePageHeader title="Intent not found" />
        <Link to={CONSOLE_PATHS.intents}>Back to intents</Link>
      </>
    );
  }

  const history = state.ledger.filter((r) => r.intentId === intent.id);
  const facts = [
    { label: "Status", value: <ConsoleBadge value={intent.status} /> },
    { label: "Agent", value: intent.agent },
    { label: "Priority", value: intent.priority },
    { label: "Blast radius", value: intent.blast },
    { label: "Submitted", value: `tick ${intent.submittedAt}` },
    ...(intent.releasedBy ? [{ label: "Released by", value: intent.releasedBy }] : []),
  ];

  return (
    <>
      <Link className="console-back" to={CONSOLE_PATHS.intents}>
        ← Intents
      </Link>
      <ConsolePageHeader
        title={`Intent #${intent.id}`}
        description={describeAction(intent.action)}
        actions={<ConsoleIntentSteps intent={intent} />}
      />

      <section className="console-card">
        <dl className="console-facts">
          {facts.map(({ label, value }) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
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
                <ConsoleBadge value={v.verdict} />
              </li>
            ))}
          </ul>
        ) : (
          <ConsoleEmpty>Not gated yet. Run a tick to send it through the gate.</ConsoleEmpty>
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
          <ConsoleEmpty>Nothing recorded yet.</ConsoleEmpty>
        )}
      </section>
    </>
  );
}
