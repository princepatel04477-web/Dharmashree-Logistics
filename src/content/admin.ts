import type { DeskKind } from "@/lib/desk/forms";

/* The admin panel (/admin): every sentence it shows. */

export const admin = {
  metaTitle: "Admin",
  title: "Admin panel",

  login: {
    lede: "Sign in to see form submissions, download them as Excel, and edit the announcement on the home page.",
    passwordLabel: "Password",
    submit: "Sign in",
    submitting: "Signing in…",
    errors: {
      Required: "Enter the password.",
      WrongPassword: "That password is not right.",
      Locked: "Too many wrong passwords. Wait 15 minutes and try again.",
      Unconfigured:
        "The admin panel is not set up on this site yet: its password has not been added.",
      Network: "Could not reach the site. Check the connection and try again.",
    },
  },

  checking: "Checking your session…",
  signOut: "Sign out",

  tabsLabel: "Admin sections",
  tabs: {
    truck: "Truck attachments",
    message: "Messages",
    quote: "Quote requests",
    partner: "Delivery partners",
    announcement: "Announcement",
  } satisfies Record<DeskKind | "announcement", string>,

  list: {
    receivedAt: "Received at",
    reference: "Reference",
    count: (shown: number, total: number): string =>
      shown === total ? `${String(total)} in total` : `${String(shown)} of ${String(total)} shown`,
    filterLabel: "Search",
    filterPlaceholder: "Name, phone, city, reference…",
    download: "Download Excel",
    refresh: "Refresh",
    loading: "Loading…",
    empty: "Nothing has been received yet.",
    noMatch: "Nothing matches that search.",
    failed: "Could not load the list. Try Refresh.",
    /** Shown when the list holds the most the panel loads at once. */
    capped: "The newest 1,000 are shown here; the Excel download has every one.",
  },

  announcement: {
    lede: "A short notice shown at the top of the track card on the home page — holidays, closures, new routes. It appears within about a minute of saving.",
    textLabel: "Announcement text",
    textHelper: (left: number): string => `${String(left)} characters left.`,
    activeLabel: "Show it on the website",
    previewLabel: "Preview",
    previewEmpty: "Nothing is shown while the text is empty or the switch is off.",
    save: "Save",
    saving: "Saving…",
    saved: "Saved. The home page shows the change within a minute.",
    failed: "Could not save. Try again.",
    tooLong: "Keep it to 200 characters.",
    loadFailed: "Could not load the current announcement.",
  },
} as const;
