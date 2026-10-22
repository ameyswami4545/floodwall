import { cx } from "../../helpers/cx";
import type { Verdict } from "../../types";

type VerdictLabelProps = { verdict: Verdict; variant: "badge" | "text" };

/** Each verdict's color, shared by the ledger's text labels and the gate's badges. */
const COLOR: Record<Verdict, string> = {
  admit: "[--verdict:var(--color-admit)]",
  defer: "[--verdict:var(--color-defer)]",
  reject: "[--verdict:var(--color-reject)]",
};

const VARIANT = {
  text: "font-bold text-(--verdict)",
  badge: cx(
    "flex-none rounded-pill border px-2.5 py-0.5 text-xs leading-normal font-bold tracking-[0.04em] text-(--verdict) uppercase",
    "border-[color-mix(in_srgb,var(--verdict)_36%,transparent)] bg-[color-mix(in_srgb,var(--verdict)_14%,transparent)]",
  ),
};

/** A gate verdict colored by outcome, as a pill badge or plain text. */
export function VerdictLabel({ verdict, variant }: VerdictLabelProps) {
  return <span className={cx(COLOR[verdict], VARIANT[variant])}>{verdict}</span>;
}
