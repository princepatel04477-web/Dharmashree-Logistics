import type { Metadata } from "next";
import type { ReactNode } from "react";
import { company } from "@/content/company";
import { MotionProviders } from "@/providers/MotionProviders";
import { fontBody, fontDisplayAccent, fontDisplayFace, fontMono } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: company.name,
  description: `${company.name} — freight and transport from ${company.headquarters.city}, ${company.headquarters.state}: ${company.services.join("; ")}.`,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en-IN"
      className={`${fontDisplayFace.variable} ${fontDisplayAccent.variable} ${fontBody.variable} ${fontMono.variable} h-full antialiased`}
    >
      <body className="bg-paper text-ink flex min-h-full flex-col font-sans">
        <MotionProviders>{children}</MotionProviders>
      </body>
    </html>
  );
}
