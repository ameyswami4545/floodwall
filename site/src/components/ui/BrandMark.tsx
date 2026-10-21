import { BRAND_MARK_PATHS } from "../../constants/graphics";
import { SvgPaths } from "./SvgPaths";

export function BrandMark() {
  return (
    <svg className="brand-mark" aria-hidden="true" viewBox="0 0 64 64">
      <rect x="7" y="7" width="50" height="50" rx="13" />
      <SvgPaths paths={BRAND_MARK_PATHS} />
    </svg>
  );
}
