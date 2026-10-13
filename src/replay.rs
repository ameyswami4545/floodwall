//! Picking up where a plane left off, by replaying its ledger.
//!
//! A plane's ledger records everything that changes its state, each at the
//! tick it happened (see [`crate::ledger#time`]): every intent that got into
//! the queue (`queued`), every decision a [`tick`](Floodwall::tick) made
//! (`admit`, `defer`, `reject`, and the `expired` it wrote for an intent
//! held too long or evicted), every release and expiry by a human
//! (`released`, `expired`), and every outcome (`succeeded`, `failed`).
//! Calls that change nothing record nothing: a refused submission, a pass
//! that rules on nothing.
//!
//! So [`Floodwall::resume`] rebuilds a plane by replaying its ledger: it
//! makes the same calls, at the same ticks, on a freshly built plane with
//! the same configuration, and checks that each one writes exactly the
//! record the ledger holds, digest for digest. The result is the plane as
//! it was: the queue in order, each agent's rate-limit bucket, what is in
//! flight and since when, each resource's conflict claims, what is held and
//! why, which held intents were released and by whom, and the clock.
//!
//! ```
//! use floodwall::{Admission, Floodwall, Gate, Ledger, RateLimit};
//! use floodwall::intent::{Action, AgentId, BlastRadius, Intent, Priority};
//!
//! let plane = || Floodwall::new(Admission::new(64, RateLimit::new(4.0, 1.0)), Gate::new());
//! let scale = |id| Intent::new(
//!     id,
//!     AgentId::new("deployer"),
//!     Action::Scale { resource: format!("svc-{id}"), replicas: 2 },
//!     Priority::Normal,
//!     BlastRadius::Service,
//! );
//! let mut before = plane();
//! before.submit(scale(1), 0).unwrap();
//! before.tick(1); // svc-1 is in flight
//! before.submit(scale(2), 2).unwrap(); // svc-2 is queued
//!
//! // The plane stops. Another, built the same way, picks up from its ledger
//! // (a file, with `Ledger::open`, or here an export read back).
//! let mut export = Vec::new();
//! before.ledger().export_jsonl(&mut export).unwrap();
//! let after = plane().resume(Ledger::read_jsonl(&export[..]).unwrap()).unwrap();
//! assert_eq!(after.in_flight().count(), 1);
//! assert_eq!(after.pending(), 1);
//! assert_eq!(after.clock(), 2);
//! assert_eq!(after.ledger().head(), before.ledger().head());
//! ```
//!
//! # What must match
//!
//! The replayed plane must be built exactly as the one that wrote the
//! ledger: the same admission capacity and rate limit, the same gate (the
//! same policies, in the same order, deciding the same way), the same
//! scheduler and hold settings, and a keyring if it had one. Nothing about
//! the configuration is in the ledger. A difference that changes any
//! decision is caught, as [`ResumeError::Diverged`] at the first record
//! that comes out differently; a difference that changes no decision so far
//! is not, and takes effect from then on, as if the plane had been
//! reconfigured at the restart.
//!
//! Signatures are not checked again while replaying: each intent was
//! checked when it was first submitted, and an agent may have rotated its
//! key since (use [`Ledger::verify_signatures`] to audit them).
//!
//! # Crashes
//!
//! A call that records several things, a [`tick`](Floodwall::tick) ruling on
//! several intents, writes them all and then syncs once (see
//! [Durability](Floodwall#durability)), so a crash can leave only the first
//! few on disk. The call never returned, so nothing acted on it. A replay
//! reproduces those records, and since the call is deterministic, it
//! finishes it: the rest of its records are written to the ledger exactly
//! as the call would have written them. As after any restart, the caller
//! then learns what is in flight from [`Floodwall::in_flight`], including
//! anything admitted in that call. A call none of whose records reached the
//! disk never happened, as far as the plane is concerned.
//!
//! # The clock
//!
//! The resumed plane's clock is the tick of the last record. A call that
//! recorded nothing (a pass that ruled on nothing, a refused submission)
//! may have moved the clock further before the restart; that is not in the
//! ledger, and it changed nothing else, so no decision depends on it. It
//! only shows if the caller then passes a tick earlier than one it passed
//! before the restart, which the clock would otherwise have clamped.
//!
//! # What cannot be replayed
//!
//! A ledger written directly ([`Ledger::append`] and friends) rather than
//! by a plane, and a plane that started from an [`Admission`] that already
//! held intents, whose arrival is not in its ledger, cannot be resumed: the
//! first record a plane could not have written is reported as
//! [`ResumeError::Unreplayable`] or [`ResumeError::Diverged`].
//!
//! [`Admission`]: crate::Admission

