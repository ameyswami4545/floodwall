import { Link } from "react-router";
import { ConsoleEmpty } from "../../components/console/ConsoleEmpty";
import { ConsoleIntentSteps } from "../../components/console/ConsoleIntentSteps";
import { ConsolePageHeader } from "../../components/console/ConsolePageHeader";
import { CONSOLE_PATHS } from "../../constants/console";
import { describeAction } from "../../helpers/gate";
import { usePlane } from "../../hooks/usePlane";

export function HoldPage() {
  const { state } = usePlane();
  const held = state.intents.filter((i) => i.status === "held");

  return (
    <>
      <ConsolePageHeader
        title="Hold queue"
        description="Deferred intents wait here. Releasing waives their deferrals; rejections still apply."
      />

      <section className="console-card flush">
        {held.length === 0 ? (
          <ConsoleEmpty>Nothing on hold.</ConsoleEmpty>
        ) : (
          <ul className="console-list">
            {held.map((intent) => (
              <li key={intent.id} className="console-row padded">
                <span className="console-grow">
                  <Link to={CONSOLE_PATHS.intent(intent.id)}>
                    <strong>#{intent.id}</strong> {describeAction(intent.action)}
                  </Link>
                  <span className="console-sub">
                    {intent.agent} · {intent.verdicts?.find((v) => v.verdict === "defer")?.reason ?? "deferred"}
                  </span>
                </span>
                <ConsoleIntentSteps intent={intent} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
