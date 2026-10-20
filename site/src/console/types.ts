// Console-side shapes of the crate's types (src/intent.rs, src/policy.rs,
// src/ledger.rs), trimmed to what the screens show.

export type ActionKind = "apply" | "scale" | "destroy";
export type Priority = "bulk" | "normal" | "urgent" | "pager";
export type BlastRadius = "cell" | "service" | "region" | "global";
export type PolicyVerdict = "admit" | "defer" | "reject";

export type IntentStatus =
  | "queued"
  | "in-flight"
  | "held"
  | "rejected"
  | "expired"
  | "succeeded"
  | "failed";

export type Action = {
  kind: ActionKind;
  resource: string;
  /** Manifest for apply, replica count for scale. */
  detail?: string;
};

export type PolicyResult = { policy: string; verdict: PolicyVerdict; reason?: string };

export type Intent = {
  id: number;
  agent: string;
  action: Action;
  priority: Priority;
  blast: BlastRadius;
  status: IntentStatus;
  submittedAt: number;
  verdicts?: PolicyResult[];
  releasedBy?: string;
};

export type LedgerRecord = {
  seq: number;
  tick: number;
  intentId: number;
  agent: string;
  kind: "decision" | "release" | "expiry" | "outcome";
  verdict?: PolicyVerdict;
  summary: string;
  prev: string;
  digest: string;
};

export const PRIORITIES: Priority[] = ["bulk", "normal", "urgent", "pager"];
export const BLAST_RADII: BlastRadius[] = ["cell", "service", "region", "global"];
export const ACTION_KINDS: ActionKind[] = ["apply", "scale", "destroy"];

export function describeAction({ kind, resource, detail }: Action) {
  if (kind === "scale") return `scale ${resource} to ${detail ?? "?"}`;
  if (kind === "apply") return `apply ${detail ?? "manifest"} to ${resource}`;
  return `destroy ${resource}`;
}
