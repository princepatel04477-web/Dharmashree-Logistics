import { useEffect, useState } from "react";
import { HUBS } from "@/content/hubs";
import { partners as defaultPartners } from "@/content/partners";
import type { Partner } from "@/content/types";
import { isIndianMobile } from "@/lib/validate";

export const CUSTOM_PARTNERS_STORAGE_KEY = "dsl_custom_delivery_partners";
export const PARTNERS_UPDATED_EVENT = "dsl:delivery-partners-updated";

export interface CustomDeliveryPartner {
  readonly id: string;
  readonly name: string;
  readonly city: string;
  readonly addressLines: readonly string[];
  readonly phones: readonly string[];
  readonly mapsUrl: string;
  readonly createdAt: string;
}

export function buildGoogleMapsUrl(address: string, city: string): string {
  const query = [address.trim(), city.trim()].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Known coordinates for prominent UP hubs for map pins fallback. */
const CITY_COORDINATES: Record<string, [number, number]> = {
  lucknow: [26.8467, 80.9462],
  kanpur: [26.4499, 80.3319],
  sandila: [27.0667, 80.5],
  hardoi: [27.3964, 80.1316],
  raebareli: [26.2124, 81.2325],
  "rai-barelly": [26.2124, 81.2325],
  varanasi: [25.3176, 82.9739],
  prayagraj: [25.4358, 81.8463],
  allahabad: [25.4358, 81.8463],
  gorakhpur: [26.7606, 83.3732],
  agra: [27.1767, 78.0081],
  meerut: [28.9845, 77.7064],
  bareilly: [28.367, 79.4304],
  aligarh: [27.8974, 78.088],
  moradabad: [28.8386, 78.7733],
  jhansi: [25.4484, 78.5685],
  ayodhya: [26.7922, 82.1998],
  faizabad: [26.7922, 82.1998],
  mathura: [27.4924, 77.6737],
  ghaziabad: [28.6692, 77.4538],
  noida: [28.5355, 77.391],
  muzaffarnagar: [29.4727, 77.7085],
  saharanpur: [29.964, 77.546],
};

const DEFAULT_UP_LAT_LNG: readonly [number, number] = [26.8467, 80.9462];

export function customToPartner(item: CustomDeliveryPartner): Partner {
  const normalizedCity = item.city.toLowerCase().trim();
  const matchedHub = HUBS.find(
    (h) => h.id === normalizedCity || h.name.toLowerCase() === normalizedCity,
  );
  const hubId = matchedHub !== undefined ? matchedHub.id : null;
  const latLng = CITY_COORDINATES[normalizedCity] ?? DEFAULT_UP_LAT_LNG;

  return {
    id: item.id,
    name: item.name,
    city: item.city,
    addressLines: item.addressLines,
    phones: item.phones,
    mapsUrl: item.mapsUrl,
    hubId,
    latLng,
  };
}

function readStoredCustomPartners(): CustomDeliveryPartner[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_PARTNERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const result: CustomDeliveryPartner[] = [];
    for (const item of parsed) {
      if (
        typeof item === "object" &&
        item !== null &&
        typeof (item as Record<string, unknown>).id === "string" &&
        typeof (item as Record<string, unknown>).name === "string" &&
        typeof (item as Record<string, unknown>).city === "string"
      ) {
        const obj = item as Record<string, unknown>;
        const addressLines = Array.isArray(obj.addressLines)
          ? obj.addressLines.filter((l): l is string => typeof l === "string")
          : [];
        const phones = Array.isArray(obj.phones)
          ? obj.phones.filter((p): p is string => typeof p === "string")
          : [];
        const mapsUrl = typeof obj.mapsUrl === "string" ? obj.mapsUrl : "";
        const createdAt = typeof obj.createdAt === "string" ? obj.createdAt : "";
        result.push({
          id: obj.id as string,
          name: obj.name as string,
          city: obj.city as string,
          addressLines,
          phones,
          mapsUrl,
          createdAt,
        });
      }
    }
    return result;
  } catch {
    return [];
  }
}

