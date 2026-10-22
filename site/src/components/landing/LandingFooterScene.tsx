import { FOOTER_BRIDGE_PATHS, FOOTER_SKYLINE_PATHS } from "../../constants/graphics";
import { SvgPaths } from "../shared/SvgPaths";

export function LandingFooterScene() {
  return (
    <div className="footer-scene" aria-hidden="true">
      <div className="footer-fog" />
      <div className="footer-lights" />
      <svg className="footer-bridge" viewBox="0 0 1400 620" preserveAspectRatio="none">
        <SvgPaths paths={FOOTER_BRIDGE_PATHS} />
      </svg>
      <svg className="footer-skyline" viewBox="0 0 1400 320" preserveAspectRatio="none">
        <SvgPaths paths={FOOTER_SKYLINE_PATHS} />
      </svg>
    </div>
  );
}
