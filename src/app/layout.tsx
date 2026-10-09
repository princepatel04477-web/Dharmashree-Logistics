import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Footer } from "@/components/chrome/Footer";
import { Header } from "@/components/chrome/Header";
import { SkipLink } from "@/components/chrome/SkipLink";
import { WhatsAppButton } from "@/components/chrome/WhatsAppButton";
import { MapSelectionProvider } from "@/components/map/MapSelection";
import { Toaster } from "@/components/vendor/lightswind";
import { company } from "@/content/company";
import { MotionProviders } from "@/providers/MotionProviders";
import { fontBody, fontDisplayFace, fontMono } from "./fonts";
import "./globals.css";

/* Root shell (Prompt 04): fonts → motion + map providers → skip link → fixed
   header → main → footer, with the floating WhatsApp button and the toast
   viewport mounted once for the whole site. `template.tsx` layers the route
   transition over this. */

const description = `${company.name} — ${company.services.join(", ").toLowerCase()} from ${company.headquarters.city}, ${company.headquarters.state}.${company.tagline === null ? "" : ` ${company.tagline}`}`;

export const metadata: Metadata = {
  title: {
    default: company.name,
    template: `%s · ${company.name}`,
  },
  description,
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: company.name,
    description,
  },
  twitter: { card: "summary_large_image", title: company.name, description },
};

/* `viewportFit: cover` lets the page paint into the notch while the `.safe-*`
   utilities in globals.css keep the chrome clear of it. No `themeColor` here:
   a hex in a TSX file would break house rule 5, and `html` already paints its
   canvas with `--paper`, which is what Android Chrome falls back to. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en-IN"
      className={`${fontDisplayFace.variable} ${fontBody.variable} ${fontMono.variable} h-full antialiased`}
    >
      <body className="bg-paper text-ink flex min-h-full flex-col font-sans">
        <MotionProviders>
          <MapSelectionProvider>
            <SkipLink />
            <Header />
            {/* Clear of the fixed header: 64px mobile, 72px from `lg` up.
                tabIndex={-1} is the skip link's landing target. */}
            <main id="main" tabIndex={-1} className="flex flex-1 flex-col pt-16 lg:pt-18">
              {children}
            </main>
            <Footer />
            <WhatsAppButton variant="floating" />
            <Toaster />
          </MapSelectionProvider>
        </MotionProviders>
      </body>
    </html>
  );
}
