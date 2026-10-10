import Image from "next/image";
import Link from "next/link";
import { LogoLoop } from "@/components/vendor/reactbits";
import { company } from "@/content/company";
import { footer, footerLogo, type FooterLink } from "@/content/navigation";
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
    "text-on-deep-text hover:text-on-deep inline-block py-1 text-sm font-light underline-offset-4 transition-colors duration-200 hover:underline";
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

export function Footer() {
  const year = new Date().getFullYear();
  const holder = company.legalName ?? company.name;

  return (
    <footer className="bg-brand-deep text-on-deep [&_:focus-visible]:outline-on-deep mt-24">
      {/* ——— Top band ——— */}
      <div className="wrap grid grid-cols-1 gap-10 py-14 sm:py-16 lg:grid-cols-12 lg:items-end lg:gap-16 lg:py-20">
        <div className="flex flex-col items-start gap-6 lg:col-span-5">
          <Image
            src={footerLogo.lightSrc}
            alt={company.name}
            width={footerLogo.width}
            height={footerLogo.height}
            className="h-6 w-auto sm:h-7"
          />
          <p className="font-display text-headline text-on-deep leading-headline tracking-display">
            {footer.slogan}
          </p>
        </div>
        <FooterMessage />
      </div>

      {/* ——— Columns ——— */}
      <div className="wrap pb-14 sm:pb-16 lg:pb-20">
        <ul className="border-on-deep-line grid grid-cols-1 gap-10 border-t pt-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {footer.columns.map((column) => (
            <li key={column.id}>
              <nav aria-labelledby={`footer-${column.id}`}>
                <h2 id={`footer-${column.id}`} className="label-caps text-on-deep mb-3">
                  {column.title}
                </h2>
                {column.links.length > 0 && (
                  <ul className="flex flex-col">
                    {column.links.map((link) => (
                      <li key={`${column.id}-${link.href}`}>
                        <FooterLinkRow link={link} />
                      </li>
                    ))}
                  </ul>
                )}
                {column.lines.length > 0 && (
                  <div className="mt-3 flex flex-col gap-1.5">
                    {column.lines.map((line) =>
                      line.href === null ? (
                        <p key={line.text} className="text-on-deep-text text-sm font-light">
                          {line.text}
                        </p>
                      ) : (
                        <a
                          key={line.text}
                          href={line.href}
                          target="_blank"
                          rel="noopener"
                          className="text-on-deep-text hover:text-on-deep block text-sm font-light underline-offset-4 transition-colors duration-200 hover:underline"
                        >
                          {line.text}
                        </a>
                      ),
                    )}
                  </div>
                )}
              </nav>
            </li>
          ))}
        </ul>
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
        <p className="label-caps text-on-deep-text">
          © {year} {holder}
        </p>
        {footer.giving !== null && (
          <p className="text-on-deep-text text-xs font-light">{footer.giving}</p>
        )}
      </div>
    </footer>
  );
}
