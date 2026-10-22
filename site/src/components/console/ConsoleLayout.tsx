import { Link, NavLink, Outlet } from "react-router";
import { CONSOLE_NAV, CONSOLE_PATHS } from "../../constants/console";
import { usePlane } from "../../hooks/usePlane";
import { BrandMark } from "../shared/BrandMark";
import { PlaneProvider } from "./PlaneProvider";

function HoldCount() {
  const { state } = usePlane();
  const held = state.intents.filter((i) => i.status === "held").length;
  return held > 0 ? <span className="console-nav-count">{held}</span> : null;
}

export function ConsoleLayout() {
  return (
    <PlaneProvider>
      {/* React hoists this into <head>: the console is shared by URL, not meant for search. */}
      <meta name="robots" content="noindex, nofollow" />
      <div className="console">
        <aside className="console-sidebar">
          <Link className="console-brand" to="/">
            <BrandMark />
            <span>Floodwall</span>
          </Link>
          <nav className="console-nav" aria-label="Console">
            {CONSOLE_NAV.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end}>
                {label}
                {to === CONSOLE_PATHS.hold && <HoldCount />}
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
