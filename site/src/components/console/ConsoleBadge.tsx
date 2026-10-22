import { STATUS_TONE } from "../../constants/console";
import { cx } from "../../helpers/cx";
import { consoleTone } from "../../styles/classes";
import type { Verdict } from "../../types";
import type { IntentStatus } from "../../types/console";

/** An intent status or gate verdict as a pill colored by tone. */
export function ConsoleBadge({ value }: { value: IntentStatus | Verdict }) {
  return (
    <span
      className={cx(
        "inline-block rounded-pill px-2.5 py-0.5 text-xs font-bold whitespace-nowrap",
        consoleTone[STATUS_TONE[value]],
      )}
    >
      {value}
    </span>
  );
}
