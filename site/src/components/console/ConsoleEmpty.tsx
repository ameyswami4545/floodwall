/** The placeholder shown where a list or table has nothing in it. */
export function ConsoleEmpty({ children }: { children: string }) {
  return <p className="console-empty">{children}</p>;
}