use std::fmt;

use crate::intent::{Intent, IntentKey};
use crate::ledger::{Ledger, Record};
use crate::{Floodwall, Outcome, QUEUED};

/// Why [`Floodwall::resume`] could not pick up from a ledger.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum ResumeError {
    /// The plane has already queued or recorded something. Resume a plane
    /// that is newly built.
    NotFresh,
    /// The ledger does not verify ([`Ledger::verify`]).
    Unverified,
    /// Record `seq` is not one a plane writes, so there is nothing to
    /// replay it with.
    Unreplayable {
        /// The record's position in the ledger.
        seq: u64,
        /// What is wrong with it.
        why: String,
    },
    /// Replaying the ledger did not reproduce record `seq`: the plane is not
    /// configured like the one that wrote it, or the ledger holds a
    /// decision that plane would not have made.
    Diverged {
        /// The position of the first record that came out differently.
        seq: u64,
        /// The record the ledger holds there.
        expected: String,
        /// What the replay did instead.
        found: String,
    },
}

impl fmt::Display for ResumeError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ResumeError::NotFresh => f.write_str(
                "the plane has already queued or recorded something; resume a newly built plane",
            ),
            ResumeError::Unverified => f.write_str("the ledger does not verify"),
            ResumeError::Unreplayable { seq, why } => {
                write!(f, "record {seq} cannot be replayed: {why}")
            }
            ResumeError::Diverged {
                seq,
                expected,
                found,
            } => write!(
                f,
                "replaying the ledger did not reproduce record {seq}: it holds {expected}, \
                 but the replay {found}"
            ),
        }
    }
}

impl std::error::Error for ResumeError {}

/// A record, briefly, for [`ResumeError::Diverged`].
fn describe(r: &Record) -> String {
    let key = r.intent.as_ref().map_or_else(
        || format!("{}#{}", r.agent, r.intent_id),
        |i| i.key().to_string(),
    );
    format!("`{}` for {key} at tick {}", r.verdict, r.tick)
}

/// What the replay wrote in place of `want`, saying what differs when the
/// two read the same at a glance.
fn difference(want: &Record, got: &Record) -> String {
    let checks = |r: &Record| -> Vec<String> {
        r.evidence
            .policies
            .iter()
            .map(|(name, label)| format!("{name}={label}"))
            .collect()
    };
    if describe(want) != describe(got) {
        format!("wrote {}", describe(got))
    } else if want.evidence.policies != got.evidence.policies {
        format!(
            "wrote it with the checks {:?}, not {:?}",
            checks(got),
            checks(want)
        )
    } else if want.evidence.reason != got.evidence.reason {
        format!(
            "wrote it with the reason {:?}, not {:?}",
            got.evidence.reason, want.evidence.reason
        )
    } else {
        "wrote it differently".into()
    }
}

/// The call that wrote a record.
enum Call {
    Submit(Intent),
    Tick,
    Release(IntentKey, String),
    Expire(IntentKey, String),
    Complete(IntentKey, Outcome),
}

