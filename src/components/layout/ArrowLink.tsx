import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

interface ArrowLinkProps {
  href: string;
  label: string;
}

/* The house text link for internal routes: mono caps, an accent hairline
   that draws in on hover, an arrow that nudges. Contact actions (tel:,
   mailto:, wa.me) never use this — they are plain <a> tags (house rule 10). */
export function ArrowLink({ href, label }: ArrowLinkProps) {
  return (
    <Link
      href={href}
      className="group/arrow text-accent-ink inline-flex min-h-11 items-center gap-2 font-mono text-[11px] tracking-[0.14em] uppercase"
    >
      <span className="relative">
        {label}
        <span
          aria-hidden="true"
          className="bg-accent absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 transition-transform duration-300 group-hover/arrow:scale-x-100"
        />
      </span>
      <ArrowRightIcon
        aria-hidden="true"
        className="size-4 transition-transform duration-200 group-hover/arrow:translate-x-0.5"
      />
    </Link>
  );
}
