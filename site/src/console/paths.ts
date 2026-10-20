// Every console URL in one place, so links and the route table agree.

export const PATHS = {
  overview: "/app",
  intents: "/app/intents",
  newIntent: "/app/intents/new",
  intent: (id: number | string) => `/app/intents/${id}`,
  hold: "/app/hold",
  ledger: "/app/ledger",
  policies: "/app/policies",
} as const;
