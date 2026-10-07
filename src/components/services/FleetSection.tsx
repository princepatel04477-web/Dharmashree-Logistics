import { ImageCurtain } from "@/components/motion/ImageCurtain";
import ResponsiveImage, { hasImage } from "@/components/media/ResponsiveImage";
import { InteractiveCard } from "@/components/vendor/lightswind";
import { vehicleImageKey } from "@/content/fleet";
import type { FleetVehicle } from "@/content/types";

/* The fleet grid (Prompt 06), shared by the `/services` index and every
   service page that names vehicles. The cards are the vendored Lightswind
   InteractiveCard, used as-is for its own effect: the tilt and the 4px lift
   stay, the hover elevation is switched off with `shadow={false}`, because a
   grid of six hovering shadows is a mood board. The prop defaults to on, so the
   `/styleguide` demo is untouched.

   A vehicle with no note in `fleet.ts` renders as a name-only card, and with no
   photo in the manifest it renders as text — the card never reserves a hole for
   a picture that does not exist. */

interface FleetSectionProps {
  vehicles: FleetVehicle[];
  /** Grid density: the index page runs wider than a service column. */
  density?: "index" | "detail";
}

export function FleetSection({ vehicles, density = "index" }: FleetSectionProps) {
  if (vehicles.length === 0) return null;

  const columns =
    density === "index" ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 2xl:grid-cols-3";

  return (
    <ul className={`grid grid-cols-1 gap-4 ${columns}`}>
      {vehicles.map((vehicle) => {
        const imageKey = vehicleImageKey(vehicle.name);
        const hasPhoto = hasImage(imageKey);

        return (
          <li key={vehicle.name} className="flex">
            <InteractiveCard shadow={false} className="flex w-full flex-col gap-5 p-6">
              {hasPhoto && (
                <ImageCurtain className="aspect-[4/5] w-full rounded-xs">
                  <ResponsiveImage
                    imageKey={imageKey}
                    alt={vehicle.name}
                    sizes={density === "index" ? "(max-width: 64rem) 100vw, 33vw" : "40vw"}
                  />
                </ImageCurtain>
              )}
              <div className="flex flex-col gap-2">
                <h3 className="font-display text-ink text-step-2 tracking-display leading-snug font-light">
                  {vehicle.name}
                </h3>
                {vehicle.note !== "" && (
                  <p className="text-ink-2 leading-body text-sm font-light">{vehicle.note}</p>
                )}
              </div>
            </InteractiveCard>
          </li>
        );
      })}
    </ul>
  );
}
