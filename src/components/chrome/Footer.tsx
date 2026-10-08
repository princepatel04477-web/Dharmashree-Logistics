import Image from "next/image";
import Link from "next/link";
import { LogoLoop } from "@/components/vendor/reactbits";
import { Button } from "@/components/ui/button";
import { company } from "@/content/company";
import { credit, footer, logo, quoteCta, type FooterLink } from "@/content/navigation";

/* Site footer (Prompt 04). Top band = one display line plus the outline quote
   button; then the link columns; then the decorative hub band; then the legal
   row. Every row is built from `navigation.ts`, which already dropped the
   `null` facts, so nothing here renders an empty line (house rule 4). */

function FooterLinkRow({ link }: { link: FooterLink }) {
  const base =
    "text-ink-2 hover:text-ink inline-block py-1 text-sm font-light transition-colors duration-200";
  if (link.kind === "route") {
    return (
      <Link href={link.href} className={base}>
        {link.label}
      </Link>
    );
  }
  return (
    <a
      href={link.href}
      target={link.kind === "whatsapp" ? "_blank" : undefined}
      rel={link.kind === "whatsapp" ? "noopener" : undefined}
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
    <footer className="border-line bg-paper mt-24 border-t">
      {/* ——— Top band ——— */}
      <div className="wrap flex flex-col items-start gap-8 py-14 sm:py-16 lg:flex-row lg:items-end lg:justify-between lg:gap-16 lg:py-20">
        <div className="flex flex-col items-start gap-6">
          <Image
            src={logo.src}
            alt={company.name}
            width={logo.width}
            height={logo.height}
            className="h-8 w-auto"
          />
          <p className="font-display text-headline leading-headline tracking-display font-light">
            {footer.slogan}
          </p>
        </div>
        <Button asChild variant="outline" size="lg" className="shrink-0">
          <Link href={quoteCta.href}>{footer.ctaLabel}</Link>
        </Button>
      </div>

      {/* ——— Columns ——— */}
      <div className="wrap pb-14 sm:pb-16 lg:pb-20">
        <ul className="border-line grid grid-cols-1 gap-10 border-t pt-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {footer.columns.map((column) => (
            <li key={column.id}>
              <nav aria-labelledby={`footer-${column.id}`}>
                <h2 id={`footer-${column.id}`} className="label-caps mb-3">
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
                        <p key={line.text} className="text-ink-2 text-sm font-light">
                          {line.text}
                        </p>
                      ) : (
                        <a
                          key={line.text}
                          href={line.href}
                          target="_blank"
                          rel="noopener"
                          className="text-ink-2 hover:text-ink block text-sm font-light transition-colors duration-200"
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
        duration={60}
        separator="·"
        separatorClassName="text-accent"
        itemClassName="label-caps"
        decorative
      />

      {/* ——— Legal row ——— */}
      <div className="wrap flex flex-col gap-2 py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="label-caps">
          © {year} {holder}
        </p>
        {credit.url === null ? (
          <p className="label-caps">
            {credit.prefix} {credit.name}
          </p>
        ) : (
          <p className="label-caps">
            {credit.prefix}{" "}
            <a
              href={credit.url}
              target="_blank"
              rel="noopener"
              className="hover:text-accent-ink underline-offset-4 transition-colors duration-200 hover:underline"
            >
              {credit.name}
            </a>
          </p>
        )}
      </div>
    </footer>
  );
}
