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

export function NewIntentPage() {
  const { state, dispatch } = usePlane();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(MOCK_AGENTS[0]);
  const [kind, setKind] = useState<ActionKind>("scale");
  const [resource, setResource] = useState("web");
  const [detail, setDetail] = useState("3");
  const [priority, setPriority] = useState<Priority>("normal");
  const [blast, setBlast] = useState<BlastRadius>("service");

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const id = Math.max(0, ...state.intents.map((i) => i.id)) + 1;
    dispatch({
      type: "submit",
      intent: {
        agent,
        action: { kind, resource: resource.trim(), detail: kind === "destroy" ? undefined : detail.trim() },
        priority,
        blast,
      },
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
              <input
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                inputMode={kind === "scale" ? "numeric" : undefined}
                required
              />
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