function writeStoredCustomPartners(partners: CustomDeliveryPartner[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CUSTOM_PARTNERS_STORAGE_KEY, JSON.stringify(partners));
    window.dispatchEvent(new CustomEvent(PARTNERS_UPDATED_EVENT));
  } catch {
    // Storage quota or disabled: ignore
  }
}

export async function fetchCustomPartners(): Promise<CustomDeliveryPartner[]> {
  const cached = readStoredCustomPartners();
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  if (isLocalhost) return cached;

  try {
    const response = await fetch("/api/delivery-partners", { cache: "no-store" });
    if (response.ok) {
      const data = (await response.json()) as { partners?: unknown };
      if (Array.isArray(data.partners)) {
        const remote = data.partners as CustomDeliveryPartner[];
        writeStoredCustomPartners(remote);
        return remote;
      }
    }
  } catch {
    // Offline or static preview
  }
  return cached;
}

export async function addCustomPartner(input: {
  name: string;
  city: string;
  address: string;
  phone: string;
  mapsUrl?: string;
}): Promise<{ ok: boolean; partner?: CustomDeliveryPartner; error?: string }> {
  const name = input.name.trim();
  const city = input.city.trim();
  const address = input.address.trim();
  const phone = input.phone.trim();
  const customMapsUrl = input.mapsUrl?.trim() ?? "";

  if (!name || !city || !address || !phone) {
    return { ok: false, error: "Please fill all required fields." };
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
    const digits = p.replace(/[\s-]/g, "");
    if (/^\d{10}$/.test(digits) && isIndianMobile(digits)) {
      return `+91${digits}`;
    }
    if (/^\+91\d{10}$/.test(digits)) {
      return digits;
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

  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  if (!isLocalhost) {
    try {
      const response = await fetch("/api/admin/delivery-partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          city,
          address,
          phone,
          mapsUrl,
        }),
      });
      if (response.ok) {
        const resData = (await response.json()) as {
          ok: boolean;
          partner?: CustomDeliveryPartner;
          partners?: CustomDeliveryPartner[];
        };
        if (resData.ok && resData.partners) {
          writeStoredCustomPartners(resData.partners);
          return { ok: true, partner: resData.partner ?? newPartner };
        }
      }
    } catch {
      // Dev fallback
    }
  }

  // Fallback to localStorage (for dev mode or offline preview)
  const current = readStoredCustomPartners();
  const updated = [newPartner, ...current];
  writeStoredCustomPartners(updated);
  return { ok: true, partner: newPartner };
}

export async function deleteCustomPartner(id: string): Promise<{ ok: boolean }> {
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  if (!isLocalhost) {
    try {
      const response = await fetch(`/api/admin/delivery-partners?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (response.ok) {
        const resData = (await response.json()) as {
          ok: boolean;
          partners?: CustomDeliveryPartner[];
        };
        if (resData.ok && resData.partners) {
          writeStoredCustomPartners(resData.partners);
          return { ok: true };
        }
      }
    } catch {
      // Dev fallback
    }
  }

  const current = readStoredCustomPartners();
  const updated = current.filter((p) => p.id !== id);
  writeStoredCustomPartners(updated);
  return { ok: true };
  return { ok: true };
}

/** Hook that returns all delivery partners (defaults + added custom partners). */
export function useDeliveryPartners(): {
  allPartners: readonly Partner[];
  customPartners: readonly CustomDeliveryPartner[];
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const [customPartners, setCustomPartners] = useState<CustomDeliveryPartner[]>(() =>
    readStoredCustomPartners(),
  );
  const [loading, setLoading] = useState<boolean>(true);

  const load = async (): Promise<void> => {
    const remote = await fetchCustomPartners();
    setCustomPartners(remote);
    setLoading(false);
  };

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });

    const handleUpdate = () => {
      setCustomPartners(readStoredCustomPartners());
    };

    window.addEventListener(PARTNERS_UPDATED_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(PARTNERS_UPDATED_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const convertedCustom = customPartners.map(customToPartner);
  const allPartners = [...defaultPartners, ...convertedCustom];

  return {
    allPartners,
    customPartners,
    loading,
    refresh: load,
  };
}
