// =========================================================
// data/plans.js: the business model (pricing plans, the
// monthly challenge and FAQs). Change prices here and the
// Plans and Home pages update automatically.
//
// Business model: "freemium". The core training is FREE, so
// every young player can use it. Paid plans add personal
// extras. Paid plans are NOT live yet: they are shown as
// "Launching soon" so we can test demand first (market research).
// =========================================================

export const CURRENCY = "₹"; // change to "$", "£", "AED" etc. if needed

export const PLANS = [
  {
    id: "free",
    name: "Starter",
    price: 0,
    period: "forever",
    tagline: "Everything you need to start training with a plan.",
    status: "available", // available | soon
    highlight: false,
    features: [
      "All 9 training programmes (3 levels)",
      "All 40 position drills with diagrams",
      "Fitness and nutrition guides",
      "Progress tracker with charts",
      "Monthly challenge and badges",
    ],
    cta: { label: "Start free now", href: "programmes.html" },
  },
  {
    id: "plus",
    name: "Plus",
    price: 199,
    period: "per month",
    yearly: "or ₹1,499 per year (save 37%)",
    tagline: "For players who want personal feedback to improve faster.",
    status: "soon",
    highlight: true,
    features: [
      "Everything in Starter",
      "A personal 4-week plan built for your position and level",
      "Video feedback on 2 clips of your technique each month",
      "Printable training cards for every session",
      "Early access to new drills",
    ],
    cta: { label: "Launching soon", href: "feedback.html" },
  },
  {
    id: "team",
    name: "Team",
    price: 2999,
    period: "per season",
    yearly: "for up to 25 players",
    tagline: "For school and club coaches running U12-U15 squads.",
    status: "soon",
    highlight: false,
    features: [
      "Everything in Plus for the whole squad",
      "Coach dashboard to see team progress",
      "Ready-made session plans for 2-3 practices a week",
      "Position groups: send drills to keepers, defenders and more",
      "Squad challenges and end-of-season certificates",
    ],
    cta: { label: "Launching soon", href: "feedback.html" },
  },
];

// Customer engagement: a new challenge every month.
export const CHALLENGE = {
  title: "Weak Foot Month",
  goal: "Do 100 passes against a wall with your weaker foot, on 12 different days this month.",
  how: "Log each day as a 'Technical' session in the tracker with the note 'Weak foot'.",
  reward: "Earn the Two-Footed badge and a shout-out on our Instagram (with a parent's permission).",
  drill: "def-02",
};

export const FAQS = [
  {
    q: "Is PITCHPATH really free?",
    a: "Yes. The Starter plan is free forever, with no sign-up and no adverts. We believe every young player should have a structured plan, whatever their family can afford.",
  },
  {
    q: "Why are Plus and Team 'launching soon'?",
    a: "We are testing the free product first and asking players, parents and coaches what they would pay for. This is called market research. Tell us what you think on the Feedback page.",
  },
  {
    q: "Who makes the content?",
    a: "PITCHPATH was started by a young club footballer who has followed many training programmes himself. Drills and programmes are checked with a qualified football coach.",
  },
  {
    q: "Do I need to create an account?",
    a: "No. Your tracker data is saved only on your own device. We don't collect names, emails or any personal data.",
  },
  {
    q: "Can my coach use PITCHPATH with my team?",
    a: "Yes, coaches can use all the free sessions today. The Team plan will add a coach dashboard and squad tools.",
  },
];
