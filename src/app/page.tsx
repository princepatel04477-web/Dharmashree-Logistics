import Link from "next/link";
import { company } from "@/content/company";

/* Temporary scaffold landing — every string comes from src/content/company.ts.
   Prompt 05 replaces this route with the home page. */
export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 sm:px-12">
      <div className="max-w-measure w-full space-y-6 text-center">
        <p className="section-index">
          {company.headquarters.city} · {company.headquarters.state}
        </p>
        <h1 className="font-display text-headline leading-headline tracking-display font-light">
          {company.name}
        </h1>
        <ul className="space-y-2">
          {company.services.map((service) => (
            <li key={service} className="text-ink-2 text-sm font-light">
              {service}
            </li>
          ))}
        </ul>
        <hr className="hairline" />
        <p className="label-caps">
          <Link href="/styleguide" className="underline underline-offset-4">
            Styleguide
          </Link>
        </p>
      </div>
    </div>
  );
}
