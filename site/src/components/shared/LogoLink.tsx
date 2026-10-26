import type { ReactNode } from "react";
import { cx } from "../../helpers/cx";
import { BrandMark } from "./BrandMark";

type LogoLinkProps = {
  /** Where it leads: the top of the page by default. */
  href?: string;
  className?: string;
  children: ReactNode;
};

/** Brand mark and wordmark linking back to the top of the page. */
export function LogoLink({ href = "#home", className, children }: LogoLinkProps) {
  return (
    <a
      className={cx(
        "inline-flex items-center gap-3 font-display text-2xl leading-none text-ink mobile:text-xl",
        className,
      )}
      href={href}
      aria-label="Floodwall home"
    >
      <BrandMark />
      <span>{children}</span>
    </a>
  );
}
