import type { Metadata } from "next";
import { LegalDocument } from "@/components/layout/LegalDocument";
import { terms } from "@/content/legal";

/* `/terms` — website terms only; carriage is governed by each consignment's
   LR and confirmed booking (see `content/legal.ts`). */

export const metadata: Metadata = {
  title: terms.metaTitle,
  description: terms.metaDescription,
  alternates: { canonical: "/terms/" },
};

export default function TermsPage() {
  return <LegalDocument doc={terms} />;
}
