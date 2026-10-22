import type { ReactNode } from "react";

type ConsoleTableProps = { columns: string[]; children: ReactNode };

/** A table with one header cell per column; `children` are its body rows. */
export function ConsoleTable({ columns, children }: ConsoleTableProps) {
  return (
    <table className="console-table">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column}>{column}</th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}
