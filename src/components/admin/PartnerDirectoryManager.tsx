"use client";

import {
  ExternalLinkIcon,
  MapPinIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";
import { useId, useMemo, useState, type FormEvent, type ReactElement } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { admin } from "@/content/admin";
import { partners as defaultPartners } from "@/content/partners";
import {
  addCustomPartner,
  buildGoogleMapsUrl,
  deleteCustomPartner,
  useDeliveryPartners,
} from "@/lib/delivery-partners";
import { formatPhoneIN } from "@/lib/format";

const ERROR_TEXT = "text-brand font-mono text-[11px] leading-body";

export function PartnerDirectoryManager(): ReactElement {
  const cityId = useId();
  const nameId = useId();
  const addressId = useId();
  const phoneId = useId();
  const mapsId = useId();
  const autoMapsId = useId();
  const searchId = useId();

  const { customPartners, allPartners, loading, refresh } = useDeliveryPartners();

  // Form state
  const [city, setCity] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [customMapsUrl, setCustomMapsUrl] = useState("");
  const [autoMaps, setAutoMaps] = useState(true);

  // Submission & filter state
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const copy = admin.partnersManager;

  // Compute active maps URL (auto or custom)
  const activeMapsUrl = autoMaps ? buildGoogleMapsUrl(address, city) : customMapsUrl;

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (busy) return;

    if (!city.trim() || !name.trim() || !address.trim() || !phone.trim()) {
      setError(copy.errors.Required);
      return;
    }

    setBusy(true);
    setError(null);
    setSuccess(null);

    const result = await addCustomPartner({
      city,
      name,
      address,
      phone,
      mapsUrl: activeMapsUrl,
    });

    setBusy(false);

    if (result.ok) {
      setSuccess(copy.saved);
      setCity("");
      setName("");
      setAddress("");
      setPhone("");
      setCustomMapsUrl("");
      setAutoMaps(true);
      void refresh();
    } else {
      setError(result.error ?? copy.errors.Failed);
    }
  }

  async function handleDelete(id: string): Promise<void> {
    if (deletingId) return;
    if (!window.confirm(copy.confirmDelete)) return;

    setDeletingId(id);
    const result = await deleteCustomPartner(id);
    setDeletingId(null);
    if (result.ok) {
      void refresh();
    }
  }

  // Filtered partners
  const filteredPartners = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return allPartners;
    return allPartners.filter((p) => {
      const matchCity = p.city.toLowerCase().includes(q);
      const matchName = p.name.toLowerCase().includes(q);
      const matchAddress = p.addressLines.some((l) => l.toLowerCase().includes(q));
      const matchPhones = p.phones.some((num) => num.includes(q));
      return matchCity || matchName || matchAddress || matchPhones;
    });
  }, [allPartners, search]);

  const defaultIds = useMemo(() => new Set(defaultPartners.map((p) => p.id)), []);

  return (
    <div className="flex flex-col gap-10">
      {/* Intro */}
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-ink text-2xl sm:text-3xl">{copy.title}</h2>
        <p className="text-ink-2 max-w-measure text-sm font-light leading-relaxed">{copy.lede}</p>
      </div>

      {/* Add Partner Form */}
      <section
        aria-labelledby="add-partner-title"
        className="border-line bg-paper rounded-xs border p-6 sm:p-8"
      >
        <div className="flex items-center gap-2 border-b border-line pb-4 mb-6">
          <PlusIcon className="text-brand size-5" aria-hidden="true" />
          <h3 id="add-partner-title" className="font-display text-ink text-xl">
            {copy.addTitle}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* City */}
            <div className="space-y-2">
              <Label htmlFor={cityId}>{copy.cityLabel}</Label>
              <Input
                id={cityId}
                type="text"
                required
                value={city}
                placeholder={copy.cityPlaceholder}
                onChange={(e) => {
                  setCity(e.target.value);
                  setError(null);
                }}
              />
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor={nameId}>{copy.nameLabel}</Label>
              <Input
                id={nameId}
                type="text"
                required
                value={name}
                placeholder={copy.namePlaceholder}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor={addressId}>{copy.addressLabel}</Label>
              <Textarea
                id={addressId}
                required
                rows={3}
                value={address}
                placeholder={copy.addressPlaceholder}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setError(null);
                }}
              />
            </div>

            {/* Mobile / Phone & Maps Options */}
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor={phoneId}>{copy.phoneLabel}</Label>
                <Input
                  id={phoneId}
                  type="tel"
                  required
                  value={phone}
                  placeholder={copy.phonePlaceholder}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setError(null);
                  }}
                />
              </div>

              {/* Google Maps Link Option */}
              <div className="border-line bg-paper-2 rounded-xs border p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={autoMapsId}
                    checked={autoMaps}
                    onCheckedChange={(checked) => setAutoMaps(checked === true)}
                  />
                  <Label htmlFor={autoMapsId} className="cursor-pointer text-xs font-normal">
                    {copy.mapsAutoLabel}
                  </Label>
                </div>

                {!autoMaps && (
                  <div className="space-y-1 pt-1">
                    <Label htmlFor={mapsId} className="text-xs">
                      {copy.mapsCustomLabel}
                    </Label>
                    <Input
                      id={mapsId}
                      type="url"
                      value={customMapsUrl}
                      placeholder="https://maps.google.com/..."
                      onChange={(e) => setCustomMapsUrl(e.target.value)}
                    />
                  </div>
                )}

                {activeMapsUrl && (
                  <a
                    href={activeMapsUrl}
                    target="_blank"
                    rel="noopener"
                    className="text-brand hover:text-brand-deep inline-flex items-center gap-1 text-xs underline underline-offset-2 pt-1 font-mono"
                  >
                    <ExternalLinkIcon className="size-3" aria-hidden="true" />
                    {copy.mapsPreview}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Feedback */}
          {error && (
            <p role="alert" className={ERROR_TEXT}>
              {error}
            </p>
          )}
          {success && (
            <p role="status" className="text-brand text-xs font-mono">
              {success}
            </p>
          )}

          {/* Submit */}
          <div className="flex justify-start">
            <Button type="submit" disabled={busy} size="lg">
              {busy ? copy.submitting : copy.submit}
            </Button>
          </div>
        </form>
      </section>

      {/* Directory List & Search */}
      <section aria-labelledby="all-partners-title" className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
          <div>
            <h3 id="all-partners-title" className="font-display text-ink text-xl">
              All delivery partners
            </h3>
            <p className="text-ink-2 text-xs font-light">
              {copy.baseCount(defaultPartners.length)} · {copy.customCount(customPartners.length)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={() => {
                void refresh();
              }}
            >
              <RefreshCwIcon
                className={loading ? "size-3.5 animate-spin" : "size-3.5"}
                aria-hidden="true"
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filter Input */}
        <div className="relative max-w-md">
          <SearchIcon
            className="text-ink-3 pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4"
            aria-hidden="true"
          />
          <Input
            id={searchId}
            type="search"
            value={search}
            placeholder={copy.filterPlaceholder}
            className="pl-9"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPartners.map((partner) => {
            const isCustom = !defaultIds.has(partner.id);
            return (
              <div
                key={partner.id}
                className="border-line bg-paper rounded-xs border p-5 flex flex-col justify-between gap-4"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="label-caps block text-xs">{partner.city}</span>
                      <h4 className="font-display text-ink text-lg leading-snug">{partner.name}</h4>
                    </div>
                    <span
                      className={`text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-full ${
                        isCustom
                          ? "bg-brand/10 text-brand border border-brand/20"
                          : "bg-paper-2 text-ink-3 border border-line"
                      }`}
                    >
                      {isCustom ? copy.customBadge : copy.defaultBadge}
                    </span>
                  </div>

                  {/* Address */}
                  <address className="not-italic text-ink-2 text-xs leading-relaxed font-light">
                    {partner.addressLines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </address>

                  {/* Maps link */}
                  {partner.mapsUrl && (
                    <a
                      href={partner.mapsUrl}
                      target="_blank"
                      rel="noopener"
                      className="text-brand hover:text-brand-deep inline-flex items-center gap-1 text-xs font-mono underline underline-offset-2"
                    >
                      <MapPinIcon className="size-3" aria-hidden="true" />
                      Google Maps ↗
                    </a>
                  )}

                  {/* Phones */}
                  {partner.phones.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {partner.phones.map((phone) => (
                        <a
                          key={phone}
                          href={`tel:${phone}`}
                          className="font-mono text-xs text-ink hover:text-brand underline underline-offset-2"
                        >
                          {formatPhoneIN(phone)}
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                {isCustom && (
                  <div className="border-t border-line pt-3 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-signal-red hover:text-signal-red hover:bg-signal-red/10 text-xs h-8 px-2"
                      disabled={deletingId === partner.id}
                      onClick={() => void handleDelete(partner.id)}
                    >
                      <Trash2Icon className="size-3.5 mr-1" aria-hidden="true" />
                      {deletingId === partner.id ? copy.deleting : copy.delete}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
