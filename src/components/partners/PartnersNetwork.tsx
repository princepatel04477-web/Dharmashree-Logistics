"use client";

import { AnimatePresence, motion } from "motion/react";
import { MapSelectionProvider, useMapSelection } from "@/components/map/MapSelection";
import { PartnerMap } from "@/components/map/PartnerMap";
import { partners, partnersPage } from "@/content/partners";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { formatPhoneIN } from "@/lib/format";
import { MOTION_DURATIONS, MOTION_EASES } from "@/lib/motion-tokens";
import { cn, numbered } from "@/lib/utils";

/* Partner map + directory (Prompt 13). The map (cropped India, numbered pins)
   and the list share one selection: a pin and its row are two doors to the
   same partner, and the list is also the accessible alternative to the map.
   Motion owns the expand/collapse of a row's phone numbers (AnimatePresence,
   height + fade); the numbers are plain `tel:` anchors (house rule 10). A
   partner with no number published says so instead of showing a dead link. */

function PartnerList() {
  const reduced = useReducedMotionSafe();
  const [selectedId, select] = useMapSelection();
  const copy = partnersPage.network;

  return (
    <ol aria-label={copy.listLabel} className="divide-line border-line divide-y border-y">
      {partners.map((partner, position) => {
        const selected = partner.id === selectedId;
        const panelId = `partner-${partner.id}`;
        return (
          <li key={partner.id}>
            <button
              type="button"
              aria-expanded={selected}
              aria-controls={panelId}
              onClick={() => select(selected ? null : partner.id)}
              className="group/row flex min-h-16 w-full items-start gap-4 py-4 text-left"
            >
              <span className="section-index pt-1.5">{numbered(position)}</span>
              <span className="flex flex-1 flex-col gap-1">
                <span
                  className={cn(
                    "font-display leading-headline text-xl transition-colors duration-200 sm:text-2xl",
                    selected ? "text-accent-ink" : "text-ink group-hover/row:text-accent-ink",
                  )}
                >
                  {partner.name}
                </span>
                <span className="label-caps">{partner.city}</span>
              </span>
              <span aria-hidden="true" className="text-accent pt-1 font-mono text-sm">
                {selected ? "−" : "+"}
              </span>
            </button>
            <div id={panelId}>
              <AnimatePresence initial={false}>
                {selected && (
                  <motion.div
                    key="details"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{
                      duration: reduced ? 0 : MOTION_DURATIONS.sm,
                      ease: MOTION_EASES.out,
                    }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-5 pb-6 pl-10 sm:pl-12">
                      <div className="flex flex-col gap-1">
                        <p className="label-caps">{copy.addressLabel}</p>
                        <address className="text-ink-2 text-sm leading-relaxed font-light not-italic">
                          {partner.addressLines.map((line) => (
                            <span key={line} className="block">
                              {line}
                            </span>
                          ))}
                        </address>
                      </div>
                      {partner.phones.length > 0 ? (
                        <ul className="flex flex-wrap gap-x-6 gap-y-1">
                          {partner.phones.map((phone) => (
                            <li key={phone}>
                              <a
                                href={`tel:${phone}`}
                                className="text-ink hover:text-accent-ink inline-flex min-h-11 items-center gap-2 font-mono text-sm transition-colors duration-200"
                              >
                                <span className="label-caps">{copy.callLabel}</span>
                                {formatPhoneIN(phone)}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted text-xs font-light">{copy.noPhone}</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function PartnersNetwork() {
  return (
    <MapSelectionProvider>
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <PartnerMap className="mx-auto max-w-[26rem] lg:max-w-none" />
        </div>
        <div className="lg:col-span-7">
          <PartnerList />
        </div>
      </div>
    </MapSelectionProvider>
  );
}
