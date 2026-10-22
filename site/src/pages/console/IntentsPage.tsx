import { Link, useSearchParams } from "react-router";
import { ConsoleBadge } from "../../components/console/ConsoleBadge";
import { ConsoleEmpty } from "../../components/console/ConsoleEmpty";
import { ConsolePageHeader } from "../../components/console/ConsolePageHeader";
import { ConsoleTable } from "../../components/console/ConsoleTable";
import { CONSOLE_PATHS, INTENT_COLUMNS, INTENT_FILTERS } from "../../constants/console";
import { describeAction } from "../../helpers/gate";
import { usePlane } from "../../hooks/usePlane";

export function IntentsPage() {
  const { state } = usePlane();
  const [params, setParams] = useSearchParams();
  const active = INTENT_FILTERS.find((f) => f.key === params.get("status")) ?? INTENT_FILTERS[0];
  const intents = state.intents
    .filter((i) => !active.statuses || active.statuses.includes(i.status))
    .sort((a, b) => b.id - a.id);

  return (
    <>
      <ConsolePageHeader
        title="Intents"
        description="Every change an agent has asked to make."
        actions={
          <Link className="console-button" to={CONSOLE_PATHS.newIntent}>
            Submit intent
          </Link>
        }
      />

      <div className="console-tabs" role="tablist">
        {INTENT_FILTERS.map((f) => (
          <button
            key={f.key}
            role="tab"
            aria-selected={f === active}
            onClick={() => setParams(f.key === "all" ? {} : { status: f.key })}
          >
            {f.label}
          </button>
        ))}
      </div>

      <section className="console-card flush">
        {intents.length === 0 ? (
          <ConsoleEmpty>No intents here.</ConsoleEmpty>
        ) : (
          <ConsoleTable columns={INTENT_COLUMNS}>
            {intents.map((intent) => (
              <tr key={intent.id}>
                <td className="console-mono">
                  <Link to={CONSOLE_PATHS.intent(intent.id)}>#{intent.id}</Link>
                </td>
                <td>{intent.agent}</td>
                <td>{describeAction(intent.action)}</td>
                <td>{intent.priority}</td>
                <td>{intent.blast}</td>
                <td>
                  <ConsoleBadge value={intent.status} />
                </td>
              </tr>
            ))}
          </ConsoleTable>
        )}
      </section>
    </>
  );
}
