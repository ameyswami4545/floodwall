import { PricingPlanCard } from "../components/pricing/PricingPlanCard";
import { ButtonLink } from "../components/shared/ButtonLink";
import { Kicker } from "../components/shared/Kicker";
import { LogoLink } from "../components/shared/LogoLink";
import { SectionHeading } from "../components/shared/SectionHeading";
import { Tag } from "../components/shared/Tag";
import { Card } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { REPO_URL } from "../constants/links";
import {
  ENTERPRISE_PLAN,
  EARLY_ACCESS_URL,
  INCLUDED_EVERYWHERE,
  PRICING_COMPARISON,
  PRICING_FAQ,
  PRICING_PLANS,
  PRICING_PROGRAMS,
} from "../constants/pricing";
import { cx } from "../helpers/cx";
import { card, cardCopy, displayHeading, pageWidth } from "../styles/classes";

const SECTION = cx(pageWidth, "pt-section");
const TEXT_LINK = "font-bold text-ink-soft transition-[color] duration-180 ease-[ease] hover:text-black focus-visible:text-black";

/** The comparison's feature column, pinned while the plans scroll under it on a phone. */
const STICKY_COLUMN =
  "sticky left-0 z-1 h-auto px-4 mobile:w-36 mobile:border-r mobile:border-r-line mobile:whitespace-normal";

/** Floodwall's plans: free to self-host, usage-based on Floodwall Cloud. Reachable by URL only. */
export function PricingPage() {
  return (
    <>
      {/* Kept out of search, like the console, until the page goes public:
       * then drop this tag and list /pricing in public/sitemap.xml. */}
      <meta name="robots" content="noindex, nofollow" />

      <header className={cx(pageWidth, "flex h-header items-center justify-between gap-6")}>
        <LogoLink href="/">
          Floodwall<sup className="ml-0.5 font-body text-[10px] font-bold">&reg;</sup>
        </LogoLink>
        <ButtonLink href={REPO_URL} size="sm">
          View the Crate
        </ButtonLink>
      </header>

      <main className="bg-[linear-gradient(180deg,var(--color-paper)_0%,#fff_48%,#f1f7fb_100%)] pb-section">
        <section className={cx(pageWidth, "pt-section pb-12 mobile:pb-8")} aria-labelledby="pricing-title">
          <Kicker>Pricing</Kicker>
          <h1 id="pricing-title" className={cx(displayHeading, "max-w-190")}>
            Free to self-host. Pay as you grow on Floodwall Cloud.
          </h1>
          <p className="mt-6 max-w-180 text-lg leading-body text-muted mobile:text-base">
            The crate is open source and always free to run yourself. Floodwall Cloud hosts the ledger, approvals and
            console for you, billed by the decisions your agents&rsquo; changes need.
          </p>
          <div className="mt-6 flex">
            <Tag>Hosted plans by invitation during early access</Tag>
          </div>
        </section>

        <section className={pageWidth} aria-label="Plans">
          <div className="grid grid-cols-4 gap-4 tablet:grid-cols-2 mobile:grid-cols-[1fr]">
            {PRICING_PLANS.map((plan) => (
              <PricingPlanCard key={plan.name} plan={plan} />
            ))}
          </div>
          <Card
            className={cx(
              card,
              "mt-4 flex flex-row flex-wrap items-center justify-between gap-6 p-(--spacing-card)",
            )}
          >
            <div className="max-w-180">
              <h2 className="text-title leading-tight font-semibold text-ink">{ENTERPRISE_PLAN.name}</h2>
              <p className={cx(cardCopy, "mt-2")}>{ENTERPRISE_PLAN.copy}</p>
            </div>
            <ButtonLink href={ENTERPRISE_PLAN.cta.href} size="sm">
              {ENTERPRISE_PLAN.cta.label}
            </ButtonLink>
          </Card>
        </section>

        <section className={SECTION} aria-labelledby="included-title">
          <SectionHeading id="included-title" kicker="Every plan">
            The wall is the same everywhere.
          </SectionHeading>
          <div className="grid grid-cols-4 gap-px overflow-hidden rounded-card border border-line bg-line tablet:grid-cols-2 mobile:grid-cols-[1fr]">
            {INCLUDED_EVERYWHERE.map(({ title, copy }) => (
              <div key={title} className="flex flex-col gap-3 bg-white p-card">
                <h3 className="text-title leading-tight font-semibold text-ink">{title}</h3>
                <p className={cardCopy}>{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={SECTION} aria-labelledby="compare-title">
          <SectionHeading id="compare-title" kicker="Compare">
            Plans side by side.
          </SectionHeading>
          <Card className={cx(card, "block overflow-hidden")}>
            <Table>
              <TableHeader>
                <TableRow className="bg-paper hover:bg-paper">
                  <TableHead className={cx(STICKY_COLUMN, "bg-paper py-3")}>
                    <span className="sr-only">Feature</span>
                  </TableHead>
                  {PRICING_PLANS.map(({ name }) => (
                    <TableHead
                      key={name}
                      className="h-auto px-4 py-3 text-xs font-bold tracking-[0.04em] text-muted uppercase"
                    >
                      {name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {PRICING_COMPARISON.map(({ feature, values }) => (
                  <TableRow key={feature} className="hover:bg-transparent">
                    <TableCell className={cx(STICKY_COLUMN, "bg-white py-3 font-semibold text-ink")}>{feature}</TableCell>
                    {values.map((value, index) => (
                      <TableCell key={PRICING_PLANS[index].name} className="px-4 py-3 text-ink-soft">
                        {value}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </section>

        <section className={SECTION} aria-labelledby="programs-title">
          <SectionHeading id="programs-title" kicker="Programs">
            Free for open source.
          </SectionHeading>
          <div className="grid grid-cols-2 gap-4 mobile:grid-cols-[1fr]">
            {PRICING_PROGRAMS.map(({ title, copy }) => (
              <Card key={title} className={cx(card, "flex flex-col p-(--spacing-card)")}>
                <h3 className="text-title leading-tight font-semibold text-ink">{title}</h3>
                <p className={cx(cardCopy, "mt-3")}>{copy}</p>
                <a className={cx(TEXT_LINK, "mt-6 self-start")} href={EARLY_ACCESS_URL}>
                  Apply
                </a>
              </Card>
            ))}
          </div>
        </section>

        <section className={SECTION} aria-labelledby="faq-title">
          <SectionHeading id="faq-title" kicker="Questions">
            How pricing works.
          </SectionHeading>
          <dl className="grid grid-cols-2 gap-x-12 gap-y-10 tablet:grid-cols-[1fr]">
            {PRICING_FAQ.map(({ question, answer }) => (
              <div key={question}>
                <dt className="text-title leading-tight font-semibold text-ink">{question}</dt>
                <dd className={cx(cardCopy, "mt-3")}>{answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>

      <footer className="border-t border-t-line">
        <div className={cx(pageWidth, "flex justify-between gap-x-6 gap-y-2 py-8 text-sm text-[#38515c] mobile:flex-col")}>
          <span>&copy; {new Date().getFullYear()} Floodwall. An ERP.AI project.</span>
          <span className="flex gap-6">
            <a className={TEXT_LINK} href="/">
              Home
            </a>
            <a className={TEXT_LINK} href={REPO_URL}>
              Repository
            </a>
          </span>
        </div>
      </footer>
    </>
  );
}
