"use client";

import { usePathname } from "next/navigation";
import { MessageForm } from "@/components/contact/MessageForm";
import { message } from "@/content/message";

/* The footer's compact "Send us a message" box. /contact already carries the
   full form as its own section, so there the footer stands down rather than
   showing the same form twice on one page. */

const CONTACT_PATH = "/contact";

export function FooterMessage() {
  const pathname = usePathname();
  if (pathname === CONTACT_PATH || pathname.startsWith(`${CONTACT_PATH}/`)) return null;

  return (
    <div className="flex flex-col gap-5 lg:col-span-7">
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-on-deep leading-headline tracking-display text-2xl">
          {message.title}
        </h2>
        <p className="text-on-deep-text max-w-measure text-sm font-light">{message.footer.note}</p>
      </div>
      <MessageForm variant="footer" />
    </div>
  );
}
