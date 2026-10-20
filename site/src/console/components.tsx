import type { ReactNode } from "react";
import type { IntentStatus, PolicyVerdict } from "./types";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="console-page-header">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="console-actions">{actions}</div>}
    </header>
  );
}

const STATUS_TONE: Record<IntentStatus | PolicyVerdict, string> = {
  queued: "neutral",
  "in-flight": "info",
  held: "warn",
  rejected: "bad",
  expired: "neutral",
  succeeded: "good",
  failed: "bad",
  admit: "good",
  defer: "warn",
  reject: "bad",
};

export function Badge({ value }: { value: IntentStatus | PolicyVerdict }) {
  return <span className={`console-badge tone-${STATUS_TONE[value]}`}>{value}</span>;
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="console-card console-stat">
      <span className="console-label">{label}</span>
      <strong>{value}</strong>
      {hint && <span className="console-hint">{hint}</span>}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="console-empty">{children}</p>;
}
