/* Unit check for the services catalogue (Prompt 06): the two lists that must
   stay one-for-one, the shape of every slug, and the fleet notes that no service
   claims. Run with `npm run verify:services`. */

import { about } from "../src/content/about";
import { company } from "../src/content/company";
import { fleetVehicles, notedVehicleNames } from "../src/content/fleet";
import { serviceImage } from "../src/content/images";
import { services } from "../src/content/services";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function fail(message: string): never {
  console.error(`verify:services FAILED — ${message}`);
  process.exit(1);
}

function main(): void {
  if (services.length === 0) fail("the catalogue is empty");

  if (services.length !== company.services.length) {
    fail(
      `${services.length} entries in services.ts vs ${String(company.services.length)} names in company.services`,
    );
  }

  services.forEach((service, index) => {
    const fact = company.services[index];
    if (fact !== service.name) {
      fail(`index ${String(index)}: "${service.name}" is not the fact "${String(fact)}"`);
    }
    if (!SLUG_PATTERN.test(service.slug)) fail(`slug "${service.slug}" is not url-safe`);
    if (service.summary.trim() === "") fail(`${service.slug}: empty summary`);
    if (service.body.length === 0) fail(`${service.slug}: no detail copy`);
    if (service.bullets.length === 0) fail(`${service.slug}: nothing included`);
    if (service.bestFor.length === 0) fail(`${service.slug}: nothing it fits`);
    if (service.questions.length === 0) fail(`${service.slug}: no questions`);
    for (const question of service.questions) {
      if (question.question.trim() === "" || question.answer.trim() === "") {
        fail(`${service.slug}: question with an empty side`);
      }
    }
  });

  const slugs = new Set(services.map((service) => service.slug));
  if (slugs.size !== services.length) fail("duplicate slug in services.ts");

  /* The About page's "Which business are you?" selector links by slug. */
  for (const kind of about.kinds.list) {
    if (kind.services.length === 0) fail(`about.kinds: "${kind.label}" lists no services`);
    for (const slug of kind.services) {
      if (!slugs.has(slug)) fail(`about.kinds: "${kind.label}" links to unknown service "${slug}"`);
    }
  }

  /* Each signature block carries the data its renderer needs. */
  for (const service of services) {
    const signature = service.signature;
    if (
      signature.kind === "journey" &&
      (signature.stops.length < 2 || signature.segments.length < 2)
    ) {
      fail(`${service.slug}: journey needs at least two stops and two segments`);
    }
    if (signature.kind === "dedicated" && signature.flow.length < 2) {
      fail(`${service.slug}: dedicated signature needs at least two flow legs`);
    }
    if (
      signature.kind === "selector" &&
      (signature.options.length < 2 || signature.modes.length < 2)
    ) {
      fail(`${service.slug}: selector needs at least two options and two modes`);
    }
    if (
      signature.kind === "loop" &&
      (signature.stages.length < 2 || signature.capabilities.length === 0)
    ) {
      fail(`${service.slug}: loop needs stages and capabilities`);
    }
    if (service.headline.trim() === "") fail(`${service.slug}: empty headline`);
  }

  /* Vehicles named by the selector options must be real fleet names or the
     generic "A larger vehicle" the profile uses. */
  const listedVehicles = new Set(services.flatMap((service) => [...service.vehicles]));
  for (const service of services) {
    if (service.signature.kind !== "selector") continue;
    for (const option of service.signature.options) {
      if (option.vehicle !== "A larger vehicle" && !listedVehicles.has(option.vehicle)) {
        fail(`${service.slug}: option "${option.label}" names unknown vehicle "${option.vehicle}"`);
      }
    }
  }

  const bullets = new Set<string>();
  for (const service of services) {
    for (const bullet of [...service.bullets, ...service.bestFor]) {
      if (bullets.has(bullet)) fail(`"${bullet}" is repeated across services — it belongs to one`);
      bullets.add(bullet);
    }
  }

  /* Fleet: the union is derived, so every service's vehicles must resolve to a
     card; and the default image key has to be the convention, not a typo. */
  const fleet = fleetVehicles();
  const listed = new Set(services.flatMap((service) => [...service.vehicles]));
  if (fleet.length !== listed.size) {
    fail(`fleet union is ${String(fleet.length)} of ${String(listed.size)} listed vehicles`);
  }
  for (const vehicle of fleet) {
    if (vehicle.note.trim() === "") {
      /* Legal (a name-only card is a real state), so it is reported by the
         check rather than silently missing from a page. */
      console.warn(`verify:services — vehicle "${vehicle.name}" has no note yet`);
    }
  }

  const orphanNotes = notedVehicleNames().filter((name) => !listed.has(name));
  if (orphanNotes.length > 0) {
    fail(`fleet notes with no service listing them: ${orphanNotes.join(", ")}`);
  }

  for (const service of services) {
    const slot = serviceImage(service.slug);
    if (slot === null) {
      fail(`${service.slug}: no photo slot in images.ts (services.<slug>)`);
    } else if (!slot.key.startsWith("services/") || slot.alt.trim() === "") {
      fail(`${service.slug}: photo slot "${slot.key}" is not a services/* key with alt text`);
    }
  }

  console.log(
    `verify:services OK — ${String(services.length)} services, names verbatim from company.services, ${String(fleet.length)} vehicles derived, no orphan notes`,
  );
}

main();
