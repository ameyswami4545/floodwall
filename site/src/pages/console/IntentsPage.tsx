import { Link, useSearchParams } from "react-router";
import { ConsoleBadge } from "../../components/console/ConsoleBadge";
import { ConsoleButton } from "../../components/console/ConsoleButton";
import { ConsoleEmpty } from "../../components/console/ConsoleEmpty";
import { ConsolePageHeader } from "../../components/console/ConsolePageHeader";
import { ConsoleTable } from "../../components/console/ConsoleTable";
import { Card } from "../../components/ui/card";
import { TableCell, TableRow } from "../../components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { CONSOLE_PATHS, INTENT_COLUMNS, INTENT_FILTERS } from "../../constants/console";
import { describeAction } from "../../helpers/gate";
import { usePlane } from "../../hooks/usePlane";
import { consoleMono } from "../../styles/classes";

export function IntentsPage() {
  const { state } = usePlane();
  const [params, setParams] = useSearchParams();
  const active = INTENT_FILTERS.find((f) => f.key === params.get("status")) ?? INTENT_FILTERS[0];
  const intents = state.intents
    .filter((i) => !active.statuses || active.statuses.includes(i.status))
    .sort((a, b) => b.id - a.id);

  return (
    <>
      <ConsolePageHeader
        title="Intents"
        description="Every change an agent has asked to make."
        actions={
          <ConsoleButton to={CONSOLE_PATHS.newIntent}>Submit intent</ConsoleButton>
        }
      />

      <Tabs value={active.key} onValueChange={(key) => setParams(key === "all" ? {} : { status: key })}>
        <TabsList>
          {INTENT_FILTERS.map((f) => (
            <TabsTrigger key={f.key} value={f.key} className="px-3">
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card className="gap-0 py-0">
        {intents.length === 0 ? (
          <ConsoleEmpty>No intents here.</ConsoleEmpty>
        ) : (
          <ConsoleTable columns={INTENT_COLUMNS}>
            {intents.map((intent) => (
              <TableRow key={intent.id}>
                <TableCell className={consoleMono}>
                  <Link to={CONSOLE_PATHS.intent(intent.id)}>#{intent.id}</Link>
                </TableCell>
                <TableCell>{intent.agent}</TableCell>
                <TableCell>{describeAction(intent.action)}</TableCell>
                <TableCell>{intent.priority}</TableCell>
                <TableCell>{intent.blast}</TableCell>
                <TableCell>
                  <ConsoleBadge value={intent.status} />
                </TableCell>
              </TableRow>
            ))}
          </ConsoleTable>
        )}
      </Card>
    </>
  );
}
