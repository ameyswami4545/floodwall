import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router";
import { cx } from "../../helpers/cx";

type ConsoleButtonProps = {
  variant?: "primary" | "secondary";
  /** Renders a router link to this path instead of a <button>. */
  to?: string;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const BASE = cx(
  "inline-flex min-h-9 cursor-pointer items-center justify-center rounded-control border px-4 font-semibold",
  "transition-[background,opacity] duration-150 ease-[ease]",
  "focus-visible:[outline:none] focus-visible:ring-3 focus-visible:ring-info-soft disabled:cursor-not-allowed disabled:opacity-40",
);

const VARIANT = {
  primary: "border-ink bg-ink text-white hover:bg-[#222]",
  secondary: "border-line bg-surface text-ink hover:bg-subtle",
};

/** The console's solid (primary) or outlined (secondary) button. */
export function ConsoleButton({ variant = "primary", to, children, type = "button", ...rest }: ConsoleButtonProps) {
  const className = cx(BASE, VARIANT[variant]);
  if (to) {
    return (
      <Link className={className} to={to}>
        {children}
      </Link>
    );
  }
  return (
    <button className={className} type={type} {...rest}>
      {children}
    </button>
  );
}
