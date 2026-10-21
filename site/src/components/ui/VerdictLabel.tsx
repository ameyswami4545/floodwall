import type { Verdict } from "../../types";

type VerdictLabelProps = { verdict: Verdict; variant: "badge" | "text" };

/** A gate verdict colored by outcome, as a pill badge or plain text. */
export function VerdictLabel({ verdict, variant }: VerdictLabelProps) {
  const base = variant === "badge" ? "verdict-badge" : "verdict";
  return <span className={`${base} verdict-${verdict}`}>{verdict}</span>;
}
