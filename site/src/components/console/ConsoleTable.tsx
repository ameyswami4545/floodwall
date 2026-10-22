import type { ReactNode } from "react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "../ui/table";
import { cx } from "../../helpers/cx";
import { consoleLabel } from "../../styles/classes";

type ConsoleTableProps = { columns: string[]; children: ReactNode };

/** A shadcn Table with one header cell per column; `children` are its body rows (TableRow). */
export function ConsoleTable({ columns, children }: ConsoleTableProps) {
  return (
    <Table className="[&_:is(th,td)]:px-4 [&_a]:font-semibold [&_a]:text-bay-deep">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {columns.map((column) => (
            <TableHead key={column} className={cx(consoleLabel, "bg-paper")}>
              {column}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>{children}</TableBody>
    </Table>
  );
}
