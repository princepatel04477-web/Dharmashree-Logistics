import type { Metadata } from "next";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { admin } from "@/content/admin";

/* `/admin` — the client's panel: form submissions (list, search, Excel) and the
   home page's announcement. The page is a static shell; everything behind the
   password comes from /api/admin/* (functions/api/admin/), which checks the
   session on every call. Kept out of search engines. */

export const metadata: Metadata = {
  title: admin.metaTitle,
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <section className="py-14 sm:py-16 lg:py-20">
      <div className="wrap flex flex-col gap-8">
        <h1 className="font-display text-ink leading-headline tracking-display text-step-4">
          {admin.title}
        </h1>
        <AdminPanel />
      </div>
    </section>
  );
}
