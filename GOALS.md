# GOALS - floodwall

Sequenced milestones toward a control plane that makes high-volume,
agent-driven DevOps survivable. The throughline: agents generate change
faster than humans can review, so the system has to govern *throughput*,
not approve line items.

Every task has a stable `FW-` id so it can be referenced from issues, PRs,
and [STATUS.md](STATUS.md). Items marked *(new)* were added after v0.1
shipped, from a review of the v0.1 code and site.

## v0.1 - the wall ✦ **shipped**

- `Intent` model: attributed change with `Action`, `Priority`, `BlastRadius`.
- `Admission`: per-agent token-bucket rate limiting + bounded priority queue
  with backpressure. Logical-clock time, fully deterministic.
- `policy` + `Gate`: `Policy` trait, three reference policies
  (`NoGlobalDestroy`, `BlastNeedsPriority`, `ResourceAllowlist`), composed
  deny-overrides with a full per-policy breakdown.
- `Ledger`: append-only FNV-1a hash chain, `verify()` detects any edit.
- `Floodwall`: submit -> admit -> gate -> record end to end.
- Demo binary flooding the wall with 4000 intents across five agents.
- Tests: 20 unit + 1 doctest. fmt + clippy (`-D warnings`) clean.

## v0.1.x - hardening *(new)*

Small fixes found reviewing v0.1. None change the public model.

- **FW-101** Ship `robots.txt` and `sitemap.xml` to floodwall.ai: they were
  added to `site/public/` but `docs/` was never rebuilt.
- **FW-102** CI check that fails when `docs/` is out of date with a fresh
  `site/` build, so the published site cannot drift from its source again.
- **FW-103** Validate `RateLimit`: a `burst` below `1.0` means the bucket can
  never hold a whole token, so every intent from every agent is silently
  rate-limited. Reject non-finite, negative, or sub-1 bursts up front.
- **FW-104** Bound the per-agent bucket map. Buckets are never evicted, so a
  fleet that mints fresh agent ids grows memory without limit. Drop buckets
  that have refilled to `burst` and been idle past a horizon.
- **FW-105** Make ledger records carry the evidence: the verdict reason, the
  per-policy breakdown, and a summary of the action. Today a record holds
  only the `admit` / `defer` / `reject` label.
- **FW-106** Keep the site's hero stats (version, dependency and test counts)
  in step with the crate instead of hard-coding them.

## v0.2 - scheduler ◦ next

- **FW-201** A cooperative scheduler stage between admission and the gate,
  with its own API in `Floodwall`.
- **FW-202** Serialize intents with a wide blast radius (`Region`, `Global`).
- **FW-203** Run independent narrow intents concurrently, partitioned by the
  resource they target.
- **FW-204** Conflict detection on `(resource, action)` so two agents cannot
  apply contradictory changes in the same window.
- **FW-205** Per-resource in-flight limits.
- **FW-206** *(new)* A hold queue for deferred intents. A `Defer` is
  currently recorded and dropped, which makes it a reject in practice. Hold
  deferred intents and give a human a way to release or expire them.
- **FW-207** *(new)* Update the demo, README, and site for the scheduler.

## v0.3 - trustworthy ledger

- **FW-301** Replace FNV-1a with a SHA-256 chain (reuse the from-scratch
  primitive from `shunya`).
- **FW-302** Per-record signatures keyed by agent identity.
- **FW-303** Periodic Merkle checkpoints so a verifier can audit a suffix
  without replaying from genesis.
- **FW-304** *(new)* A plain export format (JSON Lines) so auditors can
  verify the chain with their own tooling.

## v0.4 - persistence + replay

- **FW-401** Durable, append-only ledger on disk.
- **FW-402** Rebuild full plane state (buckets, queue watermarks) from the
  ledger on restart.
- **FW-403** Property test: replay(record-stream) reproduces the live
  decisions.

## v0.5 - policy as code

- **FW-501** Declarative policy format so rules are data, not Rust.
- **FW-502** A worked OPA/Rego-style example evaluated at the gate.
- **FW-503** Policy bundles versioned and recorded in the ledger alongside
  verdicts.

## Later

- **FW-901** Backpressure signalling back to agents (a credit/quota
  protocol) so a well-behaved fleet self-throttles before it hits the wall.
- **FW-902** Distributed floodwall: shard by resource, gossip the ledger
  heads.
- **FW-903** Formal model (TLA+) of the admit/serialize/commit protocol with
  safety (no two conflicting changes commit) and liveness (every admitted
  intent eventually decides) obligations.
- **FW-904** *(new)* Observability: per-agent admit / defer / reject
  counters, queue depth, and rate-limit hits, exposed without adding a
  runtime dependency.
- **FW-905** *(new)* Throughput benchmarks for admission and the gate, so
  the scheduler and SHA-256 work can be measured against v0.1.
