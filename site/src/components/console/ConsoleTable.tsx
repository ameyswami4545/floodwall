import type { ReactNode } from "react";
import { cx } from "../../helpers/cx";
import { consoleLabel } from "../../styles/classes";

type ConsoleTableProps = { columns: string[]; children: ReactNode };

/** Every cell is ruled and padded alike; body rows light up under the pointer. */
const TABLE = cx(
  "w-full border-collapse",
  "[&_:is(th,td)]:border-b [&_:is(th,td)]:border-b-line [&_:is(th,td)]:px-4 [&_:is(th,td)]:py-3 [&_:is(th,td)]:text-left [&_:is(th,td)]:whitespace-nowrap",
  "[&_tbody_tr:hover]:bg-paper [&_tbody_tr:last-child_td]:[border-bottom:0] [&_a]:font-semibold [&_a]:text-bay-deep",
);

/** A table with one header cell per column; `children` are its body rows. */
export function ConsoleTable({ columns, children }: ConsoleTableProps) {
  return (
    <table className={TABLE}>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column} className={cx(consoleLabel, "bg-paper")}>
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}
