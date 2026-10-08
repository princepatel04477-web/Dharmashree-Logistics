/* Unit check for the services catalogue (Prompt 06): the two lists that must
   stay one-for-one, the shape of every slug, and the fleet notes that no service
   claims. Run with `npm run verify:services`. */

import { company } from "../src/content/company";
import { fleetVehicles, notedVehicleNames } from "../src/content/fleet";
import { serviceImageKey, services } from "../src/content/services";

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
    /* An override may point anywhere in the manifest, but it still has to look
       like a manifest key: `<group>/<name>`. */
    if (service.image !== null && !/^[a-z0-9-]+\/[a-z0-9-]+$/.test(service.image)) {
      fail(`${service.slug}: image "${service.image}" is not a <group>/<name> manifest key`);
    }
  });

  const slugs = new Set(services.map((service) => service.slug));
  if (slugs.size !== services.length) fail("duplicate slug in services.ts");

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
    const key = serviceImageKey(service);
    if (service.image === null && key !== `services/${service.slug}`) {
      fail(`${service.slug}: default image key "${key}" does not follow services/<slug>`);
    }
  }

  console.log(
    `verify:services OK — ${String(services.length)} services, names verbatim from company.services, ${String(fleet.length)} vehicles derived, no orphan notes`,
  );
}

main();
