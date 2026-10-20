import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from "react";
import {
  MOCK_INTENTS,
  MOCK_LEDGER,
  MOCK_START_TICK,
  mockAppend,
  mockCombine,
  mockGate,
} from "./mock-data";
import { describeAction, type Intent, type LedgerRecord } from "./types";

// In-memory plane state for the console. Every action here is a stand-in for
// a call into the Rust plane (submit, tick, release, expire, complete).

type State = { tick: number; intents: Intent[]; ledger: LedgerRecord[] };

type Event =
  | { type: "submit"; intent: Omit<Intent, "id" | "status" | "submittedAt"> }
  | { type: "tick" }
  | { type: "release"; id: number; by: string }
  | { type: "expire"; id: number; by: string }
  | { type: "complete"; id: number; outcome: "succeeded" | "failed" };

const INITIAL: State = { tick: MOCK_START_TICK, intents: MOCK_INTENTS, ledger: MOCK_LEDGER };

function update(state: State, id: number, patch: Partial<Intent>): Intent[] {
  return state.intents.map((intent) => (intent.id === id ? { ...intent, ...patch } : intent));
}

function gateOne(state: State, intent: Intent, releasedBy?: string): State {
  const verdicts = mockGate(intent, Boolean(releasedBy));
  const verdict = mockCombine(verdicts);
  const status = verdict === "admit" ? "in-flight" : verdict === "defer" ? "held" : "rejected";
  const summary = verdicts.find((v) => v.verdict === verdict && v.reason)?.reason ?? describeAction(intent.action);
  return {
    ...state,
    intents: update(state, intent.id, { status, verdicts, releasedBy }),
    ledger: mockAppend(state.ledger, {
      tick: state.tick,
      intentId: intent.id,
      agent: intent.agent,
      kind: "decision",
      verdict,
      summary,
    }),
  };
}

function reducer(state: State, event: Event): State {
  switch (event.type) {
    case "submit": {
      const id = Math.max(0, ...state.intents.map((i) => i.id)) + 1;
      const intent: Intent = { ...event.intent, id, status: "queued", submittedAt: state.tick };
      return { ...state, intents: [...state.intents, intent] };
    }
    case "tick": {
      const queued = state.intents.filter((i) => i.status === "queued");
      const next = queued.reduce((s, intent) => gateOne(s, intent), state);
      return { ...next, tick: state.tick + 1 };
    }
    case "release": {
      const intent = state.intents.find((i) => i.id === event.id);
      if (!intent || intent.status !== "held") return state;
      const released = {
        ...state,
        ledger: mockAppend(state.ledger, {
          tick: state.tick,
          intentId: intent.id,
          agent: intent.agent,
          kind: "release",
          summary: `released by ${event.by}`,
        }),
      };
      return gateOne(released, intent, event.by);
    }
    case "expire": {
      const intent = state.intents.find((i) => i.id === event.id);
      if (!intent || intent.status !== "held") return state;
      return {
        ...state,
        intents: update(state, intent.id, { status: "expired" }),
        ledger: mockAppend(state.ledger, {
          tick: state.tick,
          intentId: intent.id,
          agent: intent.agent,
          kind: "expiry",
          summary: `expired by ${event.by}`,
        }),
      };
    }
    case "complete": {
      const intent = state.intents.find((i) => i.id === event.id);
      if (!intent || intent.status !== "in-flight") return state;
      return {
        ...state,
        intents: update(state, intent.id, { status: event.outcome }),
        ledger: mockAppend(state.ledger, {
          tick: state.tick,
          intentId: intent.id,
          agent: intent.agent,
          kind: "outcome",
          summary: event.outcome,
        }),
      };
    }
  }
}

const PlaneContext = createContext<{ state: State; dispatch: Dispatch<Event> } | null>(null);

export function PlaneProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  return <PlaneContext.Provider value={{ state, dispatch }}>{children}</PlaneContext.Provider>;
}

export function usePlane() {
  const plane = useContext(PlaneContext);
  if (!plane) throw new Error("usePlane must be used inside <PlaneProvider>");
  return plane;
}

/** The operator name recorded on releases and expiries until there is auth. */
export const OPERATOR = "you";
