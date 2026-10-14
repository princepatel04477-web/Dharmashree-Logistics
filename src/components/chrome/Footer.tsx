import Image from "next/image";
import Link from "next/link";
import { LogoLoop } from "@/components/vendor/reactbits";
import { company } from "@/content/company";
import { footer, logo, type ContactEntry, type FooterLink } from "@/content/navigation";
import { FooterMessage } from "./FooterMessage";

/* Site footer (Prompt 04), on the --brand-deep ground: headings full white,
   links and small text white at 0.85, hairlines white at 0.12. The focus ring
   turns white here so it stays visible on the blue. Top band = the logo and the
   company's tagline beside the compact "Send us a message" box (`FooterMessage`, absent on
   /contact, which has the full form) (the footer no
   longer carries an "Enquire now" button); then the link columns; then the
   decorative hub band; then the legal row, with the giving line when there is
   one. Every row is built from `navigation.ts`, which already dropped the
   `null` facts, so nothing here renders an empty line (house rule 4). External
   links (WhatsApp, the website) open in a new tab. */

const NEW_TAB_KINDS: readonly FooterLink["kind"][] = ["whatsapp", "website"];

function FooterLinkRow({ link }: { link: FooterLink }) {
  const base =
    "text-on-deep-text hover:text-on-deep inline-block py-2.5 text-sm font-light sm:py-1 underline-offset-4 transition-colors duration-200 hover:underline";
  if (link.kind === "route") {
    return (
      <Link href={link.href} className={base}>
        {link.label}
      </Link>
    );
  }
  const newTab = NEW_TAB_KINDS.includes(link.kind);
  return (
    <a
      href={link.href}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noopener" : undefined}
      className={base}
    >
      {link.label}
    </a>
  );
}

/* A contact entry: a number or address as a plain <a> (house rule 10), or
   plain text for the registration IDs. Multi-row addresses keep their breaks. */
function ContactEntryRow({ entry }: { entry: ContactEntry }) {
  const rows = entry.rows.map((row) => (
    <span key={row} className="block">
      {row}
    </span>
  ));
  if (entry.href === null) {
    return <p className="text-on-deep-text py-0.5 text-sm font-light">{rows}</p>;
  }
  return (
    <a
      href={entry.href}
      target={entry.external ? "_blank" : undefined}
      rel={entry.external ? "noopener" : undefined}
      className="text-on-deep hover:text-on-deep-text inline-block py-2 text-sm font-light [overflow-wrap:anywhere] underline-offset-4 transition-colors duration-200 hover:underline sm:py-0.5"
    >
      {rows}
    </a>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  const holder = company.legalName ?? company.name;

  return (
    <footer className="bg-brand-deep text-on-deep [&_:focus-visible]:outline-on-deep mt-24">
      {/* ——— Top band ——— */}
      <div className="wrap grid grid-cols-1 gap-10 py-14 sm:py-16 lg:grid-cols-12 lg:items-end lg:gap-16 lg:py-20">
        <div className="flex flex-col items-start gap-6 lg:col-span-5">
          <Image
            src={logo.lightSrc}
            alt={company.name}
            width={logo.width}
            height={logo.height}
            className="h-12 w-auto sm:h-14"
          />
          <p className="font-display text-headline text-on-deep leading-headline tracking-display">
            {footer.slogan}
          </p>
        </div>
        <FooterMessage />
      </div>

      {/* ——— Columns: the link lists, then "Reach us" in two labelled halves ——— */}
      <div className="wrap pb-14 sm:pb-16 lg:pb-20">
        <div className="border-on-deep-line grid grid-cols-1 gap-12 border-t pt-10 lg:grid-cols-12 lg:gap-8">
          <ul className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8 lg:col-span-7">
            {footer.columns.map((column) => (
              <li key={column.id}>
                <nav aria-labelledby={`footer-${column.id}`}>
                  <h2 id={`footer-${column.id}`} className="label-caps text-on-deep mb-3">
                    {column.title}
                  </h2>
                  <ul className="flex flex-col">
                    {column.links.map((link) => (
                      <li key={`${column.id}-${link.href}`}>
                        <FooterLinkRow link={link} />
                      </li>
                    ))}
                  </ul>
                </nav>
              </li>
            ))}
          </ul>

          {footer.reach.groups.length > 0 && (
            <section aria-labelledby="footer-reach" className="lg:col-span-5">
              <h2 id="footer-reach" className="label-caps text-on-deep mb-5">
                {footer.reach.title}
              </h2>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                {(["channels", "places"] as const).map((side) => {
                  const groups = footer.reach.groups.filter((group) => group.side === side);
                  if (groups.length === 0) return null;
                  return (
                    <dl key={side} className="flex flex-col gap-6">
                      {groups.map((group) => (
                        <div key={group.id}>
                          <dt className="label-caps text-on-deep-text mb-1.5">{group.label}</dt>
                          {group.entries.map((entry) => (
                            <dd key={entry.rows.join(" ")}>
                              <ContactEntryRow entry={entry} />
                            </dd>
                          ))}
                        </div>
                      ))}
                    </dl>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* ——— Hub band ——— decoration only: /network holds the real directory */}
      <LogoLoop
        items={footer.hubBand}
        speed={40}
        separator="·"
        className="bg-on-deep-band border-on-deep-line text-on-deep-text"
        separatorClassName="text-highway"
        itemClassName="label-caps text-on-deep-text hover:text-on-deep"
        decorative
      />

      {/* ——— Legal row ——— */}
      <div className="wrap flex flex-col gap-2 py-6 sm:flex-row sm:items-center sm:justify-between">
        {/* The copyright line doubles as the way into the admin panel. */}
        <p className="label-caps text-on-deep-text">
          <Link
            href={footer.adminHref}
            className="hover:text-on-deep transition-colors duration-200"
          >
            © {year} {holder}
          </Link>
        </p>
        {footer.giving !== null && (
          <p className="text-on-deep-text text-xs font-light">{footer.giving}</p>
        )}
      </div>
    </footer>
  );
}
