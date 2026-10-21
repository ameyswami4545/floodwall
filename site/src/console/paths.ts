// Every console URL in one place, so links and the route table agree. They
// are hash routes (floodwall.ai/console/#/intents), because GitHub Pages
// serves plain files and has no fallback for a path it does not know.

export const PATHS = {
  overview: "/",
  intents: "/intents",
  newIntent: "/intents/new",
  intent: (id: number | string) => `/intents/${id}`,
  hold: "/hold",
  ledger: "/ledger",
  policies: "/policies",
} as const;
