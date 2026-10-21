import { NAV_SECTIONS, NAV_SECTION_IDS, REPO_URL } from "../../constants/links";
import { useActiveSection } from "../../hooks/useActiveSection";
import { useIsScrolled } from "../../hooks/useIsScrolled";
import { ButtonLink } from "../ui/ButtonLink";
import { LogoLink } from "../ui/LogoLink";

export function LandingHeader() {
  const scrolled = useIsScrolled();
  const active = useActiveSection(NAV_SECTION_IDS);

  return (
    <header className="site-header" data-scrolled={scrolled}>
      <nav className="nav-bar page-width" aria-label="Primary">
        <LogoLink>
          Floodwall<sup>&reg;</sup>
        </LogoLink>
        <div className="nav-links">
          {NAV_SECTIONS.map(({ id, label }) => (
            <a key={id} href={`#${id}`} aria-current={active === id ? "location" : undefined}>
              {label}
            </a>
          ))}
        </div>
        <ButtonLink href={REPO_URL} size="sm">
          View the Crate
        </ButtonLink>
      </nav>
    </header>
  );
}
