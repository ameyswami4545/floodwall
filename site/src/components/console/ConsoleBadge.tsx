import { Badge } from "../ui/badge";
import { STATUS_TONE } from "../../constants/console";
import { consoleTone } from "../../styles/classes";
import type { Verdict } from "../../types";
import type { IntentStatus } from "../../types/console";

/** An intent status or gate verdict as shadcn's Badge, colored by tone. */
export function ConsoleBadge({ value }: { value: IntentStatus | Verdict }) {
  return <Badge className={consoleTone[STATUS_TONE[value]]}>{value}</Badge>;
}
