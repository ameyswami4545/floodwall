import { FOOTER_GROUPS, FOOTER_POSTER_URL, HERO_VIDEO_URL, PROTO_URL } from "../content";
import { useVideoEligibility } from "../hooks";
import { AmbientVideo } from "./AmbientVideo";
import { BrandMark } from "./BrandMark";

export function SiteFooter() {
  const canPlayVideo = useVideoEligibility();

  return (
    <footer className="site-footer">
      {canPlayVideo && (
        <AmbientVideo className="footer-video" src={HERO_VIDEO_URL} poster={FOOTER_POSTER_URL} />
      )}
      <FooterScene />

      <div className="footer-content page-width">
        <div className="footer-main">
          <a className="logo" href="#home" aria-label="Floodwall home">
            <BrandMark />
            <span>Floodwall</span>
          </a>
          <p className="kicker">San Francisco Bay / production traffic</p>
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

function FooterScene() {
  return (
    <div className="footer-scene" aria-hidden="true">
      <div className="footer-fog" />
      <div className="footer-lights" />
      <svg className="footer-bridge" viewBox="0 0 1400 620" preserveAspectRatio="none">
        <path className="deck" d="M-60 414C222 330 468 322 704 368s442 10 756-116" />
        <path className="deck deck-low" d="M-60 474C230 388 476 376 708 414s444 18 752-98" />
        <path className="tower" d="M348 286v250M1000 220v316" />
        <path className="tower" d="M320 344h56M970 286h60M320 424h56M970 390h60" />
        <path className="cable" d="M348 286C500 414 786 430 1000 220" />
        <path className="cable" d="M348 286C412 426 522 514 682 552" />
        <path className="cable" d="M1000 220C910 404 794 506 682 552" />
      </svg>
      <svg className="footer-skyline" viewBox="0 0 1400 320" preserveAspectRatio="none">
        <path d="M0 270h120v-48h72v-60h54v108h94v-78h62v78h130v-126h46v126h92v-72h70v72h98v-108h46v108h104v-54h92v54h130" />
        <path className="transamerica" d="M770 270l42-182 42 182M812 96v174" />
        <path className="sutro" d="M1086 270l36-132 36 132M1122 142v128M1080 184h84M1068 224h108" />
      </svg>
    </div>
  );
}
