import { useEffect } from "react";
import { REDUCED_MOTION_QUERY } from "../constants/media";
import { fragmentId, headerHeight } from "../helpers/dom";

/**
 * Scroll in-page links (#model, #gate, ...) so the target section's content
 * (its box minus vertical padding) sits in the middle of the space below the
 * site header. Content taller than that space starts just under the header.
 * The previous section is never pulled into view past its own empty bottom
 * padding. Also re-centers a section named in the URL on first load; a
 * malformed or unknown fragment is ignored.
 */
export function useCenteredSectionLinks() {
  useEffect(() => {
    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);

    const scrollToSection = (id: string, behavior: ScrollBehavior) => {
      const target = id ? document.getElementById(id) : null;
      if (!target) return false;

      const header = headerHeight();
      const room = window.innerHeight - header;
      const { top, height } = target.getBoundingClientRect();
      const style = getComputedStyle(target);
      const paddingTop = parseFloat(style.paddingTop);
      const content = height - paddingTop - parseFloat(style.paddingBottom);

      // Where the section's top edge should land, in viewport pixels.
      const gapAbove = content < room ? (room - content) / 2 : Math.min(paddingTop, 24);
      const previous = target.previousElementSibling;
      const revealable = previous ? parseFloat(getComputedStyle(previous).paddingBottom) : 0;
      const landing = Math.min(header + gapAbove - paddingTop, header + revealable);

      window.scrollTo({ top: window.scrollY + top - landing, behavior });

      // Move keyboard focus along with the view, as a native jump would.
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      return true;
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      const id = fragmentId(link?.getAttribute("href") ?? "");
      if (!scrollToSection(id, reducedMotion.matches ? "auto" : "smooth")) return;

      event.preventDefault();
      if (location.hash !== `#${id}`) history.pushState(null, "", `#${id}`);
    };

    const initial = fragmentId(location.hash);
    if (initial) void document.fonts.ready.then(() => scrollToSection(initial, "auto"));
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
}