impl Floodwall {
    /// Pick up where a plane left off: replay `ledger` on this plane, which
    /// must be newly built with the same configuration as the plane that
    /// wrote it, and keep recording in `ledger` from there. See
    /// [`crate::replay`] for what is replayed and what must match.
    ///
    /// Set up `ledger` as the plane's ledger was: for a ledger file,
    /// [`Ledger::open`] it and set its checkpoint interval and signer again
    /// ([`Ledger::with_checkpoints`], [`Ledger::with_signer`]). An empty
    /// ledger is fine: resuming from it is [`Floodwall::with_ledger`].
    ///
    /// Fails with [`ResumeError::NotFresh`] if this plane has queued or
    /// recorded anything, [`ResumeError::Unverified`] if `ledger` does not
    /// verify, and [`ResumeError::Unreplayable`] or
    /// [`ResumeError::Diverged`] at the first record the replay cannot
    /// reproduce.
    ///
    /// If `ledger` ends partway through a call, as a crash during a
    /// [`tick`](Floodwall::tick) can leave it (see
    /// [Crashes](crate::replay#crashes)), the call is finished: its
    /// remaining records are written to `ledger` exactly as it would have
    /// written them.
    ///
    /// # Panics
    ///
    /// Panics if finishing a call needs to write to a ledger on disk and the
    /// write fails (see [Durability](Floodwall#durability)).
    pub fn resume(mut self, mut ledger: Ledger) -> Result<Floodwall, ResumeError> {
        if !self.ledger.is_empty() || !self.admission.is_empty() || !self.live.is_empty() {
            return Err(ResumeError::NotFresh);
        }
        if !ledger.verify() {
            return Err(ResumeError::Unverified);
        }
        // Replay into a ledger of our own, then compare.
        self.ledger = Ledger::new();
        let stored = ledger.records();
        let mut next = 0;
        while let Some(record) = stored.get(next) {
            let call = self.call_for(record)?;
            let written = self.ledger.len();
            let refused = self.replay(call, record.tick);
            let replayed = &self.ledger.records()[written..];
            if replayed.is_empty() {
                return Err(ResumeError::Diverged {
                    seq: record.seq,
                    expected: describe(record),
                    found: match refused {
                        Some(why) => why,
                        None => "wrote nothing".into(),
                    },
                });
            }
            // Past the end of the ledger, the call was cut short: it is
            // finished below.
            for (want, got) in stored[next..].iter().zip(replayed) {
                if want.digest != got.digest {
                    return Err(ResumeError::Diverged {
                        seq: want.seq,
                        expected: describe(want),
                        found: difference(want, got),
                    });
                }
            }
            next += replayed.len();
        }
        // Finish a call the ledger ends partway through.
        let stored = ledger.len();
        for r in &self.ledger.records()[stored.min(self.ledger.len())..] {
            let intent = r.intent.as_ref().expect("a plane only records intents");
            ledger.advance_clock(r.tick);
            let reason = r.evidence.reason.clone();
            let policies = r.evidence.policies.clone();
            if let Err(e) = ledger.write_intent(intent, &r.verdict, reason, policies, false) {
                crate::ledger::write_failed(e);
            }
        }
        if let Err(e) = ledger.sync() {
            crate::ledger::write_failed(e);
        }
        debug_assert_eq!(ledger.head(), self.ledger.head());
        self.ledger = ledger;
        Ok(self)
    }

    /// The call that wrote `record`, worked out from its verdict, its
    /// reason and, for a release, what is held now.
    fn call_for(&self, record: &Record) -> Result<Call, ResumeError> {
        let unreplayable = |why: &str| ResumeError::Unreplayable {
            seq: record.seq,
            why: why.into(),
        };
        let Some(intent) = &record.intent else {
            return Err(unreplayable(
                "it is not about an intent, so no plane wrote it",
            ));
        };
        let key = intent.key();
        let reason = record.evidence.reason.as_deref();
        Ok(match record.verdict.as_str() {
            QUEUED => Call::Submit(intent.clone()),
            "admit" | "defer" | "reject" => Call::Tick,
            "expired" => match reason.and_then(|r| r.strip_prefix("expired by ")) {
                Some(by) => Call::Expire(key, by.to_string()),
                // A TTL or eviction expiry, which a tick writes.
                None => Call::Tick,
            },
            "released" => {
                let by = self
                    .hold
                    .iter()
                    .find(|h| h.intent.key() == key)
                    .and_then(|held| {
                        let tail = format!("; held since tick {} for: {}", held.since, held.reason);
                        reason?.strip_prefix("released by ")?.strip_suffix(&tail)
                    });
                match by {
                    Some(by) => Call::Release(key, by.to_string()),
                    None => {
                        return Err(ResumeError::Diverged {
                            seq: record.seq,
                            expected: describe(record),
                            found: format!("does not hold {key} that way"),
                        })
                    }
                }
            }
            "succeeded" => Call::Complete(key, Outcome::Succeeded),
            "failed" => Call::Complete(key, Outcome::Failed(reason.unwrap_or("").to_string())),
            _ => return Err(unreplayable("no plane writes this verdict")),
        })
    }

