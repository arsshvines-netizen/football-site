// =========================================================
// data/feedback.js: the questions on the tester Feedback form.
// Used by feedback.js (the form) and studio.js (the results).
// =========================================================

export const FEEDBACK_KEY = "pitchpath-feedback";
export const FEEDBACK_VERSION = 1;

export const RATING_QUESTIONS = [
  { key: "usefulness", text: "How useful is the content?" },
  { key: "understandable", text: "How easy is the content to understand?" },
  { key: "navigation", text: "How easy is it to find your way around?" },
  { key: "visual", text: "How good does the website look?" },
  { key: "professional", text: "How professional does it feel?" },
  { key: "useAgain", text: "How likely are you to use it again?" },
];

export const TASKS = [
  { key: "task1", text: "Find a winger programme" },
  { key: "task2", text: "Find nutrition guidance" },
  { key: "task3", text: "Open the progress tracker" },
  { key: "task4", text: "Find a defender drill" },
  { key: "task5", text: "Find the warm-up" },
];

export const FREE_TEXT = [
  { key: "liked", text: "What did you like?" },
  { key: "confusing", text: "What was confusing?" },
  { key: "change", text: "What would you change?" },
];

// Optional market-research questions (select boxes on the form)
export const MARKET_KEYS = ["wouldPay", "fairPrice", "bestFeature", "channel"];
