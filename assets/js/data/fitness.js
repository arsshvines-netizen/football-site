// =========================================================
// data/fitness.js: lists used on the Fitness page.
// Bodyweight only. No weights, no maximal lifting.
// Sets and reps are deliberately conservative.
// FLAG FOR COACH CHECK: please ask your coach to check the
// sets/reps below before publishing (see docs/content-checklist.md).
// =========================================================

// Warm-up steps used by the "Start warm-up" timer.
export const WARM_UP = [
  { name: "Easy jog", seconds: 120, how: "Jog slowly around your space. Relax your shoulders and breathe." },
  { name: "Leg swings (forward and back)", seconds: 45, how: "Hold a wall or partner. Swing one leg forwards and back, then switch." },
  { name: "Leg swings (side to side)", seconds: 45, how: "Face the wall. Swing one leg across your body and out, then switch." },
  { name: "High knees", seconds: 30, how: "Jog on the spot or forwards, bringing knees up to hip height." },
  { name: "Heel flicks", seconds: 30, how: "Jog and flick your heels up towards your bottom." },
  { name: "Walking lunges", seconds: 45, how: "Big step forward, lower the back knee gently, stand up and step through." },
  { name: "Side shuffles", seconds: 45, how: "Stay low and shuffle sideways for 10m, then back. Don't cross your feet." },
  { name: "Open and close the gate", seconds: 45, how: "Walk forward lifting your knee and circling it out (open), then in (close)." },
  { name: "Arm circles", seconds: 30, how: "Big slow circles forwards, then backwards." },
  { name: "Quick feet", seconds: 30, how: "Fast, small steps on the spot. Stay on the balls of your feet." },
  { name: "Toe taps on the ball", seconds: 45, how: "Tap the top of the ball with alternate feet. Speed up as you go." },
  { name: "Build-up runs", seconds: 90, how: "3 runs of 20m: start at half speed and build up to about 80%. Walk back." },
];

export const STRENGTH = [
  {
    name: "Squat",
    how: "Feet shoulder-width apart, chest up, sit back like there is a chair, knees follow your toes.",
    beginner: "Bodyweight squat: 2 sets of 10",
    intermediate: "Split squat: 3 sets of 8 each leg",
    advanced: "Jump squat: 3 sets of 6, land softly",
  },
  {
    name: "Lunge",
    how: "Step, lower your back knee gently towards the floor, keep your front knee over your ankle.",
    beginner: "Reverse lunge: 2 sets of 6 each leg",
    intermediate: "Walking lunge: 3 sets of 8 each leg",
    advanced: "Side (lateral) lunge: 3 sets of 8 each side",
  },
  {
    name: "Glute bridge",
    how: "Lie on your back, knees bent. Squeeze your bottom and lift your hips until your body is straight.",
    beginner: "Two-leg bridge: 2 sets of 10",
    intermediate: "Single-leg bridge: 2 sets of 8 each leg",
    advanced: "Single-leg bridge with 2-second hold: 3 sets of 8 each leg",
  },
  {
    name: "Plank",
    how: "Forearms on the floor, body in a straight line from head to heels. Breathe normally.",
    beginner: "Front plank: 3 x 20 seconds",
    intermediate: "Front plank: 3 x 30 seconds",
    advanced: "Plank with shoulder taps: 3 x 30 seconds",
  },
  {
    name: "Side plank",
    how: "On one forearm, hips up, body in a straight line. Then switch sides.",
    beginner: "Side plank on knees: 2 x 15 seconds each side",
    intermediate: "Full side plank: 3 x 20 seconds each side",
    advanced: "Side plank with slow hip lifts: 3 x 25 seconds each side",
  },
  {
    name: "Push-up",
    how: "Hands under shoulders, body straight, lower your chest, then push back up.",
    beginner: "Incline push-up (hands on a bench or wall): 2 sets of 8",
    intermediate: "Push-up (on knees or full): 3 sets of 6-8",
    advanced: "Full push-up: 3 sets of 10",
  },
  {
    name: "Calf raise",
    how: "Stand tall, rise up onto your toes, then lower slowly. Hold a wall for balance.",
    beginner: "Both legs: 2 sets of 12",
    intermediate: "Single leg: 2 sets of 10 each leg",
    advanced: "Single leg, slow lowering (3 seconds): 3 sets of 12 each leg",
  },
];

