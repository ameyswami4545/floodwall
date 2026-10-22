import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { ConsolePageHeader } from "../../components/console/ConsolePageHeader";
import { ConsoleSelect } from "../../components/console/ConsoleSelect";
import { ACTION_KINDS, BLAST_RADII, CONSOLE_PATHS, PRIORITIES } from "../../constants/console";
import { MOCK_AGENTS } from "../../constants/console-mock";
import { parseReplicas } from "../../helpers/gate";
import { usePlane } from "../../hooks/usePlane";
import type { ActionKind, BlastRadius, Priority } from "../../types/console";

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

      <form className="console-card console-form" onSubmit={onSubmit}>
        <ConsoleSelect label="Agent" value={agent} options={MOCK_AGENTS} onChange={setAgent} />

        <div className="console-form-row">
          <ConsoleSelect label="Action" value={kind} options={ACTION_KINDS} onChange={setKind} />
          <label>
            <span className="console-label">Resource</span>
            <input value={resource} onChange={(e) => setResource(e.target.value)} required />
          </label>
          {kind !== "destroy" && (
            <label>
              <span className="console-label">{kind === "scale" ? "Replicas" : "Manifest"}</span>
              {kind === "scale" ? (
                <input
                  key="replicas"
                  type="number"
                  min={0}
                  step={1}
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  required
                />
              ) : (
                <input key="manifest" value={detail} onChange={(e) => setDetail(e.target.value)} required />
              )}
            </label>
          )}
        </div>

        <div className="console-form-row">
          <ConsoleSelect label="Priority" value={priority} options={PRIORITIES} onChange={setPriority} />
          <ConsoleSelect label="Blast radius" value={blast} options={BLAST_RADII} onChange={setBlast} />
        </div>

        <div className="console-actions">
          <Link className="console-button secondary" to={CONSOLE_PATHS.intents}>
            Cancel
          </Link>
          <button className="console-button" type="submit">
            Submit to the queue
          </button>
        </div>
      </form>
    </>
  );
}
