import type { ReactNode } from "react";

/* Wraps an inner page so every numbered section label ("01", "02", …) reads in
   --brand instead of the retired gold. Phase 6 re-homes `.section-index` itself
   and this wrapper then goes. `PageIntro` marks its own label `!important`, so
   the label on a photo band stays white. */
export function InnerPage({ children }: { children: ReactNode }) {
  return <div className="[&_.section-index]:text-brand">{children}</div>;
}
