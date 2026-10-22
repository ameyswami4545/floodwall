import { ConsoleBadge } from "../../components/console/ConsoleBadge";
import { ConsolePageHeader } from "../../components/console/ConsolePageHeader";
import { MOCK_ALLOWLIST, MOCK_POLICIES } from "../../constants/console-mock";
import { cx } from "../../helpers/cx";
import {
  consoleCard,
  consoleCardFlush,
  consoleCardHead,
  consoleCardTitle,
  consoleGrow,
  consoleList,
  consoleMono,
  consoleRowPadded,
  consoleSub,
} from "../../styles/classes";

export function PoliciesPage() {
  return (
    <>
      <ConsolePageHeader title="Policies" description="The gate's policy stack, combined deny-overrides." />

      <section className={consoleCardFlush}>
        <ul className={consoleList}>
          {MOCK_POLICIES.map((p) => (
            <li key={p.name} className={consoleRowPadded}>
              <span className={consoleGrow}>
                <code>{p.name}</code>
                <span className={consoleSub}>{p.rule}</span>
              </span>
              <ConsoleBadge value={p.verdict} />
            </li>
          ))}
        </ul>
      </section>

      <section className={consoleCard}>
        <div className={consoleCardHead}>
          <h2 className={consoleCardTitle}>Resource allowlist</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {MOCK_ALLOWLIST.map((r) => (
            <span key={r} className={cx(consoleMono, "rounded-pill border border-line px-3 py-1")}>
              {r}
            </span>
          ))}
        </div>
      </section>
    </>
  );
}
