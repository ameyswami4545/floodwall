import { STATUS_TONE } from "../../constants/console";
import type { Verdict } from "../../types";
import type { IntentStatus } from "../../types/console";

/** An intent status or gate verdict as a pill colored by tone. */
export function ConsoleBadge({ value }: { value: IntentStatus | Verdict }) {
  return <span className={`console-badge tone-${STATUS_TONE[value]}`}>{value}</span>;
}
