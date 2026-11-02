// =========================================================
// data/quiz.js: the "Which position suits you?" quiz.
// Just for fun: each answer gives a point to one position,
// and the position with the most points is the result.
// Edit the questions and answers here.
// =========================================================

export const QUIZ = [
  {
    question: "In a match, what makes you happiest?",
    answers: [
      { text: "Making a big save", position: "goalkeeper" },
      { text: "Winning the ball back", position: "defender" },
      { text: "Playing the perfect pass", position: "midfielder" },
      { text: "Beating a player with a skill", position: "winger" },
      { text: "Scoring a goal", position: "striker" },
    ],
  },
  {
    question: "What's your biggest strength?",
    answers: [
      { text: "Bravery and quick hands", position: "goalkeeper" },
      { text: "Spotting danger early", position: "defender" },
      { text: "Seeing the whole pitch", position: "midfielder" },
      { text: "Pace down the line", position: "winger" },
      { text: "A cool head in front of goal", position: "striker" },
    ],
  },
  {
    question: "Your teammates would say you…",
    answers: [
      { text: "Shout instructions to everyone", position: "goalkeeper" },
      { text: "Never lose a 50-50", position: "defender" },
      { text: "Run all game and link play", position: "midfielder" },
      { text: "Love taking players on", position: "winger" },
      { text: "Are always in the right place", position: "striker" },
    ],
  },
  {
    question: "Which drill would you pick?",
    answers: [
      { text: "Diving saves", position: "goalkeeper" },
      { text: "1v1 defending", position: "defender" },
      { text: "A rondo (keep-ball)", position: "midfielder" },
      { text: "Dribble and cross", position: "winger" },
      { text: "Finishing practice", position: "striker" },
    ],
  },
];

// What we say about each result
export const QUIZ_RESULTS = {
  goalkeeper: { emoji: "🧤", text: "Brave, loud and calm under pressure. You could be your team's last line of defence." },
  defender: { emoji: "🛡️", text: "You read the game and love a challenge. Teams are built on players like you." },
  midfielder: { emoji: "🧭", text: "You see the pass others don't and never stop running. You're the engine of the team." },
  winger: { emoji: "💨", text: "Pace, tricks and confidence. You love getting at defenders and creating chances." },
  striker: { emoji: "🎯", text: "Goals, goals, goals. You're in the right place at the right time." },
};
