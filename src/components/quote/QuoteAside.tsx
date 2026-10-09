import { company } from "@/content/company";
import { whatsapp, whatsappLink } from "@/content/navigation";
import { quote } from "@/content/quote";
import { formatPhoneIN } from "@/lib/format";

/* The rail beside the form (Prompt 08).

   A server component: nothing here changes after the page is built, so it costs
   the form's bundle nothing. The contact rows follow the same rule as every
   other page — a `null` fact removes its row, and with all of them `null` the
   aside says so in one line instead of rendering an empty block (house rule 4).
   No button here: the page's one filled button is the form's submit. */

interface DeskRow {
  readonly label: string;
  readonly href: string;
  readonly value: string;
  readonly external: boolean;
}

function deskRows(): DeskRow[] {
  const rows: DeskRow[] = [];
  const number = company.whatsapp;
  const link = number === null ? null : whatsappLink();

  if (number !== null && link !== null) {
    rows.push({ label: whatsapp.label, href: link, value: formatPhoneIN(number), external: true });
  }
  if (company.phone !== null) {
    rows.push({
      label: "Phone",
      href: `tel:${company.phone}`,
      value: formatPhoneIN(company.phone),
      external: false,
    });
  }
  if (company.email !== null) {
    rows.push({
      label: "Email",
      href: `mailto:${company.email}`,
      value: company.email,
      external: false,
    });
  }
  return rows;
}

export function QuoteAside() {
  const rows = deskRows();

  return (
    <aside className="border-line bg-paper-2 flex flex-col gap-6 rounded-xs border p-6 sm:p-8 lg:sticky lg:top-24 lg:col-span-4 lg:col-start-9 lg:self-start">
      <p className="label-caps">{quote.aside.title}</p>
      <p className="text-ink-2 max-w-measure leading-body text-sm font-light">{quote.aside.note}</p>

      <ol className="flex flex-col gap-3">
        {quote.aside.steps.map((line, index) => (
          <li key={line} className="flex items-start gap-3">
            <span className="text-brand shrink-0 font-mono text-[11px]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-ink-2 leading-body text-sm font-light">{line}</span>
          </li>
        ))}
      </ol>

      {rows.length === 0 ? (
        <p className="text-muted border-line leading-body border-t pt-5 text-xs font-light">
          {quote.aside.contactNote}
        </p>
      ) : (
        <ul className="border-line flex flex-col gap-2 border-t pt-5">
          {rows.map((row) => (
            <li key={row.label}>
              <a
                href={row.href}
                target={row.external ? "_blank" : undefined}
                rel={row.external ? "noopener" : undefined}
                className="text-ink-2 hover:text-ink inline-flex w-full items-center justify-between gap-4 text-sm font-light transition-colors duration-200"
              >
                <span className="label-caps shrink-0">{row.label}</span>
                <span className="min-w-0 truncate">{row.value}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
