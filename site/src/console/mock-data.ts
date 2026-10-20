// DUMMY DATA - throwaway. Stands in for the Rust plane until the console is
// wired to it. Delete this file once real data flows in.

import type { Intent, LedgerRecord, PolicyResult, PolicyVerdict } from "./types";

export const MOCK_AGENTS = ["reconciler-7", "deployer", "autoscaler", "migrator", "chaos-monkey"];

/** Mirrors ResourceAllowlist in src/policy.rs. */
export const MOCK_ALLOWLIST = ["web", "api", "cache", "worker"];

export const MOCK_POLICIES = [
  {
    name: "no-global-destroy",
    rule: "A destructive change with a Global blast radius is rejected.",
    verdict: "reject",
  },
  {
    name: "blast-needs-priority",
    rule: "Region and Global need Urgent or higher; Service needs Normal or higher.",
    verdict: "reject",
  },
  {
    name: "resource-allowlist",
    rule: `Resources off the list (${MOCK_ALLOWLIST.join(", ")}) are deferred to the hold queue.`,
    verdict: "defer",
  },
] as const;

const PRIORITY_RANK = { bulk: 0, normal: 1, urgent: 2, pager: 3 } as const;

/**
 * A fake gate: the three reference policies, re-done in TS, deny-overrides.
 * `waiveDeferrals` is what a human release does.
 */
export function mockGate(intent: Intent, waiveDeferrals = false): PolicyResult[] {
  const { action, blast, priority } = intent;
  const destructive = action.kind === "destroy" || (action.kind === "scale" && action.detail === "0");

  const needed = blast === "global" || blast === "region" ? "urgent" : blast === "service" ? "normal" : "bulk";

  const results: PolicyResult[] = [
    blast === "global" && destructive
      ? { policy: "no-global-destroy", verdict: "reject", reason: "destructive global change requires human sign-off" }
      : { policy: "no-global-destroy", verdict: "admit" },
    PRIORITY_RANK[priority] >= PRIORITY_RANK[needed]
      ? { policy: "blast-needs-priority", verdict: "admit" }
      : {
          policy: "blast-needs-priority",
          verdict: "reject",
          reason: `${blast} blast radius needs priority >= ${needed}, got ${priority}`,
        },
    MOCK_ALLOWLIST.includes(action.resource)
      ? { policy: "resource-allowlist", verdict: "admit" }
      : waiveDeferrals
        ? { policy: "resource-allowlist", verdict: "admit", reason: "deferral waived on release" }
        : { policy: "resource-allowlist", verdict: "defer", reason: `resource '${action.resource}' is not on the allowlist` },
  ];
  return results;
}

/** The harshest verdict wins. */
export function mockCombine(results: PolicyResult[]): PolicyVerdict {
  if (results.some((r) => r.verdict === "reject")) return "reject";
  if (results.some((r) => r.verdict === "defer")) return "defer";
  return "admit";
}

/** Not SHA-256: a stable-looking hex string so the ledger screen has digests to show. */
export function mockDigest(input: string): string {
  let out = "";
  let h = 2166136261;
  for (let round = 0; round < 8; round++) {
    for (let i = 0; i < input.length; i++) {
      h ^= input.charCodeAt(i) + round;
      h = Math.imul(h, 16777619) >>> 0;
    }
    out += h.toString(16).padStart(8, "0");
  }
  return out;
}

export const MOCK_INTENTS: Intent[] = [
  {
    id: 101,
    agent: "reconciler-7",
    action: { kind: "scale", resource: "web", detail: "5" },
    priority: "normal",
    blast: "service",
    status: "succeeded",
    submittedAt: 0,
  },
  {
    id: 102,
    agent: "deployer",
    action: { kind: "apply", resource: "billing", detail: "billing-v2" },
    priority: "normal",
    blast: "service",
    status: "held",
    submittedAt: 1,
  },
  {
    id: 103,
    agent: "chaos-monkey",
    action: { kind: "destroy", resource: "api" },
    priority: "pager",
    blast: "global",
    status: "rejected",
    submittedAt: 1,
  },
  {
    id: 104,
    agent: "autoscaler",
    action: { kind: "scale", resource: "cache", detail: "8" },
    priority: "urgent",
    blast: "service",
    status: "in-flight",
    submittedAt: 2,
  },
  {
    id: 105,
    agent: "migrator",
    action: { kind: "apply", resource: "api", detail: "schema-v12" },
    priority: "normal",
    blast: "service",
    status: "queued",
    submittedAt: 3,
  },
  {
    id: 106,
    agent: "reconciler-7",
    action: { kind: "apply", resource: "search", detail: "search-v4" },
    priority: "urgent",
    blast: "region",
    status: "queued",
    submittedAt: 3,
  },
  {
    id: 107,
    agent: "autoscaler",
    action: { kind: "scale", resource: "worker", detail: "12" },
    priority: "bulk",
    blast: "region",
    status: "queued",
    submittedAt: 4,
  },
];

// Seed the gated intents with their verdicts and a ledger that matches them.
for (const intent of MOCK_INTENTS) {
  if (intent.status !== "queued") intent.verdicts = mockGate(intent);
}

type SeedEvent = Omit<LedgerRecord, "seq" | "digest" | "prev">;

const SEED_EVENTS: SeedEvent[] = [
  { tick: 0, intentId: 101, agent: "reconciler-7", kind: "decision", verdict: "admit", summary: "scale web to 5" },
  { tick: 1, intentId: 102, agent: "deployer", kind: "decision", verdict: "defer", summary: "resource 'billing' is not on the allowlist" },
  { tick: 1, intentId: 103, agent: "chaos-monkey", kind: "decision", verdict: "reject", summary: "destructive global change requires human sign-off" },
  { tick: 2, intentId: 101, agent: "reconciler-7", kind: "outcome", summary: "succeeded" },
  { tick: 2, intentId: 104, agent: "autoscaler", kind: "decision", verdict: "admit", summary: "scale cache to 8" },
];

export function mockAppend(ledger: LedgerRecord[], event: SeedEvent): LedgerRecord[] {
  const prev = ledger.at(-1)?.digest ?? "0".repeat(64);
  const seq = ledger.length;
  return [...ledger, { ...event, seq, prev, digest: mockDigest(`${prev}|${seq}|${JSON.stringify(event)}`) }];
}

export const MOCK_LEDGER: LedgerRecord[] = SEED_EVENTS.reduce(mockAppend, [] as LedgerRecord[]);

export const MOCK_START_TICK = 5;
