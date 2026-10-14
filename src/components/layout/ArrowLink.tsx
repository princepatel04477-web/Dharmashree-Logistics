import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

interface ArrowLinkProps {
  href: string;
  label: string;
  /** "on-deep" is for a --brand-deep or photo ground: white text, white rule
     and a white focus ring (the default ring is --brand, invisible there). */
  tone?: "default" | "on-deep";
}

/* The house text link for internal routes: mono caps, an accent hairline
   that draws in on hover, an arrow that nudges. Contact actions (tel:,
   mailto:, wa.me) never use this — they are plain <a> tags (house rule 10). */
export function ArrowLink({ href, label, tone = "default" }: ArrowLinkProps) {
  const onDeep = tone === "on-deep";
  return (
    <Link
      href={href}
      className={`group/arrow inline-flex min-h-11 items-center gap-2 font-mono text-[11px] tracking-[0.14em] uppercase ${
        onDeep ? "text-on-deep focus-visible:outline-on-deep" : "text-brand-deep"
      }`}
    >
      <span className="relative">
        {label}
        <span
          aria-hidden="true"
          className={`${onDeep ? "bg-on-deep" : "bg-brand"} absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 transition-transform duration-300 group-hover/arrow:scale-x-100`}
        />
      </span>
      <ArrowRightIcon
        aria-hidden="true"
        className={`size-4 transition-transform duration-200 group-hover/arrow:translate-x-0.5 ${onDeep ? "" : "text-brand"}`}
      />
    </Link>
  );
}
