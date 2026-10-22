import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router";

type ConsoleButtonProps = {
  variant?: "primary" | "secondary";
  /** Renders a router link to this path instead of a <button>. */
  to?: string;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

/** The console's solid (primary) or outlined (secondary) button. */
export function ConsoleButton({ variant = "primary", to, children, type = "button", ...rest }: ConsoleButtonProps) {
  const className = variant === "secondary" ? "console-button secondary" : "console-button";
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
