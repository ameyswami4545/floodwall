import { LEDGER_ENTRIES, LEDGER_FACTS, LEDGER_HEAD_DIGEST } from "../../constants/landing";
import { DarkPanel } from "../shared/DarkPanel";
import { FeatureCard } from "../shared/FeatureCard";
import { VerdictLabel } from "../shared/VerdictLabel";

export function LandingLedgerSection() {
  return (
    <section
      className="section split-section split-section-reverse"
      id="ledger"
      aria-labelledby="ledger-title"
    >
      <FeatureCard
        kicker="Tamper-evident ledger"
        titleId="ledger-title"
        title="Every verdict, chained and signed."
        points={LEDGER_FACTS}
      >
        Every decision, release, expiry, and outcome is appended with its evidence: the action, the
        reason, and each policy&rsquo;s verdict. A retroactive edit anywhere in history breaks the
        chain.
      </FeatureCard>
      <DarkPanel
        title="Recent records"
        note="Valid chain"
        noteIsStatus
        footLabel="Head digest"
        footCode={LEDGER_HEAD_DIGEST}
      >
        <ol className="panel-rows">
          {LEDGER_ENTRIES.map(({ verdict, agent, intent }) => (
            <li className="ledger-row" key={`${verdict}-${agent}`}>
              <VerdictLabel verdict={verdict} variant="text" />
              <span>{agent}</span>
              <span>{intent}</span>
            </li>
          ))}
        </ol>
      </DarkPanel>
    </section>
  );
}
