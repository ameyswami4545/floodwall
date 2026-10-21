/** Current height of the fixed site header, or 0 before it mounts. */
export function headerHeight() {
  return document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 0;
}

/** The element id a URL fragment names, or "" if it is empty or malformed (e.g. "#%"). */
export function fragmentId(fragment: string) {
  try {
    return decodeURIComponent(fragment.replace(/^#/, ""));
  } catch {
    return "";
  }
}
