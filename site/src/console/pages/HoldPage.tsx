import { Link } from "react-router";
import { Empty, PageHeader } from "../components";
import { PATHS } from "../paths";
import { OPERATOR, usePlane } from "../store";
import { describeAction } from "../types";

export function HoldPage() {
  const { state, dispatch } = usePlane();
  const held = state.intents.filter((i) => i.status === "held");

  return (
    <>
      <PageHeader
        title="Hold queue"
        description="Deferred intents wait here. Releasing waives their deferrals; rejections still apply."
      />

      <section className="console-card flush">
        {held.length === 0 ? (
          <Empty>Nothing on hold.</Empty>
        ) : (
          <ul className="console-list">
            {held.map((intent) => (
              <li key={intent.id} className="console-row padded">
                <span className="console-grow">
                  <Link to={PATHS.intent(intent.id)}>
                    <strong>#{intent.id}</strong> {describeAction(intent.action)}
                  </Link>
                  <span className="console-sub">
                    {intent.agent} ·{" "}
                    {intent.verdicts?.find((v) => v.verdict === "defer")?.reason ?? "deferred"}
                  </span>
                </span>
                <span className="console-actions">
                  <button
                    className="console-button secondary"
                    onClick={() => dispatch({ type: "expire", id: intent.id, by: OPERATOR })}
                  >
                    Expire
                  </button>
                  <button
                    className="console-button"
                    onClick={() => dispatch({ type: "release", id: intent.id, by: OPERATOR })}
                  >
                    Release
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
