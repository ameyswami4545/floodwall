import type { ReactNode } from "react";
import { Kicker } from "./Kicker";

type FeatureCardProps = {
  kicker: string;
  titleId: string;
  title: string;
  /** Optional bullet points under the copy. */
  points?: string[];
  children: ReactNode;
};

/** Light card with a kicker, heading, and copy; one half of a split section. */
export function FeatureCard({ kicker, titleId, title, points, children }: FeatureCardProps) {
  return (
    <div className="card feature-card">
      <Kicker>{kicker}</Kicker>
      <h2 id={titleId}>{title}</h2>
      <p className="feature-copy">{children}</p>
      {points && (
        <ul className="feature-points">
          {points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
