import { useState } from "react";
import { Link } from "react-router";
import { Badge, PageHeader } from "../components";
import { PATHS } from "../paths";
import { usePlane } from "../store";

const short = (digest: string) => `${digest.slice(0, 8)}…${digest.slice(-8)}`;

export function LedgerPage() {
  const { state } = usePlane();
  const [verified, setVerified] = useState<number | null>(null);
  const head = state.ledger.at(-1);
  // Stand-in for Ledger::verify(): checks each record links to the one before.
  const intact = state.ledger.every((r, i) => i === 0 || r.prev === state.ledger[i - 1].digest);

  return (
    <>
      <PageHeader
        title="Ledger"
        description={head ? `${state.ledger.length} records · head ${short(head.digest)}` : "Empty"}
        actions={
          <button className="console-button" onClick={() => setVerified(state.ledger.length)}>
            Verify chain
          </button>
        }
      />

      {verified !== null && (
        <p className={`console-banner ${intact ? "tone-good" : "tone-bad"}`}>
          {intact ? `Chain intact: ${verified} records verified from genesis.` : "Chain broken."}
        </p>
      )}

      <section className="console-card flush">
        <table className="console-table">
          <thead>
            <tr>
              <th>Seq</th>
              <th>Tick</th>
              <th>Intent</th>
              <th>Kind</th>
              <th>Summary</th>
              <th>Digest</th>
            </tr>
          </thead>
          <tbody>
            {[...state.ledger].reverse().map((r) => (
              <tr key={r.seq}>
                <td className="console-mono">{r.seq}</td>
                <td>{r.tick}</td>
                <td className="console-mono">
                  <Link to={PATHS.intent(r.intentId)}>#{r.intentId}</Link>
                </td>
                <td>{r.verdict ? <Badge value={r.verdict} /> : r.kind}</td>
                <td>{r.summary}</td>
                <td className="console-mono console-muted">{short(r.digest)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
