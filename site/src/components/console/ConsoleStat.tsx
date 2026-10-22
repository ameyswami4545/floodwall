import type { ReactNode } from "react";

type ConsoleStatProps = { label: string; value: ReactNode; hint?: string };

export function ConsoleStat({ label, value, hint }: ConsoleStatProps) {
  return (
    <div className="console-card console-stat">
      <span className="console-label">{label}</span>
      <strong>{value}</strong>
      {hint && <span className="console-hint">{hint}</span>}
    </div>
  );
}
