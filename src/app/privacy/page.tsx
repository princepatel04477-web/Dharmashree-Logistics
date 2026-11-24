import type { Metadata } from "next";
import { LegalDocument } from "@/components/layout/LegalDocument";
import { privacy } from "@/content/legal";

/* `/privacy` — linked from the footer's Help column. The text lives in
   `content/legal.ts`, written from what the build actually does. */

export const metadata: Metadata = {
  title: privacy.metaTitle,
  description: privacy.metaDescription,
  alternates: { canonical: "/privacy/" },
};

export default function PrivacyPage() {
  return <LegalDocument doc={privacy} />;
}
