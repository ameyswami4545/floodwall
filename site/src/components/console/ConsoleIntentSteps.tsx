import { INTENT_STEPS } from "../../constants/console";
import { usePlane } from "../../hooks/usePlane";
import type { Intent } from "../../types/console";

/** The buttons that move `intent` to its next step, if it has one. */
export function ConsoleIntentSteps({ intent }: { intent: Intent }) {
  const { dispatch } = usePlane();
  const steps = INTENT_STEPS[intent.status];
  if (!steps) return null;

  return (
    <span className="console-actions">
      {steps.map(({ label, secondary, event }) => (
        <button
          key={label}
          className={secondary ? "console-button secondary" : "console-button"}
          onClick={() => dispatch(event(intent.id))}
        >
          {label}
        </button>
      ))}
    </span>
  );
}
