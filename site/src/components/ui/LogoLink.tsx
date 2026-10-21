import type { ReactNode } from "react";
import { BrandMark } from "./BrandMark";

/** Brand mark and wordmark linking back to the top of the page. */
export function LogoLink({ children }: { children: ReactNode }) {
  return (
    <a className="logo" href="#home" aria-label="Floodwall home">
      <BrandMark />
      <span>{children}</span>
    </a>
  );
}
