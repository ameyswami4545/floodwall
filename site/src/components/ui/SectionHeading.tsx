import { Kicker } from "./Kicker";

type SectionHeadingProps = { id: string; kicker: string; children: string };

/** Kicker plus display heading that opens a full-width section. */
export function SectionHeading({ id, kicker, children }: SectionHeadingProps) {
  return (
    <header className="section-heading">
      <Kicker>{kicker}</Kicker>
      <h2 id={id} className="display-heading">
        {children}
      </h2>
    </header>
  );
}
