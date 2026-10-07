import { skipLink } from "@/content/navigation";

/* First focusable element in the document. Parked above the viewport with a
   transform — never `display: none` — so it stays focusable, and it slides
   down while focused. Targets `<main id="main">` (see layout.tsx), which
   carries `tabIndex={-1}` so the jump really lands. */
export function SkipLink() {
  return (
    <a
      href={skipLink.href}
      className="bg-ink text-paper fixed top-3 left-3 z-[100] -translate-y-[200%] rounded-xs px-4 py-2.5 font-mono text-[11px] tracking-[0.14em] uppercase shadow-xs transition-transform duration-150 focus:translate-y-0"
    >
      {skipLink.label}
    </a>
  );
}
