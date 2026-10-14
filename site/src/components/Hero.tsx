import { HERO_VIDEO_URL, REPO_URL } from "../content";
import { useVideoEligibility } from "../hooks";
import { AmbientVideo } from "./AmbientVideo";

const CRATE_STATS = [
  { value: __CRATE_STATS__.version, label: "shipped" },
  { value: __CRATE_STATS__.dependencies, label: "dependencies" },
  { value: __CRATE_STATS__.tests, label: "tests" },
];

export function Hero() {
  const canPlayVideo = useVideoEligibility();

  return (
    <section className="hero" id="home" aria-labelledby="hero-title">
      <HeroScene />
      {canPlayVideo && <AmbientVideo className="hero-video" src={HERO_VIDEO_URL} fadeLoop />}
      <div className="hero-veil" aria-hidden="true" />

      <div className="hero-content">
        <p className="kicker">San Francisco / agent ops / production gate</p>
        <h1 id="hero-title">
          <span>
            When <em>agents flood</em>
          </span>{" "}
          <span>
            production, <em>hold the line.</em>
          </span>
        </h1>
        <p className="hero-lead">
          Floodwall meters agent-generated infrastructure changes, verifies each intent at a policy
          gate, and records every admit, defer, and reject in a tamper-evident ledger.
        </p>
        <div className="hero-actions">
          <a className="button button-lg" href={REPO_URL}>
            View the Crate
          </a>
          <a className="hero-link" href="#model">
            Read the model
          </a>
        </div>
      </div>

      <dl className="hero-stats" aria-label="Current crate state">
        {CRATE_STATS.map(({ value, label }) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** Illustrated bay scene: shown on its own when video is off, and behind the video while it loads. */
function HeroScene() {
  return (
    <div className="hero-scene" aria-hidden="true">
      <div className="fog-lane fog-lane-one" />
      <div className="fog-lane fog-lane-two" />
      <div className="bay-lights" />
      <svg className="hero-bridge" viewBox="0 0 1200 640" preserveAspectRatio="none">
        <path d="M-40 426C220 340 430 322 646 352s384 8 594-104" />
        <path d="M-40 472C230 382 438 366 650 392s386 10 590-92" />
        <path d="M352 328v224M814 282v268" />
        <path d="M352 328C466 404 682 412 814 282" />
        <path d="M352 328C394 420 458 478 548 526" />
        <path d="M814 282C760 404 680 478 548 526" />
      </svg>
      <svg className="hero-skyline" viewBox="0 0 1200 280" preserveAspectRatio="none">
        <path d="M0 232h146v-42h70v-80h54v122h88v-64h58v64h92v-102h52v102h76v-170h42v170h86v-84h64v84h90v-58h76v58h126" />
        <path className="pyramid" d="M722 232 759 72l38 160" />
        <path className="sutro" d="M956 232l34-130 34 130M990 104v128M948 145h84M936 185h108" />
      </svg>
      <div className="wall-diagram">
        <span>admission</span>
        <span>gate</span>
        <span>ledger</span>
      </div>
    </div>
  );
}
