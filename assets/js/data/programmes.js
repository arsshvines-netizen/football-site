// =========================================================
// data/programmes.js: the 9 training programmes.
// 3 levels x 3 focuses (Technical, Game Understanding,
// Physical). Each programme = 4 weeks x 3 sessions.
//
// To keep this file short, each programme has 3 SESSION
// TEMPLATES (A, B, C). The page repeats them every week and
// applies that week's change (see `weeks`). Session length:
//   warm-up + activity minutes + cool-down + week bonus.
// `drill` links to a drill on the Drills page.
// `link` links to another page section instead.
// =========================================================

export const WARM_UP_MIN = 10;
export const COOL_DOWN_MIN = 5;

// Extra minutes added to the FIRST main activity each week.
// Gradual increase, so the load builds slowly (spec Section 9).
export const WEEK_BONUS_MIN = [0, 5, 5, 10];

export const WARM_UP_TEXT =
  "Dynamic warm-up (10 min): see the Fitness page. Easy jog, leg swings, high knees, heel flicks, walking lunges, side shuffles, then 3 short build-up runs.";
export const COOL_DOWN_TEXT =
  "Cool-down (5 min): easy walk or jog, then gentle stretches for calves, thighs, hips and back. Drink water.";

export const LEVELS = {
  beginner: {
    label: "Beginner",
    who: "You are new to football training, or you have played for fun but never followed a plan.",
    startHere: [
      "You can jog for 10 minutes without stopping.",
      "You know the basic rules of football.",
      "You have a ball and some space (garden, park or pitch).",
    ],
    levelUp: [
      "I can pass 20 times in a row with a partner over 10m with both feet.",
      "I can dribble through 8 cones without losing the ball, using both feet.",
      "I can receive the ball and turn in one smooth movement.",
      "I can hit the target 6 out of 10 times in placement finishing.",
      "I finished at least 10 of the 12 sessions in one of the Beginner programmes.",
      "I can do the full warm-up and cool-down without help.",
    ],
    programmes: [
      {
        id: "beg-tech",
        focus: "Technical Skills",
        title: "Master the Ball",
        summary: "Build a strong first touch, clean passing and close dribbling with both feet.",
        weeks: [
          "Week 1: Learn the movements slowly. Quality over speed.",
          "Week 2: Same drills, more touches. Try to beat last week's counts.",
          "Week 3: Less space: make the cone areas smaller.",
          "Week 4: Add a challenge: use your weaker foot for half of every drill.",
        ],
        sessions: [
          {
            aim: "Close control and dribbling with both feet.",
            activities: [
              { name: "Inside and Outside Foot Slalom", minutes: 10, drill: "wing-02" },
              { name: "Gate Dribbling", minutes: 10, drill: "mid-03" },
              { name: "Free play: 1v1 or juggling challenge", minutes: 10, how: "Count how many keepy-ups you can do. Record your best score." },
            ],
          },
          {
            aim: "Passing and receiving on the move.",
            activities: [
              { name: "Pass and Move Out from the Back", minutes: 12, drill: "def-02" },
              { name: "Triangle Passing", minutes: 12, drill: "mid-01" },
              { name: "Wall passing", minutes: 6, how: "Pass against a wall from 5m. 50 passes with each foot." },
            ],
          },
          {
            aim: "First touch and finishing.",
            activities: [
              { name: "First Touch Away from the Cone", minutes: 10, drill: "str-03" },
              { name: "Placement Finishing", minutes: 12, drill: "str-01" },
              { name: "Small game (if you have friends)", minutes: 8, how: "2v2 or 3v3 with small goals. Otherwise, repeat your favourite drill." },
            ],
          },
        ],
      },
      {
        id: "beg-game",
        focus: "Game Understanding",
        title: "Read the Game",
        summary: "Learn where to stand, when to move and how to help your teammates.",
        weeks: [
          "Week 1: Learn the ideas: 'width', 'support' and 'goal-side'. Walk through them.",
          "Week 2: Play the activities at jogging pace. Talk to your partners.",
          "Week 3: Full speed, but the defenders are passive (no tackling).",
          "Week 4: Real defenders. Try to use what you learned in a small game.",
        ],
        sessions: [
          {
            aim: "Body shape and seeing the pitch.",
            activities: [
              { name: "Open Body Receiving", minutes: 12, drill: "mid-02" },
              { name: "Scanning game", minutes: 8, how: "A partner holds up fingers behind you. Call the number before you receive the ball." },
              { name: "Small-sided game", minutes: 10, how: "3v3. Every player must check their shoulder before receiving." },
            ],
          },
          {
            aim: "Defending basics: stay goal-side and be patient.",
            activities: [
              { name: "Jockey Mirror", minutes: 10, drill: "def-01" },
              { name: "Shadow Defending Channel", minutes: 12, drill: "def-03" },
              { name: "1v1 game", minutes: 8, how: "Small goals. Score by dribbling through. Defenders: stay on your feet." },
            ],
          },
          {
            aim: "Attacking as a team: width and support.",
            activities: [
              { name: "Cone Dribble to Cross", minutes: 12, drill: "wing-01" },
              { name: "Lay-Off and Shoot", minutes: 10, drill: "str-02" },
              { name: "Small-sided game", minutes: 8, how: "4v4 with a rule: a goal only counts if the team used both sides of the pitch." },
            ],
          },
        ],
      },
      {
        id: "beg-phys",
        focus: "Physical Development",
        title: "Build Your Engine",
        summary: "Bodyweight strength, quick feet and the stamina to keep going for a whole match.",
        weeks: [
          "Week 1: Learn the exercises with perfect form. Beginner versions only.",
          "Week 2: Add 1 more set or 2 more reps to strength exercises.",
          "Week 3: Add one more sprint or interval. Keep full rest.",
          "Week 4: Try intermediate versions of 2 exercises if form is still perfect.",
        ],
        sessions: [
          {
            aim: "Quick feet and short sprints.",
            activities: [
              { name: "Speed and agility circuit", minutes: 12, link: "fitness.html#speed", how: "Ladder or cone footwork, then 4 x 10m sprints with full walk-back recovery." },
              { name: "Inside and Outside Foot Slalom", minutes: 8, drill: "wing-02" },
              { name: "Tag games", minutes: 10, how: "Fun chasing games in a 15m square. Lots of changes of direction." },
            ],
          },
          {
            aim: "Bodyweight strength and balance.",
            activities: [
              { name: "Strength circuit (beginner)", minutes: 15, link: "fitness.html#strength", how: "Squats, glute bridges, plank, calf raises, incline push-ups." },
              { name: "Balance challenges", minutes: 5, how: "Stand on one leg for 30 seconds each side, then try it with eyes closed." },
              { name: "Passing with movement", minutes: 10, drill: "def-02" },
            ],
          },
          {
            aim: "Stamina with the ball.",
            activities: [
              { name: "Ball intervals", minutes: 15, link: "fitness.html#endurance", how: "Dribble for 30 seconds, walk for 60 seconds. Repeat 8 times." },
              { name: "Small-sided game", minutes: 15, how: "2v2 or 3v3. Short games of 3 minutes with 2 minutes rest." },
            ],
          },
        ],
      },
    ],
  },

  intermediate: {
    label: "Intermediate",
    who: "You have done the Beginner checklist, or you train with a club once or twice a week.",
    startHere: [
      "You have ticked most of the Beginner 'Ready to level up?' checklist.",
      "You can pass and dribble well with your stronger foot and OK with your weaker foot.",
      "You understand basic positions and simple tactics.",
    ],
    levelUp: [
      "I can play one- and two-touch passing in a rondo without losing the ball often.",
      "I check my shoulder before I receive, without being reminded.",
      "I can beat a defender in a 1v1 at least 4 out of 10 times.",
      "I can do intermediate versions of all strength exercises with good form.",
      "I finished at least 10 of the 12 sessions in one of the Intermediate programmes.",
      "I know what my position needs to do when we have the ball and when we don't.",
    ],
    programmes: [
      {
        id: "int-tech",
        focus: "Technical Skills",
        title: "Skills Under Pressure",
        summary: "Use your skills faster and with defenders around you.",
        weeks: [
          "Week 1: Technique first: learn each drill without pressure.",
          "Week 2: Speed up: two-touch maximum where possible.",
          "Week 3: Add a passive defender to each drill.",
          "Week 4: Add an active defender and keep score.",
        ],
        sessions: [
          {
            aim: "Receiving and turning.",
            activities: [
              { name: "Scan and Turn", minutes: 15, drill: "mid-04" },
              { name: "Turn and Finish", minutes: 15, drill: "str-04" },
              { name: "Small-sided game", minutes: 10, how: "4v4. Bonus point for a goal after a turn." },
            ],
          },
          {
            aim: "Beating a player.",
            activities: [
              { name: "1v1: Beat the Full-Back", minutes: 15, drill: "wing-04" },
              { name: "Cut Inside and Shoot", minutes: 12, drill: "wing-05" },
              { name: "1v1 tournament", minutes: 13, how: "Short 1v1 games to small goals. Rotate opponents." },
            ],
          },
          {
            aim: "Passing at speed.",
            activities: [
              { name: "4v1 Rondo", minutes: 15, drill: "mid-05" },
              { name: "Long Pass Switch", minutes: 12, drill: "def-06" },
              { name: "One-Touch Finishing", minutes: 13, drill: "str-06" },
            ],
          },
        ],
      },
      {
        id: "int-game",
        focus: "Game Understanding",
        title: "Think Like a Team",
        summary: "Team shape, combinations and making the right decision.",
        weeks: [
          "Week 1: Walk-through: learn where everyone should be.",
          "Week 2: Jogging pace with talking. Every player calls instructions.",
          "Week 3: Full speed with passive opponents.",
          "Week 4: Full speed with real opponents. Coach or partner gives feedback.",
        ],
        sessions: [
          {
            aim: "Defending as a unit.",
            activities: [
              { name: "Back Four Shuffle", minutes: 15, drill: "def-05" },
              { name: "1v1 Channel to End Line", minutes: 12, drill: "def-04" },
              { name: "Small-sided game", minutes: 13, how: "5v5. Defending team must shout 'press', 'cover' or 'shift' every time." },
            ],
          },
          {
            aim: "Attacking combinations.",
            activities: [
              { name: "Overlap Combination", minutes: 15, drill: "wing-06" },
              { name: "Pass, Spin and Support", minutes: 12, drill: "mid-06" },
              { name: "Small-sided game", minutes: 13, how: "4v4 with 2 wide 'bounce' players who can't be tackled." },
            ],
          },
          {
            aim: "Making good decisions in the box.",
            activities: [
              { name: "Near-Post Runs", minutes: 15, drill: "str-05" },
              { name: "Back-Pass and Play Out", minutes: 12, drill: "gk-06" },
              { name: "Small-sided game", minutes: 13, how: "Play 4v4 + keepers. Pause sometimes and ask: 'What were your options?'" },
            ],
          },
        ],
      },
      {
        id: "int-phys",
        focus: "Physical Development",
        title: "Faster and Stronger",
        summary: "More agility, stronger core and legs, and match-like stamina.",
        weeks: [
          "Week 1: Repeat Beginner exercises with perfect form, then try intermediate versions.",
          "Week 2: Intermediate versions for all exercises. Same sets.",
          "Week 3: Add 1 set to strength work or 1 extra interval.",
          "Week 4: Keep week 3 volume, but focus on speed and quality.",
        ],
        sessions: [
          {
            aim: "Agility and acceleration.",
            activities: [
              { name: "Speed and agility circuit", minutes: 15, link: "fitness.html#speed", how: "Cone shuttles and 5-10-5 drills with full recovery." },
              { name: "Side-Step and Set (all players)", minutes: 10, drill: "gk-04" },
              { name: "Speed Dribble Race", minutes: 15, drill: "wing-07" },
            ],
          },
          {
            aim: "Strength and stability.",
            activities: [
              { name: "Strength circuit (intermediate)", minutes: 20, link: "fitness.html#strength", how: "Split squats, single-leg bridges, push-ups, side planks, single-leg calf raises." },
              { name: "Passing pairs with movement", minutes: 10, drill: "def-02" },
              { name: "Mobility", minutes: 10, link: "fitness.html#mobility", how: "Hip, ankle and back mobility exercises." },
            ],
          },
          {
            aim: "Match-like endurance.",
            activities: [
              { name: "Interval runs", minutes: 15, link: "fitness.html#endurance", how: "Run 1 minute at a strong pace, walk/jog 1 minute. 6-8 times." },
              { name: "Small-sided game", minutes: 25, how: "4v4 in 4-minute games with 2 minutes rest." },
            ],
          },
        ],
      },
    ],
  },

  advanced: {
    label: "Advanced",
    who: "You train regularly with a club and want to sharpen your game for your position.",
    startHere: [
      "You have ticked most of the Intermediate 'Ready to level up?' checklist.",
      "You train with a team at least twice a week.",
      "You know your main position and its jobs.",
    ],
    levelUp: [
      "I can play quickly in tight spaces (5v2 rondo) and help my team keep the ball.",
      "I make the right decision most of the time: pass, dribble or shoot.",
      "I can recover and defend even when I'm caught out of position.",
      "I can complete the advanced strength exercises with good form.",
      "I finished at least 10 of the 12 sessions in one Advanced programme.",
      "Next step: keep training with your club and ask your coach for a personal target!",
    ],
    programmes: [
      {
        id: "adv-tech",
        focus: "Technical Skills",
        title: "Elite Touch",
        summary: "Quick, clean technique in game-speed situations.",
        weeks: [
          "Week 1: Learn the advanced drills at 70% speed.",
          "Week 2: Full speed. Limit touches (one or two).",
          "Week 3: Use the 'harder' version of each drill.",
          "Week 4: Test yourself: record your scores and compare with week 1.",
        ],
        sessions: [
          {
            aim: "One-touch play under pressure.",
            activities: [
              { name: "5v2 Rondo Under Pressure", minutes: 20, drill: "mid-08" },
              { name: "One-Touch Finishing", minutes: 15, drill: "str-06" },
              { name: "Small-sided game", minutes: 15, how: "5v5, two-touch maximum." },
            ],
          },
          {
            aim: "Beating defenders at speed.",
            activities: [
              { name: "Beat the Defender and Finish", minutes: 20, drill: "str-07" },
              { name: "Speed Dribble Race", minutes: 12, drill: "wing-07" },
              { name: "1v1 tournament", minutes: 18, how: "Rotate partners. Keep score across the week." },
            ],
          },
          {
            aim: "Final ball and finishing.",
            activities: [
              { name: "Wide 2v1 Final Ball", minutes: 20, drill: "wing-08" },
              { name: "Placement Finishing (harder version)", minutes: 12, drill: "str-01" },
              { name: "Small-sided game", minutes: 18, how: "Goals from a cross or cut-back count double." },
            ],
          },
        ],
      },
      {
        id: "adv-game",
        focus: "Game Understanding",
        title: "Game Intelligence",
        summary: "Timing, movement and smart decisions for your position.",
        weeks: [
          "Week 1: Learn the movements in walk-throughs.",
          "Week 2: Full speed with passive opponents.",
          "Week 3: Full speed with real opponents.",
          "Week 4: Play games and record one good decision and one to improve after each session.",
        ],
        sessions: [
          {
            aim: "Movement off the ball.",
            activities: [
              { name: "Third-Man Run", minutes: 18, drill: "mid-07" },
              { name: "Run in Behind", minutes: 15, drill: "str-08" },
              { name: "Small-sided game", minutes: 17, how: "6v6. A goal after a run in behind counts double." },
            ],
          },
          {
            aim: "Defending outnumbered.",
            activities: [
              { name: "2v1 Recovery Defending", minutes: 18, drill: "def-07" },
              { name: "Defend the Box vs Low Crosses", minutes: 15, drill: "def-08" },
              { name: "Small-sided game", minutes: 17, how: "Attacking team has 1 extra player. Defenders try to delay." },
            ],
          },
          {
            aim: "Goalkeeper and box decisions.",
            activities: [
              { name: "Crosses: Claim or Punch", minutes: 18, drill: "gk-07" },
              { name: "1v1: Narrow the Angle", minutes: 15, drill: "gk-08" },
              { name: "Small-sided game", minutes: 17, how: "With keepers. Field players: practise talking to your keeper." },
            ],
          },
        ],
      },
      {
        id: "adv-phys",
        focus: "Physical Development",
        title: "Match Ready",
        summary: "Repeat sprints, strength and recovery habits for full matches.",
        // Week 4 is a lighter 'recovery' week, so it uses its own bonus list.
        weekBonus: [0, 5, 10, -10],
        weeks: [
          "Week 1: Advanced versions of exercises, focus on form.",
          "Week 2: Same volume, slightly faster sprints.",
          "Week 3: Add 1 set or 1 interval. This is the hardest week.",
          "Week 4: Lighter week: reduce volume by about a third so your body can recover and adapt.",
        ],
        sessions: [
          {
            aim: "Repeat sprint ability.",
            activities: [
              { name: "Speed and agility circuit", minutes: 20, link: "fitness.html#speed", how: "6 x 20m sprints with full walk-back recovery, plus cone agility." },
              { name: "Run in Behind", minutes: 15, drill: "str-08" },
              { name: "Small-sided game", minutes: 15, how: "3v3, 2-minute games, 2 minutes rest." },
            ],
          },
          {
            aim: "Strength, power and control.",
            activities: [
              { name: "Strength circuit (advanced)", minutes: 25, link: "fitness.html#strength", how: "Bodyweight only: jump squats, reverse lunges, push-ups, plank variations, single-leg calf raises." },
              { name: "Mobility and stretching", minutes: 10, link: "fitness.html#mobility" },
              { name: "Technical passing", minutes: 15, drill: "def-06" },
            ],
          },
          {
            aim: "Game-speed endurance.",
            activities: [
              { name: "Interval runs", minutes: 20, link: "fitness.html#endurance", how: "Run 2 minutes at a strong pace, 1 minute easy. 5-6 times." },
              { name: "Small-sided game", minutes: 30, how: "5v5 in 5-minute games with 2 minutes rest." },
            ],
          },
        ],
      },
    ],
  },
};
