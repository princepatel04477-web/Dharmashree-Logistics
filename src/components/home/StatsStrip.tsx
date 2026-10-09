import Link from "next/link";
import { CountUp } from "@/components/vendor/reactbits";
import { homeStats, servicesStrip } from "@/content/home";
import { services } from "@/content/services";
import { HomeIcon, serviceIcon } from "./shared";

/* H1 · Facts strip, on `--brand`. It renders the company facts that exist and
   nothing else: `homeStats()` returns the non-null figures from `company.ts`,
   and only when at least two exist (house rule 4: never an invented number).
   While the facts are null the strip shows the four services as icon + label
   chips instead, each a link to its page. Years never count up and are never
   digit-grouped. */

export function StatsStrip() {
  const stats = homeStats();

  if (stats.length > 0) {
    return (
      <section className="bg-brand text-on-deep py-10 sm:py-12">
        <dl className="wrap grid grid-cols-1 gap-x-8 divide-y divide-[color:var(--on-deep-line)] sm:grid-cols-2 sm:divide-y-0 lg:auto-cols-fr lg:grid-flow-col lg:divide-x">
          {stats.map((stat) => (
            <div key={stat.id} className="flex flex-col-reverse gap-2 py-5 lg:px-8 lg:py-2">
              {/* A cell with no label omits the row entirely: no empty dt. */}
              {stat.label !== "" && <dt className="label-caps text-on-deep-text">{stat.label}</dt>}
              <dd className="font-display text-on-deep tracking-display text-4xl leading-none sm:text-5xl">
                {stat.count !== null ? <CountUp to={stat.count} duration={1.4} /> : stat.staticText}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    );
  }

  if (services.length === 0) return null;

  return (
    <section className="bg-brand text-on-deep py-6 sm:py-7" aria-label={servicesStrip.ariaLabel}>
      <ul className="wrap grid grid-cols-2 gap-3 lg:grid-cols-4">
        {services.map((service) => {
          return (
            <li key={service.slug}>
              <Link
                href={`/services/${service.slug}`}
                className="group/chip border-on-deep-line hover:bg-on-deep-band hover:border-on-deep-text focus-visible:outline-paper flex h-full items-center justify-center gap-2.5 rounded-md border px-4 py-3.5 text-center text-sm font-normal transition-colors duration-200"
              >
                <HomeIcon
                  name={serviceIcon(service.slug)}
                  aria-hidden="true"
                  className="size-5 shrink-0"
                  strokeWidth={1.5}
                />
                <span>{service.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
