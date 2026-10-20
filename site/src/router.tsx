import { createBrowserRouter, Navigate } from "react-router";
import { ConsoleLayout } from "./console/ConsoleLayout";
import { HoldPage } from "./console/pages/HoldPage";
import { IntentDetailPage } from "./console/pages/IntentDetailPage";
import { IntentsPage } from "./console/pages/IntentsPage";
import { LedgerPage } from "./console/pages/LedgerPage";
import { NewIntentPage } from "./console/pages/NewIntentPage";
import { OverviewPage } from "./console/pages/OverviewPage";
import { PoliciesPage } from "./console/pages/PoliciesPage";
import { LandingPage } from "./landing/LandingPage";

// "/" is the marketing page; the console lives under /app (see console/paths.ts).
export const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  {
    path: "/app",
    element: <ConsoleLayout />,
    children: [
      { index: true, element: <OverviewPage /> },
      {
        path: "intents",
        children: [
          { index: true, element: <IntentsPage /> },
          { path: "new", element: <NewIntentPage /> },
          { path: ":id", element: <IntentDetailPage /> },
        ],
      },
      { path: "hold", element: <HoldPage /> },
      { path: "ledger", element: <LedgerPage /> },
      { path: "policies", element: <PoliciesPage /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
