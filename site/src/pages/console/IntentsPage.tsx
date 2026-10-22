import { Link, useSearchParams } from "react-router";
import { ConsoleBadge } from "../../components/console/ConsoleBadge";
import { ConsoleButton } from "../../components/console/ConsoleButton";
import { ConsoleEmpty } from "../../components/console/ConsoleEmpty";
import { ConsolePageHeader } from "../../components/console/ConsolePageHeader";
import { ConsoleTable } from "../../components/console/ConsoleTable";
import { CONSOLE_PATHS, INTENT_COLUMNS, INTENT_FILTERS } from "../../constants/console";
import { describeAction } from "../../helpers/gate";
import { usePlane } from "../../hooks/usePlane";
import { consoleCardFlush, consoleMono } from "../../styles/classes";

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
          <ConsoleButton to={CONSOLE_PATHS.newIntent}>Submit intent</ConsoleButton>
        }
      />

      <div className="flex gap-1 self-start rounded-xl bg-tint-hover p-1" role="tablist">
        {INTENT_FILTERS.map((f) => (
          <button
            key={f.key}
            role="tab"
            className="cursor-pointer rounded-lg [border:0] px-3.5 py-1.5 font-semibold text-ink-soft aria-selected:bg-surface aria-selected:text-ink aria-selected:shadow-[0_1px_2px_rgba(8,11,13,0.08)]"
            aria-selected={f === active}
            onClick={() => setParams(f.key === "all" ? {} : { status: f.key })}
          >
            {f.label}
          </button>
        ))}
      </div>

      <section className={consoleCardFlush}>
        {intents.length === 0 ? (
          <ConsoleEmpty>No intents here.</ConsoleEmpty>
        ) : (
          <ConsoleTable columns={INTENT_COLUMNS}>
            {intents.map((intent) => (
              <tr key={intent.id}>
                <td className={consoleMono}>
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
