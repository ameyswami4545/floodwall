import {
  HERO_BRIDGE_PATHS,
  HERO_FOG_LANES,
  HERO_SKYLINE_PATHS,
  HERO_WALL_LAYERS,
} from "../../constants/graphics";
import { SvgPaths } from "../shared/SvgPaths";

/** Illustrated bay scene: shown on its own when video is off, and behind the video while it loads. */
export function LandingHeroScene() {
  return (
    <div className="hero-scene" aria-hidden="true">
      {HERO_FOG_LANES.map((lane) => (
        <div key={lane} className={`fog-lane fog-lane-${lane}`} />
      ))}
      <div className="bay-lights" />
      <svg className="hero-bridge" viewBox="0 0 1200 640" preserveAspectRatio="none">
        <SvgPaths paths={HERO_BRIDGE_PATHS} />
      </svg>
      <svg className="hero-skyline" viewBox="0 0 1200 280" preserveAspectRatio="none">
        <SvgPaths paths={HERO_SKYLINE_PATHS} />
      </svg>
      <div className="wall-diagram">
        {HERO_WALL_LAYERS.map((layer) => (
          <span key={layer}>{layer}</span>
        ))}
      </div>
    </div>
  );
}
