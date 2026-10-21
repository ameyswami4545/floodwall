type ButtonLinkProps = { href: string; size: "sm" | "lg"; children: string };

/** A link styled as the solid call-to-action button. */
export function ButtonLink({ href, size, children }: ButtonLinkProps) {
  return (
    <a className={`button button-${size}`} href={href}>
      {children}
    </a>
  );
}
