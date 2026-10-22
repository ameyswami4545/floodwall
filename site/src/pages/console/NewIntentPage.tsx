import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { ConsoleButton } from "../../components/console/ConsoleButton";
import { ConsolePageHeader } from "../../components/console/ConsolePageHeader";
import { ConsoleSelect } from "../../components/console/ConsoleSelect";
import { ACTION_KINDS, BLAST_RADII, CONSOLE_PATHS, PRIORITIES } from "../../constants/console";
import { MOCK_AGENTS } from "../../constants/console-mock";
import { parseReplicas } from "../../helpers/gate";
import { usePlane } from "../../hooks/usePlane";
import type { ActionKind, BlastRadius, Priority } from "../../types/console";
import { cx } from "../../helpers/cx";
import { consoleActions, consoleCardSkin, consoleControl, consoleField, consoleLabel } from "../../styles/classes";

const INPUT = cx(consoleControl, "focus:border-bay-deep focus:[outline:none] focus:ring-3 focus:ring-info-soft");

export function NewIntentPage() {
  const { submit } = usePlane();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(MOCK_AGENTS[0]);
  const [kind, setKind] = useState<ActionKind>("scale");
  const [resource, setResource] = useState("web");
  const [detail, setDetail] = useState("3");
  const [priority, setPriority] = useState<Priority>("normal");
  const [blast, setBlast] = useState<BlastRadius>("service");

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    // The browser already blocks this through min, step and required; this
    // keeps a fraction or a negative out of the queue if it gets past them.
    const replicas = kind === "scale" ? parseReplicas(detail) : null;
    if (kind === "scale" && replicas === null) return;
    const id = submit({
      agent,
      action: { kind, resource: resource.trim(), detail: kind === "destroy" ? undefined : (replicas ?? detail.trim()) },
      priority,
      blast,
    });
    navigate(CONSOLE_PATHS.intent(id));
  };

  return (
    <>
      <ConsolePageHeader title="Submit intent" description="Propose a change as an agent would. It joins the queue." />

      <form className={cx(consoleCardSkin, "flex max-w-160 flex-col gap-5 p-7")} onSubmit={onSubmit}>
        <ConsoleSelect label="Agent" value={agent} options={MOCK_AGENTS} onChange={setAgent} />

        <div className="flex flex-wrap gap-4 *:min-w-40">
          <ConsoleSelect label="Action" value={kind} options={ACTION_KINDS} onChange={setKind} />
          <label className={consoleField}>
            <span className={consoleLabel}>Resource</span>
            <input className={INPUT} value={resource} onChange={(e) => setResource(e.target.value)} required />
          </label>
          {kind !== "destroy" && (
            <label className={consoleField}>
              <span className={consoleLabel}>{kind === "scale" ? "Replicas" : "Manifest"}</span>
              {kind === "scale" ? (
                <input
                  className={INPUT}
                  key="replicas"
                  type="number"
                  min={0}
                  step={1}
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  required
                />
              ) : (
                <input
                  className={INPUT}
                  key="manifest"
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  required
                />
              )}
            </label>
          )}
        </div>

        <div className="flex flex-wrap gap-4 *:min-w-40">
          <ConsoleSelect label="Priority" value={priority} options={PRIORITIES} onChange={setPriority} />
          <ConsoleSelect label="Blast radius" value={blast} options={BLAST_RADII} onChange={setBlast} />
        </div>

        <div className={cx(consoleActions, "justify-end pt-1")}>
          <ConsoleButton variant="secondary" to={CONSOLE_PATHS.intents}>
            Cancel
          </ConsoleButton>
          <ConsoleButton type="submit">Submit to the queue</ConsoleButton>
        </div>
      </form>
    </>
  );
}
