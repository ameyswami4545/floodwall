export type Link = { label: string; href: string };

export type Verdict = "admit" | "defer" | "reject";

/** One <path> of an SVG illustration. */
export type SvgPath = { d: string; className?: string };
