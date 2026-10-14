import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches);
}

/**
 * Background video plays only on tablet-width screens and up, and never for
 * visitors who prefer reduced motion or have Save-Data turned on.
 */
export function useVideoEligibility() {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const tablet = useMediaQuery("(min-width: 760px)");
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    ?.saveData;
  return !reducedMotion && tablet && !saveData;
}

/** True once the page has scrolled away from the very top. */
export function useIsScrolled() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return scrolled;
}

/**
 * The id of the section crossing the middle of the viewport, which is where
 * useCenteredSectionLinks puts a section. If two ever share it, the earlier
 * one in `ids` wins. `ids` must be stable.
 */
export function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const crossing = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) crossing.add(entry.target.id);
          else crossing.delete(entry.target.id);
        }
        const first = ids.find((id) => crossing.has(id));
        if (first) setActive(first);
      },
      { rootMargin: "-50% 0px -49% 0px" },
    );

    for (const id of ids) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

/**
 * Scroll in-page links (#model, #gate, ...) so the target section's content
 * (its box minus vertical padding) sits in the middle of the space below the
 * site header. Content taller than that space starts just under the header.
 * The previous section is never pulled into view past its own empty bottom
 * padding. Also re-centers a section named in the URL on first load.
 */
export function useCenteredSectionLinks() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const scrollToSection = (id: string, behavior: ScrollBehavior) => {
      const target = id ? document.getElementById(id) : null;
      if (!target) return false;

      const header = document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 0;
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
      const id = decodeURIComponent(link?.getAttribute("href")?.slice(1) ?? "");
      if (!scrollToSection(id, reducedMotion.matches ? "auto" : "smooth")) return;

      event.preventDefault();
      if (location.hash !== `#${id}`) history.pushState(null, "", `#${id}`);
    };

    document.addEventListener("click", onClick);
    const initial = decodeURIComponent(location.hash.slice(1));
    if (initial) void document.fonts.ready.then(() => scrollToSection(initial, "auto"));
    return () => document.removeEventListener("click", onClick);
  }, []);
}
