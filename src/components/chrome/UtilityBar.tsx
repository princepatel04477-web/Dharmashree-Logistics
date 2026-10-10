import { hasUtilityBar, utilityBar, type UtilityLink } from "@/content/navigation";

/* Utility bar (lg+ only): a 32px --brand-deep strip above the header. Contact
   facts sit on the left, the giving line on the right as plain text. The portal
   sign-ins are buttons in the header itself, so they are not repeated here. The
   bar lives inside the fixed <header>, so it stays put with it. Contact links
   are plain <a> tags (house rule 10). Items whose value is null never reach
   this list. */

const LINK_CLASS =
  "text-on-deep inline-flex h-8 items-center font-mono text-[11px] underline-offset-4 transition-colors duration-200 hover:underline focus-visible:-outline-offset-2 focus-visible:outline-on-deep";
/* Contact details are shown as written: an email address or a phone number in
   capitals reads wrongly. */
const CONTACT_CLASS = "tracking-[0.04em] normal-case";

function UtilityAnchor({ link }: { link: UtilityLink }) {
  return (
    <a href={link.href} className={`${LINK_CLASS} ${CONTACT_CLASS}`}>
      {link.label}
    </a>
  );
}

export function UtilityBar() {
  if (!hasUtilityBar) return null;
  return (
    <div className="bg-brand-deep text-on-deep hidden h-8 lg:block">
      <div className="wrap flex h-full items-center justify-between gap-8">
        {utilityBar.contact.length > 0 && (
          <nav aria-label={utilityBar.ariaLabel}>
            <ul className="flex items-center gap-6">
              {utilityBar.contact.map((link) => (
                <li key={link.id}>
                  <UtilityAnchor link={link} />
                </li>
              ))}
            </ul>
          </nav>
        )}
        {utilityBar.giving !== null && (
          <p className="text-on-deep ml-auto font-mono text-[11px] tracking-[0.04em]">
            {utilityBar.giving}
          </p>
        )}
      </div>
    </div>
  );
}
