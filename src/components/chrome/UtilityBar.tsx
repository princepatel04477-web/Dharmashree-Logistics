import { hasUtilityBar, utilityBar, type UtilityLink } from "@/content/navigation";

/* Utility bar (lg+ only): a 32px --brand-deep strip above the header. Contact
   facts sit on the left, the two billing-portal sign-ins on the right. It lives
   inside the fixed <header>, so it hides and reveals with it. Contact links and
   the portals are plain <a> tags (house rule 10); the portals leave the site, so
   they open in a new tab. Items whose value is null never reach this list. */

const LINK_CLASS =
  "text-on-deep inline-flex h-8 items-center font-mono text-[11px] underline-offset-4 transition-colors duration-200 hover:underline focus-visible:-outline-offset-2 focus-visible:outline-on-deep";
/* The portal links keep the mono small-caps voice. Contact details are shown as
   written: an email address or a phone number in capitals reads wrongly. */
const PORTAL_CLASS = "tracking-[0.14em] uppercase";
const CONTACT_CLASS = "tracking-[0.04em] normal-case";

function UtilityAnchor({ link }: { link: UtilityLink }) {
  const external = link.kind === "portal";
  return (
    <a
      href={link.href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`${LINK_CLASS} ${external ? PORTAL_CLASS : CONTACT_CLASS}`}
    >
      {link.label}
      {external && <span className="sr-only"> {utilityBar.newTabHint}</span>}
    </a>
  );
}

export function UtilityBar() {
  if (!hasUtilityBar) return null;
  return (
    <div className="bg-brand-deep text-on-deep hidden h-8 lg:block">
      <nav
        aria-label={utilityBar.ariaLabel}
        className="wrap flex h-full items-center justify-between gap-8"
      >
        <ul className="flex items-center gap-6">
          {utilityBar.contact.map((link) => (
            <li key={link.id}>
              <UtilityAnchor link={link} />
            </li>
          ))}
        </ul>
        <ul className="flex items-center gap-6">
          {utilityBar.portals.map((link) => (
            <li key={link.id}>
              <UtilityAnchor link={link} />
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
