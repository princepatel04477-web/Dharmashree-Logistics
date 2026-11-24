import {
  Building2Icon,
  BoxesIcon,
  CalendarClockIcon,
  CheckIcon,
  ClipboardListIcon,
  DoorOpenIcon,
  FactoryIcon,
  HandshakeIcon,
  MapPinIcon,
  NavigationIcon,
  PackageCheckIcon,
  RepeatIcon,
  RotateCcwIcon,
  RouteIcon,
  ScaleIcon,
  ScanLineIcon,
  SendIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  SlidersHorizontalIcon,
  TruckIcon,
  WarehouseIcon,
  ZapIcon,
  type LucideIcon,
} from "lucide-react";
import { DrawLine } from "@/components/motion/DrawLine";
import type { Service } from "@/content/types";

/* "What's included" for a service page: each row is an icon badge on
   --brand-tint, then the line from `services.ts`. Icons are chosen per row, in
   the order the bullets are written for that service; a service or a row the
   table does not cover falls back to a tick, so a new bullet never breaks the
   page. The badge is decoration (`aria-hidden`); the text carries the meaning. */

const ICONS: Readonly<Record<string, readonly LucideIcon[]>> = {
  "express-parcel": [
    DoorOpenIcon,
    RouteIcon,
    ScanLineIcon,
    Building2Icon,
    ShoppingBagIcon,
    BoxesIcon,
  ],
  "full-truckload": [
    TruckIcon,
    ShieldCheckIcon,
    CalendarClockIcon,
    RouteIcon,
    HandshakeIcon,
    FactoryIcon,
  ],
  "local-on-demand": [
    ZapIcon,
    MapPinIcon,
    NavigationIcon,
    ScaleIcon,
    CalendarClockIcon,
    RepeatIcon,
  ],
  "warehousing-fulfilment": [
    WarehouseIcon,
    ClipboardListIcon,
    PackageCheckIcon,
    SendIcon,
    RotateCcwIcon,
    SlidersHorizontalIcon,
  ],
};

function iconFor(service: Service, index: number): LucideIcon {
  return ICONS[service.slug]?.[index] ?? CheckIcon;
}

export function IncludedList({ service }: { service: Service }) {
  return (
    <ul className="flex flex-col">
      {service.bullets.map((bullet, index) => {
        const Icon = iconFor(service, index);
        return (
          <li key={bullet}>
            {/* DrawLine owns this hairline because it draws on entry, which a
                CSS border cannot. The first row needs no rule above it. */}
            {index > 0 && <DrawLine />}
            <div className="flex items-start gap-4 py-4">
              <span
                aria-hidden="true"
                className="bg-brand-tint text-brand grid size-10 shrink-0 place-items-center rounded-md"
              >
                <Icon className="size-5" strokeWidth={1.75} />
              </span>
              <p className="text-ink-2 max-w-measure leading-body pt-2 text-sm font-light">
                {bullet}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
