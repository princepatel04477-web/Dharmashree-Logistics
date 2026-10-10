import { contact } from "@/content/contact";
import { partners } from "@/content/partners";
import { formatPhoneIN } from "@/lib/format";

/* The branches and delivery partners on /contact: one card per entry in
   `partners.ts`, the city as the heading. The addresses and numbers are the
   company profile's, printed as given; a partner with no phone shows no phone
   rows, never a dead link. Numbers are plain `tel:` anchors (house rule 10),
   grouped +91 XXXXX XXXXX (rule 13). Cards sit on --paper over the section's
   --brand-tint ground. */

export function BranchList() {
  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {partners.map((partner) => (
        <li
          key={partner.id}
          className="border-line bg-paper flex flex-col gap-5 rounded-xs border p-6"
        >
          <div className="flex flex-col gap-1">
            <h3 className="font-display text-ink leading-headline tracking-display text-2xl">
              {partner.city}
            </h3>
            <p className="label-caps">{partner.name}</p>
          </div>
          <address className="text-ink-2 text-sm leading-relaxed font-light not-italic">
            {partner.addressLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
          {partner.phones.length > 0 && (
            <ul aria-label={contact.branches.phonesLabel} className="flex flex-col">
              {partner.phones.map((phone) => (
                <li key={phone}>
                  <a
                    href={`tel:${phone}`}
                    className="text-brand-deep hover:text-ink inline-flex min-h-11 items-center font-mono text-sm underline-offset-4 transition-colors duration-200 hover:underline"
                  >
                    {formatPhoneIN(phone)}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}
