// =========================================================
// config.js: THE ONE PLACE to change the brand name, tagline
// and menu links. Every page reads from here.
// (Colours and fonts live in assets/css/variables.css.)
// =========================================================

export const BRAND = {
  name: "PITCHPATH",              // change this to rename the whole site
  founder: "Arssh Gupta",         // shown on the Home and About pages
  tagline: "Train with a plan.",
  audience: "young footballers aged 12-15",
  logo: "assets/img/logo-icon.svg",         // icon shown in the header and footer
  logoFull: "assets/img/logo.svg",          // full logo for light backgrounds
  logoFullDark: "assets/img/logo-dark.svg", // full logo for dark backgrounds
};

// Main menu, shown on every page in this order.
export const NAV_LINKS = [
  { label: "Home", href: "index.html" },
  { label: "Programmes", href: "programmes.html" },
  { label: "Drills", href: "drills.html" },
  { label: "Fitness", href: "fitness.html" },
  { label: "Nutrition", href: "nutrition.html" },
  { label: "Tracker", href: "tracker.html" },
  { label: "Plans", href: "plans.html" },
  { label: "About", href: "about.html" },
];

// The footer shows these links in small groups
// (Feedback and Sources only appear here, not in the top menu).
export const FOOTER_GROUPS = [
  {
    title: "Train",
    links: [
      { label: "Programmes", href: "programmes.html" },
      { label: "Drills", href: "drills.html" },
      { label: "Fitness", href: "fitness.html" },
      { label: "Nutrition", href: "nutrition.html" },
    ],
  },
  {
    title: "Progress",
    links: [
      { label: "Tracker", href: "tracker.html" },
      { label: "Monthly challenge", href: "index.html#challenge" },
      { label: "Plans", href: "plans.html" },
    ],
  },
  {
    title: "PITCHPATH",
    links: [
      { label: "Home", href: "index.html" },
      { label: "About", href: "about.html" },
      { label: "Feedback", href: "feedback.html" },
      { label: "Sources", href: "sources.html" },
    ],
  },
];

// The disclaimer text (spec Section 10). Shown in every footer.
export const DISCLAIMER =
  "This website gives general training information for young players. " +
  "It is not medical advice. Always warm up, stop if something hurts, and " +
  "talk to a coach, parent or doctor if you are unsure or injured.";
