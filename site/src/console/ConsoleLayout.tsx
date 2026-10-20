import { Link, NavLink, Outlet } from "react-router";
import { BrandMark } from "../components/BrandMark";
import { PATHS } from "./paths";
import { PlaneProvider, usePlane } from "./store";
import "./console.css";

const NAV = [
  { to: PATHS.overview, label: "Overview", end: true },
  { to: PATHS.intents, label: "Intents", end: false },
  { to: PATHS.hold, label: "Hold queue", end: false },
  { to: PATHS.ledger, label: "Ledger", end: false },
  { to: PATHS.policies, label: "Policies", end: false },
];

function HoldCount() {
  const { state } = usePlane();
  const held = state.intents.filter((i) => i.status === "held").length;
  return held > 0 ? <span className="console-nav-count">{held}</span> : null;
}

export function ConsoleLayout() {
  return (
    <PlaneProvider>
      <div className="console">
        <aside className="console-sidebar">
          <Link className="console-brand" to="/">
            <BrandMark />
            <span>Floodwall</span>
          </Link>
          <nav className="console-nav" aria-label="Console">
            {NAV.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end}>
                {label}
                {to === PATHS.hold && <HoldCount />}
              </NavLink>
            ))}
          </nav>
          <p className="console-sidebar-note">Dummy data. Nothing here touches a real plane.</p>
        </aside>
        <main className="console-main">
          <Outlet />
        </main>
      </div>
    </PlaneProvider>
  );
}