export const SPEED = [
  { name: "Ladder or line quick feet", how: "Use a ladder or chalk lines. One foot in each square, then two feet. 4-6 runs.", rest: "Walk back slowly." },
  { name: "5-10-5 cone shuttle", how: "Cones 5m apart in a line. Start in the middle, sprint 5m right, 10m left, 5m back to the middle. 4 runs.", rest: "60-90 seconds between runs." },
  { name: "Reaction starts", how: "Partner shouts 'go' or claps. Sprint 10m. Try different start positions: lying, sitting, facing backwards. 6 runs.", rest: "Walk back + 30 seconds." },
  { name: "Short sprints", how: "Sprint 10-20m at full speed. 4-6 sprints for beginners, up to 8 for advanced.", rest: "Full recovery: walk back and rest until you feel fresh (about 60-90 seconds)." },
];

export const ENDURANCE = [
  { level: "Beginner", plan: "Run 30 seconds at a steady pace, walk 60 seconds. Repeat 6-8 times. Or play 3-minute small-sided games with 2 minutes rest." },
  { level: "Intermediate", plan: "Run 1 minute at a strong pace, jog or walk 1 minute. Repeat 6-8 times. Or play 4-minute games with 2 minutes rest." },
  { level: "Advanced", plan: "Run 2 minutes at a strong pace, 1 minute easy. Repeat 5-6 times. Or play 5-minute games with 2 minutes rest." },
];

export const MOBILITY = [
  { name: "Calf stretch", how: "Hands on a wall, one leg back, heel down. Hold 20-30 seconds each leg." },
  { name: "Thigh (quad) stretch", how: "Stand on one leg, hold your other ankle behind you. Knees together. Hold 20-30 seconds." },
  { name: "Hamstring stretch", how: "One heel forward on the floor, toes up, lean forward from the hips. Hold 20-30 seconds." },
  { name: "Hip flexor stretch", how: "Kneel on one knee, push hips gently forward. Hold 20-30 seconds each side." },
  { name: "Groin (butterfly) stretch", how: "Sit with the soles of your feet together, gently press knees down. Hold 20-30 seconds." },
  { name: "Child's pose", how: "Kneel, sit back on your heels and reach your arms forward along the floor. Hold 30 seconds." },
  { name: "Calm breathing", how: "Breathe in through your nose for 4 seconds, out through your mouth for 6 seconds. 5 times." },
];

// Example week for each level. "Programme" = one of the sessions on the Programmes page.
export const WEEKLY_SCHEDULES = {
  Beginner: {
    note: "For players who don't train with a club yet.",
    days: [
      ["Monday", "Programme session A (45-55 min)"],
      ["Tuesday", "Rest or free play with friends"],
      ["Wednesday", "Programme session B"],
      ["Thursday", "Rest"],
      ["Friday", "Programme session C"],
      ["Saturday", "Match or fun game with friends"],
      ["Sunday", "Full rest"],
    ],
  },
  Intermediate: {
    note: "For players with club training twice a week. Only 2 programme sessions, because club training counts too.",
    days: [
      ["Monday", "Programme session A (technical or strength)"],
      ["Tuesday", "Club training"],
      ["Wednesday", "Rest or 15 min mobility"],
      ["Thursday", "Club training"],
      ["Friday", "Programme session B (light: technical only)"],
      ["Saturday", "Match"],
      ["Sunday", "Full rest"],
    ],
  },
  Advanced: {
    note: "For players with club training twice a week plus a match. Never train hard the day before a match.",
    days: [
      ["Monday", "Programme session A"],
      ["Tuesday", "Club training"],
      ["Wednesday", "Programme session B"],
      ["Thursday", "Club training"],
      ["Friday", "Rest, or 15 min mobility and light ball work"],
      ["Saturday", "Match"],
      ["Sunday", "Full rest"],
    ],
  },
};
