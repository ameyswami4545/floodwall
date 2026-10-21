import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { PageHeader } from "../components";
import { MOCK_AGENTS } from "../mock-data";
import { PATHS } from "../paths";
import { usePlane } from "../store";
import {
  ACTION_KINDS,
  BLAST_RADII,
  PRIORITIES,
  type ActionKind,
  type BlastRadius,
  type Priority,
} from "../types";

/** A replica count: a whole number, at least 0, written without padding ("05" is "5"). */
function parseReplicas(value: string): string | null {
  const trimmed = value.trim();
  const n = Number(trimmed);
  return trimmed !== "" && Number.isInteger(n) && n >= 0 ? String(n) : null;
}

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
    navigate(PATHS.intent(id));
  };

  return (
    <>
      <PageHeader title="Submit intent" description="Propose a change as an agent would. It joins the queue." />

      <form className="console-card console-form" onSubmit={onSubmit}>
        <label>
          <span className="console-label">Agent</span>
          <select value={agent} onChange={(e) => setAgent(e.target.value)}>
            {MOCK_AGENTS.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </label>

        <div className="console-form-row">
          <label>
            <span className="console-label">Action</span>
            <select value={kind} onChange={(e) => setKind(e.target.value as ActionKind)}>
              {ACTION_KINDS.map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </label>
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
          <label>
            <span className="console-label">Priority</span>
            <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
              {PRIORITIES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="console-label">Blast radius</span>
            <select value={blast} onChange={(e) => setBlast(e.target.value as BlastRadius)}>
              {BLAST_RADII.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="console-actions">
          <Link className="console-button secondary" to={PATHS.intents}>
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