    /// Make `call` at tick `now`. Returns why the plane refused it, if it
    /// did.
    fn replay(&mut self, call: Call, now: u64) -> Option<String> {
        match call {
            Call::Submit(intent) => {
                let now = self.advance(now);
                let key = intent.key();
                self.queue(intent, now)
                    .err()
                    .map(|e| format!("refused {key} at the door: {e:?}"))
            }
            Call::Tick => {
                self.tick(now);
                None
            }
            Call::Release(key, by) => self.release(&key, &by, now).err().map(|e| e.to_string()),
            Call::Expire(key, by) => self.expire(&key, &by, now).err().map(|e| e.to_string()),
            Call::Complete(key, outcome) => self
                .complete(&key, outcome, now)
                .err()
                .map(|e| e.to_string()),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::intent::{Action, AgentId, BlastRadius, Priority};
    use crate::policy::{NoGlobalDestroy, ResourceAllowlist};
    use crate::{
        Admission, Gate, HoldConfig, Keyring, RateLimit, Rejected, SchedulerConfig, SigningKey,
        Verdict,
    };

    fn key(agent: &str) -> SigningKey {
        SigningKey::from_seed(&[if agent == "a" { 1 } else { 2 }; 32])
    }

    fn keyring() -> Keyring {
        Keyring::new()
            .with("a", key("a").verifying_key())
            .with("b", key("b").verifying_key())
    }

    /// A plane that exercises everything: a fractional refill, a gate that
    /// rejects and defers, a conflict window, a small hold with a TTL, and
    /// signatures.
    fn plane() -> Floodwall {
        Floodwall::new(
            Admission::new(6, RateLimit::new(3.0, 0.5)),
            Gate::new()
                .with(NoGlobalDestroy)
                .with(ResourceAllowlist::new(["web", "api"])),
        )
        .with_scheduler(
            SchedulerConfig::default()
                .with_default_limit(2)
                .with_conflict_window(5),
        )
        .with_hold(HoldConfig::default().with_capacity(2).with_ttl(Some(6)))
        .with_keyring(keyring())
    }

    fn intent(agent: &str, id: u64, action: Action, blast: BlastRadius) -> Intent {
        let priority = if blast == BlastRadius::Global {
            Priority::Pager
        } else {
            Priority::Normal
        };
        Intent::new(id, AgentId::new(agent), action, priority, blast).signed(&key(agent))
    }

    fn scale(agent: &str, id: u64, resource: &str, replicas: u32) -> Intent {
        let action = Action::Scale {
            resource: resource.into(),
            replicas,
        };
        intent(agent, id, action, BlastRadius::Service)
    }

    #[derive(Clone)]
    enum Op {
        Submit(Intent, u64),
        Tick(u64),
        Complete(&'static str, u64, bool, u64),
        Release(&'static str, u64, u64),
        Expire(&'static str, u64, u64),
    }

    /// A day at the wall: arrivals, refusals at the door, admits, defers
    /// (the allowlist and a conflict), a rejection, an eviction from a full
    /// hold, a release, an operator's expiry, a TTL expiry, and outcomes of
    /// both kinds.
    fn script() -> Vec<Op> {
        use Op::*;
        let destroy_all = intent(
            "a",
            3,
            Action::Destroy {
                resource: "web".into(),
            },
            BlastRadius::Global,
        );
        vec![
            Submit(scale("a", 1, "web", 2), 0),
            Submit(scale("a", 2, "cache", 2), 0), // off the allowlist
            Submit(scale("b", 1, "web", 5), 0),   // contradicts a#1
            Submit(destroy_all, 0),               // rejected by the gate
            Submit(scale("a", 4, "api", 1), 0),   // rate-limited: no token left
            Submit(scale("a", 1, "web", 2), 0),   // a duplicate
            Tick(1),
            Submit(scale("b", 2, "db", 1), 1), // off the allowlist: evicts a#2
            Tick(2),
            Complete("a", 1, true, 3),
            Release("b", 1, 4),
            Submit(scale("a", 4, "api", 1), 4), // refilled by now
            Submit(scale("a", 5, "cache", 1), 4),
            Submit(scale("a", 6, "api", 2), 4), // rate-limited again
            Tick(4),
            Expire("b", 2, 6),
            Complete("b", 1, false, 7),
            Complete("a", 4, true, 7),
            Tick(8),
            Tick(12), // a#5 has been held for the TTL
            Submit(scale("b", 3, "api", 3), 12),
            Tick(12),
        ]
    }

    /// Run `op` and say what happened, so two planes can be compared call
    /// by call.
    fn run(p: &mut Floodwall, op: &Op) -> String {
        match op {
            Op::Submit(i, now) => format!("{:?}", p.submit(i.clone(), *now)),
            Op::Tick(now) => {
                let r = p.tick(*now);
                let decided: Vec<String> = r
                    .decisions
                    .iter()
                    .map(|d| format!("{} {}", d.intent.key(), d.verdict.label()))
                    .collect();
                let expired: Vec<String> = r
                    .expired
                    .iter()
                    .map(|h| h.intent.key().to_string())
                    .collect();
                format!("{decided:?} {expired:?}")
            }
            Op::Complete(agent, id, ok, now) => {
                let outcome = if *ok {
                    Outcome::Succeeded
                } else {
                    Outcome::Failed("rollout failed".into())
                };
                let key = IntentKey::new(*agent, *id);
                format!("{:?}", p.complete(&key, outcome, *now).map(|i| i.key()))
            }
            Op::Release(agent, id, now) => {
                format!(
                    "{:?}",
                    p.release(&IntentKey::new(*agent, *id), "operator", *now)
                )
            }
            Op::Expire(agent, id, now) => {
                let key = IntentKey::new(*agent, *id);
                format!(
                    "{:?}",
                    p.expire(&key, "operator", *now).map(|h| h.intent.key())
                )
            }
        }
    }

    /// Everything about a plane its methods show, but its clock.
    fn state(p: &Floodwall) -> String {
        let queued: Vec<IntentKey> = p.queued().map(Intent::key).collect();
        let in_flight: Vec<(IntentKey, u64)> =
            p.in_flight().map(|f| (f.intent.key(), f.since)).collect();
        let held: Vec<(IntentKey, u64, String)> = p
            .held()
            .map(|h| (h.intent.key(), h.since, h.reason.clone()))
            .collect();
        format!(
            "queued {queued:?} in flight {in_flight:?} held {held:?} head {}",
            p.ledger().head()
        )
    }

    fn reread(l: &Ledger) -> Ledger {
        let mut out = Vec::new();
        l.export_jsonl(&mut out).unwrap();
        Ledger::read_jsonl(&out[..]).unwrap()
    }

    #[test]
    fn the_script_covers_every_kind_of_record() {
        let mut p = plane();
        let results: Vec<String> = script().iter().map(|op| run(&mut p, op)).collect();
        assert!(results.contains(&"Err(RateLimited)".to_string()));
        assert!(results.contains(&"Err(Duplicate)".to_string()));
        let records = p.ledger().records();
        let has = |verdict: &str, reason: &str| {
            records.iter().any(|r| {
                r.verdict == verdict
                    && r.evidence
                        .reason
                        .as_deref()
                        .unwrap_or("")
                        .starts_with(reason)
            })
        };
        assert!(has(QUEUED, ""));
        assert!(has("admit", ""));
        assert!(has("defer", "resource 'cache'"));
        assert!(has("defer", "contradicts"));
        assert!(has("reject", ""));
        assert!(has("expired", "evicted"));
        assert!(has("expired", "held since"));
        assert!(has("expired", "expired by operator"));
        assert!(has("released", "released by operator"));
        assert!(has("succeeded", ""));
        assert!(has("failed", "rollout failed"));
        assert!(records
            .windows(2)
            .any(|w| w[0].tick == w[1].tick && w[0].verdict != QUEUED && w[1].verdict != QUEUED));
    }

    /// Stop the plane after any call, pick up from its ledger on a new
    /// plane, and carry on: every later call does exactly what it did
    /// without the restart, so everything the plane holds, rate-limit
    /// buckets and conflict claims included, came back.
    #[test]
    fn a_plane_picks_up_exactly_where_it_left_off() {
        let ops = script();
        let mut whole = plane();
        let want: Vec<String> = ops.iter().map(|op| run(&mut whole, op)).collect();
        for stop in 0..=ops.len() {
            let mut before = plane();
            for op in &ops[..stop] {
                run(&mut before, op);
            }
            let mut after = plane()
                .resume(reread(before.ledger()))
                .unwrap_or_else(|e| panic!("stopping after {stop} calls: {e}"));
            assert_eq!(state(&after), state(&before), "stopping after {stop} calls");
            // The clock comes back as the last record's tick: a call that
            // recorded nothing may have moved it further (see "The clock").
            assert_eq!(after.clock(), before.ledger().clock());
            assert!(after.clock() <= before.clock());
            for (n, op) in ops.iter().enumerate().skip(stop) {
                assert_eq!(
                    run(&mut after, op),
                    want[n],
                    "stopping after {stop}, call {n}"
                );
            }
            assert_eq!(state(&after), state(&whole), "stopping after {stop} calls");
            assert_eq!(after.clock(), whole.clock());
        }
    }

    #[test]
    fn a_ledger_file_restarts_a_plane() {
        let dir = std::env::temp_dir().join(format!("floodwall-resume-{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&dir);
        std::fs::create_dir_all(&dir).unwrap();
        let path = dir.join("ledger.jsonl");
        let signer = SigningKey::from_seed(&[9; 32]);
        let ops = script();
        let mut whole = plane().with_ledger(Ledger::new().with_checkpoints(4));
        for op in &ops {
            run(&mut whole, op);
        }
        let mut p = plane().with_ledger(
            Ledger::create(&path)
                .unwrap()
                .with_checkpoints(4)
                .with_signer(signer.clone()),
        );
        for (n, op) in ops.iter().enumerate() {
            run(&mut p, op);
            if n % 5 == 4 {
                // A restart: the file is closed, reopened and replayed.
                drop(p);
                let ledger = Ledger::open(&path)
                    .unwrap()
                    .with_checkpoints(4)
                    .with_signer(signer.clone());
                p = plane().resume(ledger).unwrap();
            }
        }
        assert_eq!(state(&p), state(&whole));
        let mut bytes = Vec::new();
        p.ledger().export_jsonl(&mut bytes).unwrap();
        drop(p);
        assert_eq!(std::fs::read(&path).unwrap(), bytes);
        let reopened = Ledger::open(&path).unwrap();
        assert_eq!(
            reopened.verify_checkpoint_signatures(&signer.verifying_key()),
            Ok(reopened.checkpoints().len())
        );
        drop(reopened);
        std::fs::remove_dir_all(&dir).unwrap();
    }

    #[test]
    fn a_tick_cut_short_by_a_crash_is_finished() {
        // A tick that rules on several intents, then a crash that leaves
        // only its first decision on disk.
        let mut whole = plane();
        let ops = [
            Op::Submit(scale("a", 1, "web", 2), 0),
            Op::Submit(scale("a", 2, "api", 2), 0),
            Op::Submit(scale("b", 1, "cache", 2), 0),
            Op::Tick(1),
        ];
        for op in &ops {
            run(&mut whole, op);
        }
        assert_eq!(whole.ledger().len(), 6);
        let mut cut = Ledger::new();
        for r in &whole.ledger().records()[..4] {
            cut.advance_clock(r.tick);
            cut.append_intent(
                r.intent.as_ref().unwrap(),
                &r.verdict,
                r.evidence.reason.clone(),
                r.evidence.policies.clone(),
            );
        }
        let resumed = plane().resume(cut).unwrap();
        assert_eq!(state(&resumed), state(&whole));
        assert_eq!(resumed.ledger().len(), 6);
        assert_eq!(resumed.in_flight().count(), 2);
    }

    #[test]
    fn resuming_needs_a_new_plane() {
        let mut used = plane();
        used.submit(scale("a", 1, "web", 2), 0).unwrap();
        assert_eq!(
            used.resume(Ledger::new()).err(),
            Some(ResumeError::NotFresh)
        );
        let mut adopting = Admission::new(4, RateLimit::new(3.0, 1.0));
        adopting.submit(scale("a", 1, "web", 2), 0).unwrap();
        let p = Floodwall::new(adopting, Gate::new());
        assert_eq!(p.resume(Ledger::new()).err(), Some(ResumeError::NotFresh));
        // An empty ledger is just a ledger to start from.
        let p = plane().resume(Ledger::new()).unwrap();
        assert!(p.ledger().is_empty());
    }

    fn refused(result: Result<Floodwall, ResumeError>) -> ResumeError {
        match result {
            Err(e) => e,
            Ok(_) => panic!("resumed"),
        }
    }

    /// Rebuild `ledger`'s records into a new ledger, changing record `at`.
    fn forge(ledger: &Ledger, at: usize, verdict: &str) -> Ledger {
        let mut forged = Ledger::new();
        for (n, r) in ledger.records().iter().enumerate() {
            forged.advance_clock(r.tick);
            let verdict = if n == at { verdict } else { r.verdict.as_str() };
            forged.append_intent(
                r.intent.as_ref().unwrap(),
                verdict,
                r.evidence.reason.clone(),
                r.evidence.policies.clone(),
            );
        }
        assert!(forged.verify());
        forged
    }

    #[test]
    fn a_ledger_the_plane_would_not_have_written_is_refused() {
        let mut p = plane();
        for op in script() {
            run(&mut p, &op);
        }
        let ledger = p.ledger();
        // A consistent ledger with one decision changed: the chain verifies,
        // but replaying it does not reproduce it.
        let first_admit = ledger
            .records()
            .iter()
            .position(|r| r.verdict == "admit")
            .unwrap();
        let seq = first_admit as u64;
        match plane().resume(forge(ledger, first_admit, "reject")) {
            Err(ResumeError::Diverged {
                seq: s,
                expected,
                found,
            }) => {
                assert_eq!(s, seq);
                assert_eq!(expected, "`reject` for a#1 at tick 1");
                assert_eq!(found, "wrote `admit` for a#1 at tick 1");
            }
            Err(other) => panic!("{other:?}"),
            Ok(_) => panic!("a forged decision was replayed"),
        }
        // A plane built differently: without the allowlist, its very first
        // decision is made without that check.
        let lax = Floodwall::new(
            Admission::new(6, RateLimit::new(3.0, 0.5)),
            Gate::new().with(NoGlobalDestroy),
        )
        .with_scheduler(
            SchedulerConfig::default()
                .with_default_limit(2)
                .with_conflict_window(5),
        )
        .with_hold(HoldConfig::default().with_capacity(2).with_ttl(Some(6)))
        .with_keyring(keyring());
        let err = refused(lax.resume(reread(ledger)));
        assert_eq!(
            err,
            ResumeError::Diverged {
                seq: 4,
                expected: "`reject` for a#3 at tick 1".into(),
                found: "wrote it with the checks [\"no-global-destroy=reject\", \
                        \"agent-signature=admit\", \"conflict-window=admit\"], not \
                        [\"no-global-destroy=reject\", \"resource-allowlist=admit\", \
                        \"agent-signature=admit\", \"conflict-window=admit\"]"
                    .into(),
            }
        );
        // A smaller queue turns an arrival away.
        // Without its keyring, the plane makes the same first decision but
        // without the signature check, and says so.
        let unkeyed = Floodwall::new(
            Admission::new(6, RateLimit::new(3.0, 0.5)),
            Gate::new()
                .with(NoGlobalDestroy)
                .with(ResourceAllowlist::new(["web", "api"])),
        );
        match refused(unkeyed.resume(reread(ledger))) {
            ResumeError::Diverged {
                expected, found, ..
            } => {
                assert_eq!(expected, "`reject` for a#3 at tick 1");
                assert!(
                    found.starts_with("wrote it with the checks [")
                        && found.contains("conflict-window=admit\"], not [")
                        && found.ends_with("\"agent-signature=admit\", \"conflict-window=admit\"]"),
                    "{found}"
                );
            }
            other => panic!("{other:?}"),
        }
        let small = Floodwall::new(Admission::new(1, RateLimit::new(3.0, 0.5)), Gate::new());
        let err = refused(small.resume(reread(ledger)));
        assert_eq!(
            err,
            ResumeError::Diverged {
                seq: 1,
                expected: "`queued` for a#2 at tick 0".into(),
                found: "refused a#2 at the door: Backpressure".into(),
            }
        );
        assert_eq!(
            err.to_string(),
            "replaying the ledger did not reproduce record 1: it holds `queued` for a#2 at \
             tick 0, but the replay refused a#2 at the door: Backpressure"
        );
        // A decision with nothing to decide.
        let held = ledger
            .records()
            .iter()
            .position(|r| r.verdict == "released")
            .unwrap();
        let err = refused(plane().resume(forge(ledger, held, "admit")));
        assert!(matches!(err, ResumeError::Diverged { .. }), "{err}");
    }

    #[test]
    fn records_no_plane_writes_cannot_be_replayed() {
        let mut direct = Ledger::new();
        direct.append(1, "ops", "released");
        assert_eq!(
            plane().resume(direct).err(),
            Some(ResumeError::Unreplayable {
                seq: 0,
                why: "it is not about an intent, so no plane wrote it".into()
            })
        );
        let mut odd = Ledger::new();
        odd.append_intent(&scale("a", 1, "web", 2), "maybe", None, vec![]);
        let err = refused(plane().resume(odd));
        assert_eq!(
            err.to_string(),
            "record 0 cannot be replayed: no plane writes this verdict"
        );
        // A ledger that does not verify is not replayed at all.
        let mut broken = Ledger::new().with_checkpoints(1);
        broken.append_intent(&scale("a", 1, "web", 2), QUEUED, None, vec![]);
        broken.checkpoints_mut()[0].root.0[0] ^= 1;
        assert_eq!(plane().resume(broken).err(), Some(ResumeError::Unverified));
        assert_eq!(
            ResumeError::NotFresh.to_string(),
            "the plane has already queued or recorded something; resume a newly built plane"
        );
    }

    #[test]
    fn a_rotated_key_does_not_stop_a_restart() {
        let mut p = plane();
        p.submit(scale("a", 1, "web", 2), 0).unwrap();
        p.tick(1);
        // "a" rotates to a new key; the old one is kept for audits only.
        let new_key = SigningKey::from_seed(&[42; 32]);
        let rotated = Keyring::new()
            .with("a", new_key.verifying_key())
            .with("b", key("b").verifying_key())
            .with_retired("a", key("a").verifying_key());
        let mut q = plane()
            .with_keyring(rotated.clone())
            .resume(reread(p.ledger()))
            .unwrap();
        assert_eq!(q.in_flight().count(), 1);
        assert_eq!(q.ledger().verify_signatures(&rotated), Ok(2));
        // New submissions need the new key.
        assert_eq!(
            q.submit(scale("a", 2, "api", 2), 2),
            Err(Rejected::BadSignature)
        );
        let fresh = Intent::new(
            2,
            AgentId::new("a"),
            Action::Destroy {
                resource: "api".into(),
            },
            Priority::Normal,
            BlastRadius::Cell,
        )
        .signed(&new_key);
        assert_eq!(q.submit(fresh, 2), Ok(()));
        assert!(matches!(q.tick(3).decisions[0].verdict, Verdict::Admit));
    }
}
