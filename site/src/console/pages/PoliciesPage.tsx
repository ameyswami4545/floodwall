import { Badge, PageHeader } from "../components";
import { MOCK_ALLOWLIST, MOCK_POLICIES } from "../mock-data";

export function PoliciesPage() {
  return (
    <>
      <PageHeader title="Policies" description="The gate's policy stack, combined deny-overrides." />

      <section className="console-card flush">
        <ul className="console-list">
          {MOCK_POLICIES.map((p) => (
            <li key={p.name} className="console-row padded">
              <span className="console-grow">
                <code>{p.name}</code>
                <span className="console-sub">{p.rule}</span>
              </span>
              <Badge value={p.verdict} />
            </li>
          ))}
        </ul>
      </section>

      <section className="console-card">
        <div className="console-card-head">
          <h2>Resource allowlist</h2>
        </div>
        <div className="console-chips">
          {MOCK_ALLOWLIST.map((r) => (
            <span key={r} className="console-chip">
              {r}
            </span>
          ))}
        </div>
      </section>
    </>
  );
}
