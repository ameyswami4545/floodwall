import { createHashRouter, Navigate } from "react-router";
import { ConsoleLayout } from "./ConsoleLayout";
import { HoldPage } from "./pages/HoldPage";
import { IntentDetailPage } from "./pages/IntentDetailPage";
import { IntentsPage } from "./pages/IntentsPage";
import { LedgerPage } from "./pages/LedgerPage";
import { NewIntentPage } from "./pages/NewIntentPage";
import { OverviewPage } from "./pages/OverviewPage";
import { PoliciesPage } from "./pages/PoliciesPage";
import { PATHS } from "./paths";

// Hash routes, so every console URL is the one file /console/index.html and
// survives a direct visit or a refresh on GitHub Pages.
export const router = createHashRouter([
  {
    path: PATHS.overview,
    element: <ConsoleLayout />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: PATHS.intents, element: <IntentsPage /> },
      { path: PATHS.newIntent, element: <NewIntentPage /> },
      { path: PATHS.intent(":id"), element: <IntentDetailPage /> },
      { path: PATHS.hold, element: <HoldPage /> },
      { path: PATHS.ledger, element: <LedgerPage /> },
      { path: PATHS.policies, element: <PoliciesPage /> },
      { path: "*", element: <Navigate to={PATHS.overview} replace /> },
    ],
  },
]);
