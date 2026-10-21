import type { SvgPath } from "../../types";

/** The <path> elements of an SVG, drawn in order. */
export function SvgPaths({ paths }: { paths: SvgPath[] }) {
  return paths.map(({ d, className }) => <path key={d} className={className} d={d} />);
}
