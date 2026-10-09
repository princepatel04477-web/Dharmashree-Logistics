import { CountUp } from "@/components/vendor/reactbits";
import { homeStats } from "@/content/home";
import { cn } from "@/lib/utils";

/* H1 · Stats strip. Maa Sheetla's ledger band: display numerals over
   small-caps labels, separated by hairlines. Only facts that exist are
   rendered, and `homeStats()` returns nothing at all when fewer than two are
   present — so the band either reads as a ledger or is absent (house rule 4).
   Years never count up and are never digit-grouped. */

const COLUMNS: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

export function StatsStrip() {
  const stats = homeStats();
  if (stats.length === 0) return null;

  return (
    <section className="border-line bg-paper-2 border-y py-10 sm:py-14">
      <dl
        className={cn(
          "border-line wrap grid grid-cols-1 gap-x-8 gap-y-0 divide-y",
          COLUMNS[stats.length] ?? "sm:grid-cols-2 lg:grid-cols-4",
          "lg:divide-x lg:divide-y-0",
        )}
      >
        {stats.map((stat) => (
          <div key={stat.id} className="flex flex-col-reverse gap-2 py-6 lg:px-8">
            {/* A cell with no label omits the row entirely — no empty dt. */}
            {stat.label !== "" && <dt className="label-caps">{stat.label}</dt>}
            <dd className="font-display text-headline text-signal tracking-display leading-none">
              {stat.count !== null ? <CountUp to={stat.count} duration={1.4} /> : stat.staticText}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
