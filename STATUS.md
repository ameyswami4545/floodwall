# STATUS - floodwall

Task ids refer to [GOALS.md](GOALS.md).

## Current state

v0.1 is shipped: the full wall in one zero-dependency crate. An `Intent`
flows through `Admission` (per-agent token bucket + bounded priority queue
with backpressure), into a deny-overrides policy `Gate`, and every verdict
lands in a tamper-evident hash-chained `Ledger`. The `Floodwall` type ties
the four together; a demo binary floods it with 4000 intents across five
agents to show admission control, gating, and the ledger holding up under
load. 20 unit tests + 1 doctest, fmt + clippy (`-D warnings`) clean,
pinned to Rust 1.95.

The floodwall.ai site (React + Vite in `site/`, built into `docs/` for
GitHub Pages) is live.

## Recently shipped

- **FW-101** - `robots.txt` and `sitemap.xml` now ship in `docs/`.
- **v0.1** - Intent model, admission control, policy gate, hash-chained
  ledger, end-to-end `Floodwall`, demo binary, CI (fmt / clippy / test /
  build), Dependabot (cargo + actions).

## In progress

- **v0.1.x hardening** - FW-102 to FW-106. FW-103 (`RateLimit`
  validation) and FW-105 (ledger evidence) come first: the first is a
  silent failure mode, and the second changes the `Record` shape before
  v0.3 builds on it.

## Next up

- **v0.2 scheduler** - FW-201 to FW-207: serialize wide-blast and
  same-resource intents, run independent narrow ones concurrently, detect
  `(resource, action)` conflicts, and hold deferred intents instead of
  dropping them.
- **v0.3 ledger** - FW-301 to FW-304: swap FNV-1a for a SHA-256 chain,
  sign records, add Merkle checkpoints and an export format.

## Known gaps

- A `Defer` verdict is recorded and then dropped; nothing re-queues it
  (FW-206).
- The ledger hash is FNV-1a, which detects accidents but not a motivated
  attacker (FW-301).
