import { Fragment } from "react";
import { CRATE_STATS, HERO_TITLE_LINES } from "../../constants/landing";
import { REPO_URL } from "../../constants/links";
import { HERO_VIDEO_URL } from "../../constants/media";
import { useVideoEligibility } from "../../hooks/useVideoEligibility";
import { AmbientVideo } from "../shared/AmbientVideo";
import { ButtonLink } from "../shared/ButtonLink";
import { Kicker } from "../shared/Kicker";
import { LandingHeroScene } from "./LandingHeroScene";

export function LandingHero() {
  const canPlayVideo = useVideoEligibility();

  return (
    <section className="hero" id="home" aria-labelledby="hero-title">
      <LandingHeroScene />
      {canPlayVideo && <AmbientVideo className="hero-video" src={HERO_VIDEO_URL} fadeLoop />}
      <div className="hero-veil" aria-hidden="true" />

      <div className="hero-content">
        <Kicker>San Francisco / agent ops / production gate</Kicker>
        <h1 id="hero-title">
          {HERO_TITLE_LINES.map(({ text, emphasis }, index) => (
            <Fragment key={emphasis}>
              {index > 0 && " "}
              <span>
                {text}
                <em>{emphasis}</em>
              </span>
            </Fragment>
          ))}
        </h1>
        <p className="hero-lead">
          Floodwall meters agent-generated infrastructure changes, verifies each intent at a policy
          gate, and records every admit, defer, and reject in a tamper-evident ledger.
        </p>
        <div className="hero-actions">
          <ButtonLink href={REPO_URL} size="lg">
            View the Crate
          </ButtonLink>
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
