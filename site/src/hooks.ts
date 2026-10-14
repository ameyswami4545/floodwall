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
 * The id of the section crossing a band in the upper third of the
 * viewport. When two sections share that band (Gate and Ledger sit side by
 * side on wide screens) the earlier one in `ids` wins. `ids` must be stable.
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
      { rootMargin: "-25% 0px -70% 0px" },
    );

    for (const id of ids) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
