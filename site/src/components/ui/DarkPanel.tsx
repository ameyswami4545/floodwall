import type { ReactNode } from "react";

type DarkPanelProps = {
  title: string;
  note: string;
  /** Show the note as a live status pill instead of plain text. */
  noteIsStatus?: boolean;
  footLabel: string;
  footCode: string;
  /** The panel's rows, usually a `.panel-rows` list. */
  children: ReactNode;
};

/** Dark console-style card with a head, rows, and a code footer. */
export function DarkPanel({
  title,
  note,
  noteIsStatus = false,
  footLabel,
  footCode,
  children,
}: DarkPanelProps) {
  return (
    <div className="card dark-panel">
      <div className="panel-head">
        <span>{title}</span>
        <span className={noteIsStatus ? "panel-status" : undefined}>{note}</span>
      </div>
      {children}
      <div className="panel-foot">
        <span>{footLabel}</span>
        <code>{footCode}</code>
      </div>
    </div>
  );
}
