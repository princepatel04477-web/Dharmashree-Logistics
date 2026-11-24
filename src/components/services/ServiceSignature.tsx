import { DedicatedBlock } from "@/components/services/signature/DedicatedBlock";
import { JourneyBlock } from "@/components/services/signature/JourneyBlock";
import { LoopBlock } from "@/components/services/signature/LoopBlock";
import { SelectorBlock } from "@/components/services/signature/SelectorBlock";
import type { Service } from "@/content/types";

/* The one interactive block a service page puts between its hero and its
   numbered sections (Prompt 11). The profile gives each service a different
   story, so `Service.signature` is a discriminated union and this is the only
   place that switches on it — a new kind is a compile error here until it has
   a block. */
export function ServiceSignature({ service }: { service: Service }) {
  const { signature } = service;
  switch (signature.kind) {
    case "journey":
      return <JourneyBlock signature={signature} />;
    case "dedicated":
      return <DedicatedBlock signature={signature} />;
    case "selector":
      return <SelectorBlock signature={signature} serviceSlug={service.slug} />;
    case "loop":
      return <LoopBlock signature={signature} />;
  }
}
