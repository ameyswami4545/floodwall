import { createBrowserRouter, Navigate } from "react-router";
import App from "./App";
import { ConsoleLayout } from "./components/console/ConsoleLayout";
import { CONSOLE_PATHS } from "./constants/console";
import { HoldPage } from "./pages/console/HoldPage";
import { IntentDetailPage } from "./pages/console/IntentDetailPage";
import { IntentsPage } from "./pages/console/IntentsPage";
import { LedgerPage } from "./pages/console/LedgerPage";
import { NewIntentPage } from "./pages/console/NewIntentPage";
import { OverviewPage } from "./pages/console/OverviewPage";
import { PoliciesPage } from "./pages/console/PoliciesPage";

// "/" is the landing page. The console under /app is a dummy-data preview,
// reachable by URL only: nothing on the landing page links to it.
export const router = createBrowserRouter([
  { path: "/", element: <App /> },
  {
    path: CONSOLE_PATHS.overview,
    element: <ConsoleLayout />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: CONSOLE_PATHS.intents, element: <IntentsPage /> },
      { path: CONSOLE_PATHS.newIntent, element: <NewIntentPage /> },
      { path: CONSOLE_PATHS.intent(":id"), element: <IntentDetailPage /> },
      { path: CONSOLE_PATHS.hold, element: <HoldPage /> },
      { path: CONSOLE_PATHS.ledger, element: <LedgerPage /> },
      { path: CONSOLE_PATHS.policies, element: <PoliciesPage /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
