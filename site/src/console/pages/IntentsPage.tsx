import { Link, useSearchParams } from "react-router";
import { Badge, Empty, PageHeader } from "../components";
import { PATHS } from "../paths";
import { usePlane } from "../store";
import { describeAction, type IntentStatus } from "../types";

const FILTERS: { key: string; label: string; statuses?: IntentStatus[] }[] = [
  { key: "all", label: "All" },
  { key: "queued", label: "Queued", statuses: ["queued"] },
  { key: "in-flight", label: "In flight", statuses: ["in-flight"] },
  { key: "held", label: "On hold", statuses: ["held"] },
  { key: "done", label: "Done", statuses: ["succeeded", "failed", "rejected", "expired"] },
];

export function IntentsPage() {
  const { state } = usePlane();
  const [params, setParams] = useSearchParams();
  const active = FILTERS.find((f) => f.key === params.get("status")) ?? FILTERS[0];
  const intents = state.intents
    .filter((i) => !active.statuses || active.statuses.includes(i.status))
    .sort((a, b) => b.id - a.id);

  return (
    <>
      <PageHeader
        title="Intents"
        description="Every change an agent has asked to make."
        actions={
          <Link className="console-button" to={PATHS.newIntent}>
            Submit intent
          </Link>
        }
      />

      <div className="console-tabs" role="tablist">
        {FILTERS.map((f) => (
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
          <Empty>No intents here.</Empty>
        ) : (
          <table className="console-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Agent</th>
                <th>Action</th>
                <th>Priority</th>
                <th>Blast</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {intents.map((intent) => (
                <tr key={intent.id}>
                  <td className="console-mono">
                    <Link to={PATHS.intent(intent.id)}>#{intent.id}</Link>
                  </td>
                  <td>{intent.agent}</td>
                  <td>{describeAction(intent.action)}</td>
                  <td>{intent.priority}</td>
                  <td>{intent.blast}</td>
                  <td>
                    <Badge value={intent.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
