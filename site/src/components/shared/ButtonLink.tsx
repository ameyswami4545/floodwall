import { cx } from "../../helpers/cx";

type ButtonLinkProps = { href: string; size: "sm" | "lg"; children: string };

const SIZE = {
  sm: "min-h-10 px-5 text-sm mobile:min-h-9 mobile:px-4",
  lg: "min-h-14 px-12 text-base",
};

/** A link styled as the solid call-to-action button. */
export function ButtonLink({ href, size, children }: ButtonLinkProps) {
  return (
    <a
      className={cx(
        "inline-flex items-center justify-center rounded-pill bg-black font-bold whitespace-nowrap text-white",
        "transition-[transform,background] duration-180 ease-[ease]",
        "hover:transform-[scale(1.03)] hover:bg-[#151515] focus-visible:transform-[scale(1.03)] focus-visible:bg-[#151515]",
        SIZE[size],
      )}
      href={href}
    >
      {children}
    </a>
  );
}
