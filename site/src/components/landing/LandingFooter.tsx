import { FOOTER_GROUPS, PROTO_URL } from "../../constants/links";
import { FOOTER_POSTER_URL, HERO_VIDEO_URL } from "../../constants/media";
import { useVideoEligibility } from "../../hooks/useVideoEligibility";
import { AmbientVideo } from "../ui/AmbientVideo";
import { Kicker } from "../ui/Kicker";
import { LogoLink } from "../ui/LogoLink";
import { LandingFooterScene } from "./LandingFooterScene";

export function LandingFooter() {
  const canPlayVideo = useVideoEligibility();

  return (
    <footer className="site-footer">
      {canPlayVideo && (
        <AmbientVideo className="footer-video" src={HERO_VIDEO_URL} poster={FOOTER_POSTER_URL} />
      )}
      <LandingFooterScene />

      <div className="footer-content page-width">
        <div className="footer-main">
          <LogoLink>Floodwall</LogoLink>
          <Kicker>San Francisco Bay / production traffic</Kicker>
          <h2 className="display-heading">Built where fog meets production traffic.</h2>
          <p className="footer-lead">
            A bright control-plane surface for the moment agents start moving faster than human
            review queues.
          </p>
        </div>

        <nav className="footer-links" aria-label="Footer">
          {FOOTER_GROUPS.map(({ title, links }) => (
            <div key={title}>
              <h3>{title}</h3>
              <ul>
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <a href={href}>{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="footer-bottom">
          <strong>San Francisco Bay</strong>
          <span>
            &copy; {new Date().getFullYear()} Floodwall. An ERP.AI project. · Built with{" "}
            <a href={PROTO_URL}>Proto</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
