// =========================================================
// data/plans.js: the business model (pricing plans, the
// monthly challenge and FAQs). Change prices here and the
// Plans and Home pages update automatically.
//
// Business model: "freemium". The core training is FREE, so
// every young player can use it. Paid plans add personal
// extras. Plus is now unlocked (10 Plus drills + the Planner),
// but payments are not set up yet (see PLUS_BUY_LINK).
// Team is still "Launching soon" (market research).
// =========================================================

export const CURRENCY = "₹"; // change to "$", "£", "AED" etc. if needed

// PLUS PAYMENT LINK: paste the payment page link here when it is
// ready (for example a Razorpay or Stripe payment link). While it
// is empty, every "Get Plus" button goes to the Plans page instead.
export const PLUS_BUY_LINK = "";

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
      "All 25 position drills with diagrams",
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
    tagline: "More drills and your own weekly planner, for players who want more.",
    status: "available",
    highlight: true,
    features: [
      "Everything in Starter",
      "10 extra Plus drills (2 for every position)",
      "Weekly Planner: build your whole training week",
      "Plus member badge and gold look",
    ],
    // The button text. Where it goes is PLUS_BUY_LINK below.
    cta: { label: "Get Plus", href: "plans.html#plans-title" },
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
    q: "What do I get with Plus?",
    a: "Plus adds 10 extra drills (2 for every position), the Weekly Planner where you build your whole training week, and a Plus member badge. Everything in Starter stays free. Payments open soon: always ask a parent before buying anything online.",
  },
  {
    q: "Why is Team 'launching soon'?",
    a: "We're asking coaches what they want from a team plan first. Tell us what you'd like on the Feedback page.",
  },
  {
    q: "Who makes the content?",
    a: "PITCHPATH was founded by Arssh Gupta, who plays for Mumbai City FC and has represented Mumbai and ISSO at the SGFI National Games. Drills and programmes are checked with a qualified football coach.",
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
