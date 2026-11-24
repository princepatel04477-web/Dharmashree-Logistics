/* GET /api/admin/delivery-partners  → { ok: true, partners: CustomDeliveryPartner[] }
   POST /api/admin/delivery-partners { name, city, address, phone, mapsUrl? } → adds partner
   DELETE /api/admin/delivery-partners?id=… → deletes partner

   Behind _middleware.ts, so requires valid admin session. */

import {
  buildGoogleMapsUrl,
  json,
  loadDeliveryPartners,
  readJsonBody,
  saveDeliveryPartners,
  type CustomDeliveryPartner,
  type PagesContext,
} from "../../../src/lib/desk/server";

export async function onRequestGet(context: PagesContext): Promise<Response> {
  const db = context.env.DESK_DB;
  if (db === undefined) return json(503, { error: "NO_DATABASE" });
  try {
    const partners = await loadDeliveryPartners(db);
    return json(200, { ok: true, partners });
  } catch {
    return json(500, { error: "LOAD_FAILED" });
  }
}

export async function onRequestPost(context: PagesContext): Promise<Response> {
  const { request, env } = context;
  const db = env.DESK_DB;
  if (db === undefined) return json(503, { error: "NO_DATABASE" });

  if (!(request.headers.get("Content-Type") ?? "").includes("application/json")) {
    return json(415, { error: "NOT_JSON" });
  }

  const body = (await readJsonBody(request, 8_000)) as Record<string, unknown> | null;
  if (body === null || typeof body !== "object") {
    return json(400, { error: "BAD_REQUEST" });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const city = typeof body.city === "string" ? body.city.trim() : "";
  const address = typeof body.address === "string" ? body.address.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const customMapsUrl = typeof body.mapsUrl === "string" ? body.mapsUrl.trim() : "";

  if (!name || !city || !address || !phone) {
    return json(400, { error: "MISSING_REQUIRED_FIELDS" });
  }

  const addressLines = address
    .split(/[\r\n]+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const rawPhones = phone
    .split(/[,|/]+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const formattedPhones = rawPhones.map((p) => {
    const cleaned = p.replace(/[\s-]/g, "");
    if (/^\d{10}$/.test(cleaned)) {
      return `+91${cleaned}`;
    }
    if (/^(\+91|91)\d{10}$/.test(cleaned)) {
      return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
    }
    return p;
  });

  const mapsUrl = customMapsUrl || buildGoogleMapsUrl(addressLines.join(", "), city);
  const id = `partner-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  const newPartner: CustomDeliveryPartner = {
    id,
    name,
    city,
    addressLines,
    phones: formattedPhones,
    mapsUrl,
    createdAt: new Date().toISOString(),
  };

  try {
    const current = await loadDeliveryPartners(db);
    const updated = [newPartner, ...current];
    await saveDeliveryPartners(db, updated);
    return json(200, { ok: true, partner: newPartner, partners: updated });
  } catch {
    return json(500, { error: "SAVE_FAILED" });
  }
}

export async function onRequestDelete(context: PagesContext): Promise<Response> {
  const { request, env } = context;
  const db = env.DESK_DB;
  if (db === undefined) return json(503, { error: "NO_DATABASE" });

  const url = new URL(request.url);
  let id = url.searchParams.get("id") ?? "";

  if (!id && (request.headers.get("Content-Type") ?? "").includes("application/json")) {
    const body = (await readJsonBody(request, 2_000)) as Record<string, unknown> | null;
    if (body !== null && typeof body.id === "string") {
      id = body.id;
    }
  }

  if (!id) {
    return json(400, { error: "MISSING_ID" });
  }

  try {
    const current = await loadDeliveryPartners(db);
    const updated = current.filter((p) => p.id !== id);
    await saveDeliveryPartners(db, updated);
    return json(200, { ok: true, partners: updated });
  } catch {
    return json(500, { error: "DELETE_FAILED" });
  }
}
