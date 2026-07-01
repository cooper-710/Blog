export const SERVICE_TOPICS_LINE =
  "Baseball · Biomechanics · Mocap · Analytics · Pitching · Hitting · Training";

export const SERVICE_FOCUS_TAGS = [
  "Pitching",
  "Hitting",
  "Throwing",
  "Biomechanics",
  "Mocap",
  "Training",
  "Team consulting"
] as const;

export const SITE_NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Articles", href: "/articles" },
  { label: "About", href: "/about" },
  { label: "Connect", href: "/work-with-tj" }
] as const;

export const SITE_CONTACT_EMAIL = "contact@sequencebiolab.com";

export const SITE_CONTACT_LINKS = [
  {
    label: "Email",
    value: SITE_CONTACT_EMAIL,
    href: `mailto:${SITE_CONTACT_EMAIL}`
  },
  {
    label: "LinkedIn",
    value: "TJ Galenti",
    href: "https://www.linkedin.com/in/t-j-galenti/"
  },
  {
    label: "Instagram",
    value: "@sequencebiolab",
    href: "https://www.instagram.com/sequencebiolab/"
  }
] as const;
