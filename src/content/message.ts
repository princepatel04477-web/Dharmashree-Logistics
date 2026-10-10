import { MESSAGE_MAX_LENGTH } from "@/lib/message";

/* The "Send us a message" box (contact page and footer). One form, two sizes:
   the contact page shows every field, the footer's compact box leaves out the
   email. The same sentences serve both. The channel links offered when the box
   cannot send (not connected, or a failed attempt) come from `contactLinks()` in
   the component, so a `null` phone or email is simply not offered (house rule 4). */

export const message = {
  title: "Send us a message",
  /** The accessible name of the form itself. */
  formLabel: "Send us a message",

  nameLabel: "Your name",
  phoneLabel: "Mobile number",
  phoneHelper: "Indian mobile — the desk replies on this number.",
  emailLabel: "Email",
  emailHelper: "Optional — only if you would rather get the reply by email.",
  messageLabel: "Your message",
  messageHelper: "What you need, and where.",
  maxLength: MESSAGE_MAX_LENGTH,
  consentLabel: "I agree to be contacted about this message.",
  honeypotLabel: "Leave this field empty",

  submitLabel: "Send message",
  sendingLabel: "Sending",

  errors: {
    Required: "This one is needed before the desk can reply.",
    Phone: "An Indian mobile number: 10 digits, or +91 and 10 digits.",
    Email: "That address doesn't look complete.",
    Consent: "We need your agreement before the message can be sent.",
  },

  success: {
    title: "Message received.",
    referenceLabel: "Reference",
    notice: "Thank you. The desk will reply on the number you left.",
    againLabel: "Send another message",
  },

  failure: {
    lead: "That didn't go through. Your message is still here, so you can try again.",
    channelsLead: "Or reach the desk directly:",
    /** One line per code, appended to `lead`. */
    reasons: {
      Unconfigured: "The message box is not connected to the desk yet.",
      Network: "The message could not leave this device.",
      Timeout: "The desk did not answer in time.",
      Rejected: "The desk refused the message.",
      Server: "The desk answered with something unexpected.",
    },
  },

  /** Shown in place of the form when this build has no desk endpoint. */
  unconfigured: {
    title: "The message box is not connected yet",
    body: "Messages cannot be sent from this page right now.",
    channelsLead: "Reach the desk directly:",
    noChannels: "The desk’s phone and email will be listed here as soon as they are published.",
  },

  /** The compact box in the footer's top band. */
  footer: {
    note: "Leave your number and a line about what you need. The desk replies.",
  },
} as const;
