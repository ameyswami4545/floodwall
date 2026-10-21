import { GATE_POLICIES } from "../../constants/landing";
import { DarkPanel } from "../ui/DarkPanel";
import { FeatureCard } from "../ui/FeatureCard";
import { VerdictLabel } from "../ui/VerdictLabel";

export function LandingGateSection() {
  return (
    <section className="section split-section" id="gate" aria-labelledby="gate-title">
      <FeatureCard
        kicker="Policy gate"
        titleId="gate-title"
        title="One hard reject blocks the change."
      >
        Reference policies cover global destructive actions, blast-radius urgency, and resource
        allowlists. The policy trait stays small so teams can add rules that match their own release
        discipline. A deferred change is held, not dropped, until a human releases or expires it.
      </FeatureCard>
      <DarkPanel
        title="Reference policies"
        note="Harshest verdict wins"
        footLabel="Add your own"
        footCode="impl Policy for YourRule"
      >
        <ul className="panel-rows">
          {GATE_POLICIES.map(({ name, rule, verdict }) => (
            <li className="policy-row" key={name}>
              <div>
                <code>{name}</code>
                <p>{rule}</p>
              </div>
              <VerdictLabel verdict={verdict} variant="badge" />
            </li>
          ))}
        </ul>
      </DarkPanel>
    </section>
  );
}
