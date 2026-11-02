// =========================================================
// programmes.js: the Training Programmes page.
//
// It works like a simple app with screens, one at a time:
//   1. LEVEL      "What's your level?"            (3 big cards)
//   2. GOAL       "What do you want to improve?"  (3 big cards)
//   3. PLAN       Your plan: today's session, then the 4 weeks
//                 (pick a week to see its 3 sessions)
//   4. SESSION    Step-by-step session with a timer
//   5. CELEBRATE  Well done! Saved to the tracker.
//
// The chosen plan is remembered on this device, so next time
// the player lands straight on their plan.
// =========================================================

import { LEVELS, WARM_UP_MIN, COOL_DOWN_MIN, WEEK_BONUS_MIN } from "./data/programmes.js";
import { WARM_UP, STRENGTH, SPEED, ENDURANCE, MOBILITY } from "./data/fitness.js";
import { openDrillModal, findDrill } from "./drill-modal.js";
import { loadData, saveData, removeData, escapeHTML, askToConfirm } from "./storage.js";

const PLAN_KEY = "pitchpath-my-plan";                // { level, programmeId }
const PROGRESS_KEY = "pitchpath-programme-progress"; // which sessions are done
const TRACKER_KEY = "pitchpath-tracker";             // same key tracker.js uses
const CHECKLIST_KEY = "pitchpath-levelup-v1";
const LETTERS = ["A", "B", "C"];

// Friendly words and pictures for each choice
const LEVEL_CARDS = {
  beginner: { emoji: "🌱", line: "New to training with a plan" },
  intermediate: { emoji: "⚡", line: "I play for a team or club" },
  advanced: { emoji: "🔥", line: "Regular club player, want more" },
};
const GOAL_CARDS = {
  "Technical Skills": { emoji: "⚽", name: "Ball skills", line: "Touch, passing, dribbling and shooting" },
  "Game Understanding": { emoji: "🧠", name: "Game smarts", line: "Positioning, movement and decisions" },
  "Physical Development": { emoji: "💪", name: "Fitness", line: "Speed, strength and stamina" },
};

const app = document.getElementById("app");

// What we're showing right now
const state = { screen: "level", level: null, programmeId: null, session: null, viewWeek: null };

// =========================================================
// Saved data helpers
// =========================================================

function loadProgress() {
  const saved = loadData(PROGRESS_KEY, null);
  return saved && saved.version === 1 && saved.done ? saved : { version: 1, done: {} };
}

function sessionKey(programme, week, letter) { return `${programme.id}-w${week}-${letter}`; }
function isDone(programme, week, letter) { return Boolean(loadProgress().done[sessionKey(programme, week, letter)]); }

function getProgramme() {
  if (!state.level) return null;
  return LEVELS[state.level].programmes.find((p) => p.id === state.programmeId) || null;
}

function allSessions(programme) {
  const list = [];
  programme.weeks.forEach((_, w) => LETTERS.forEach((letter) => list.push({ week: w + 1, letter })));
  return list;
}

function nextSession(programme) {
  return allSessions(programme).find((s) => !isDone(programme, s.week, s.letter)) || null;
}

function doneCount(programme) {
  return allSessions(programme).filter((s) => isDone(programme, s.week, s.letter)).length;
}

function todayText() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// =========================================================
// Building one session as a list of simple STEPS
// Each step: { kind, title, minutes, activity? }
// =========================================================

function buildSteps(programme, week, letter) {
  const session = programme.sessions[LETTERS.indexOf(letter)];
  const bonus = (programme.weekBonus || WEEK_BONUS_MIN)[week - 1];
  const steps = [{ kind: "warmup", title: "Warm-up", minutes: WARM_UP_MIN }];
  session.activities.forEach((a, i) => {
    steps.push({ kind: "activity", title: a.name, minutes: a.minutes + (i === 0 ? bonus : 0), activity: a });
  });
  steps.push({ kind: "cooldown", title: "Cool-down", minutes: COOL_DOWN_MIN });
  return { session, steps, total: steps.reduce((sum, s) => sum + s.minutes, 0) };
}

function fitnessListHTML(link) {
  const section = link.split("#")[1];
  if (section === "strength") {
    return `<ul class="step-list">${STRENGTH.map((ex) => `<li><strong>${escapeHTML(ex.name)}</strong>: ${escapeHTML(ex[state.level])}</li>`).join("")}</ul>`;
  }
  if (section === "speed") {
    return `<ul class="step-list">${SPEED.map((s) => `<li><strong>${escapeHTML(s.name)}</strong>: ${escapeHTML(s.how)}</li>`).join("")}</ul>`;
  }
  if (section === "endurance") {
    const plan = ENDURANCE.find((e) => e.level === LEVELS[state.level].label) || ENDURANCE[0];
    return `<p>${escapeHTML(plan.plan)}</p>`;
  }
  if (section === "mobility") {
    return `<ul class="step-list">${MOBILITY.map((m) => `<li><strong>${escapeHTML(m.name)}</strong>: ${escapeHTML(m.how)}</li>`).join("")}</ul>`;
  }
  return "";
}

function stepBodyHTML(step) {
  if (step.kind === "warmup") {
    return `<p>Get your body ready. Do each move for about 30-60 seconds:</p>
      <ul class="step-list">${WARM_UP.map((w) => `<li><strong>${escapeHTML(w.name)}</strong>: ${escapeHTML(w.how)}</li>`).join("")}</ul>`;
  }
  if (step.kind === "cooldown") {
    return `<p>Walk or jog slowly for 2 minutes. Then hold each stretch for 20-30 seconds. Never bounce.</p>
      <ul class="step-list">${MOBILITY.slice(0, 5).map((m) => `<li><strong>${escapeHTML(m.name)}</strong>: ${escapeHTML(m.how)}</li>`).join("")}</ul>
      <p>Drink some water. Great work!</p>`;
  }
  const a = step.activity;
  const drill = a.drill ? findDrill(a.drill) : null;
  let html = "";
  if (drill) {
    html += `<p>${escapeHTML(drill.setup)}</p>
      <ol class="step-list">${drill.steps.map((s) => `<li>${escapeHTML(s)}</li>`).join("")}</ol>
      <p class="step-tip"><strong>Tip:</strong> ${escapeHTML(drill.coachingPoints[0])}</p>
      <button type="button" class="btn btn--outline btn--small" data-open-drill="${drill.id}">See diagram and full details</button>`;
  }
  if (a.how) html += `<p>${escapeHTML(a.how)}</p>`;
  if (a.link) html += fitnessListHTML(a.link);
  return html;
}

// =========================================================
// SCREEN 1: choose a level
// =========================================================

function levelScreenHTML() {
  const cards = Object.entries(LEVELS).map(([key, level]) => `
    <button type="button" class="choice-card" data-choose-level="${key}">
      <span class="choice-card__emoji" aria-hidden="true">${LEVEL_CARDS[key].emoji}</span>
      <span class="choice-card__title">${escapeHTML(level.label)}</span>
      <span class="choice-card__line">${escapeHTML(LEVEL_CARDS[key].line)}</span>
      <span class="choice-card__more">${escapeHTML(level.who)}</span>
    </button>`).join("");
  return `
    <div class="wizard">
      <p class="wizard__step">Step 1 of 2</p>
      <h2 class="wizard__question" tabindex="-1">What's your level?</h2>
      <p class="wizard__hint">Pick the one that sounds most like you. You can change it any time.</p>
      <div class="choice-grid">${cards}</div>
    </div>`;
}

// =========================================================
// SCREEN 2: choose what to improve
// =========================================================

function goalScreenHTML() {
  const level = LEVELS[state.level];
  const cards = level.programmes.map((p) => {
    const g = GOAL_CARDS[p.focus];
    return `
      <button type="button" class="choice-card" data-choose-programme="${p.id}">
        <span class="choice-card__emoji" aria-hidden="true">${g.emoji}</span>
        <span class="choice-card__title">${escapeHTML(g.name)}</span>
        <span class="choice-card__line">${escapeHTML(g.line)}</span>
        <span class="choice-card__more">Plan: "${escapeHTML(p.title)}" · 4 weeks · 3 sessions a week</span>
      </button>`;
  }).join("");
  return `
    <div class="wizard">
      <button type="button" class="back-link" data-go="level">← Change level (${escapeHTML(level.label)})</button>
      <p class="wizard__step">Step 2 of 2</p>
      <h2 class="wizard__question" tabindex="-1">What do you want to get better at?</h2>
      <p class="wizard__hint">Not sure? <strong>Ball skills</strong> is the best all-round choice.</p>
      <div class="choice-grid">${cards}</div>
    </div>`;
}

// =========================================================
// SCREEN 3: my plan
// =========================================================

function ringHTML(done, total) {
  const circumference = 2 * Math.PI * 52;
  return `
    <svg class="ring" viewBox="0 0 120 120" role="img" aria-label="${done} of ${total} sessions done">
      <circle cx="60" cy="60" r="52" fill="none" stroke="#132C5A" stroke-width="12"/>
      <circle class="ring__bar" cx="60" cy="60" r="52" fill="none" stroke="#A9DCFA" stroke-width="12" stroke-linecap="round"
        stroke-dasharray="${circumference}" stroke-dashoffset="${circumference * (1 - done / total)}" transform="rotate(-90 60 60)"/>
      <text x="60" y="58" text-anchor="middle" font-size="28" font-weight="900" fill="#F6F8FB">${done}</text>
      <text x="60" y="80" text-anchor="middle" font-size="12" fill="#B8C4CF">of ${total} done</text>
    </svg>`;
}

// "A" -> 1, "B" -> 2, "C" -> 3 (players see numbers, not letters)
function sessionNumber(letter) { return LETTERS.indexOf(letter) + 1; }

// The 4 weeks as simple buttons. The chosen week shows its 3 sessions.
function weekPickerHTML(programme, viewWeek) {
  return programme.weeks.map((_, w) => {
    const week = w + 1;
    const allDone = LETTERS.every((letter) => isDone(programme, week, letter));
    return `<button type="button" class="week-pick ${allDone ? "is-done" : ""}" data-view-week="${week}"
      aria-pressed="${week === viewWeek}">${allDone ? "✓ " : ""}Week ${week}</button>`;
  }).join("");
}

// One row per session: number, aim, minutes and a clear status
function sessionRowsHTML(programme, week, next) {
  return LETTERS.map((letter) => {
    const { session, total } = buildSteps(programme, week, letter);
    const finished = isDone(programme, week, letter);
    const isNext = next && next.week === week && next.letter === letter;
    const status = finished ? "Done" : isNext ? "Up next" : "Later";
    const action = finished
      ? `<button type="button" class="session-row__undo" data-undo="${week}-${letter}">Undo</button>`
      : `<button type="button" class="btn ${isNext ? "btn--primary" : "btn--outline"} btn--small" data-start="${week}-${letter}"
          aria-label="Start week ${week}, session ${sessionNumber(letter)}: ${escapeHTML(session.aim)}">${isNext ? "Start" : "Open"}</button>`;
    return `
      <li class="session-row ${finished ? "is-done" : ""} ${isNext ? "is-next" : ""}">
        <span class="session-row__num" aria-hidden="true">${finished ? "✓" : sessionNumber(letter)}</span>
        <span class="session-row__text">
          <span class="session-row__aim">${escapeHTML(session.aim)}</span>
          <span class="session-row__meta">Session ${sessionNumber(letter)} · ${total} min · <span class="pill pill--${status === "Done" ? "done" : status === "Up next" ? "next" : "later"}">${status}</span></span>
        </span>
        ${action}
      </li>`;
  }).join("");
}

// The week buttons, what changes that week, and its 3 sessions
function weekViewHTML(programme, viewWeek, next) {
  // This week's change, in plain words (the text after "Week 1:")
  const weekChange = programme.weeks[viewWeek - 1].split(":").slice(1).join(":").trim();
  return `
    <div class="week-picks" role="group" aria-label="Choose a week">${weekPickerHTML(programme, viewWeek)}</div>
    <p class="week-note"><strong>Week ${viewWeek}:</strong> ${escapeHTML(weekChange)}</p>
    <ol class="session-rows">${sessionRowsHTML(programme, viewWeek, next)}</ol>`;
}

function planScreenHTML() {
  const programme = getProgramme();
  const level = LEVELS[state.level];
  const goal = GOAL_CARDS[programme.focus];
  const total = programme.weeks.length * LETTERS.length;
  const done = doneCount(programme);
  const next = nextSession(programme);
  const viewWeek = state.viewWeek || (next ? next.week : programme.weeks.length);

  let nextCard;
  if (next) {
    const { session, steps, total: minutes } = buildSteps(programme, next.week, next.letter);
    // A short "what you'll do" timeline: warm-up, each activity, cool-down
    const timeline = steps.map((step) => `<li><span>${escapeHTML(step.title)}</span><span class="today__min">${step.minutes} min</span></li>`).join("");
    nextCard = `
      <section class="today" aria-labelledby="today-title">
        <div class="today__head">
          <p class="today__label">Today · Week ${next.week}, session ${sessionNumber(next.letter)} of 3</p>
          <h3 class="today__title" id="today-title">${escapeHTML(session.aim)}</h3>
          <p class="today__meta">⏱ ${minutes} minutes in total</p>
          <button type="button" class="btn btn--primary btn--big btn--arrow" data-start="${next.week}-${next.letter}">Start session</button>
        </div>
        <div class="today__plan">
          <p class="today__plan-title">What you'll do</p>
          <ol class="today__steps">${timeline}</ol>
        </div>
      </section>`;
  } else {
    nextCard = `
      <section class="today today--complete">
        <div class="today__head">
          <p class="today__label">Plan complete</p>
          <h3 class="today__title">🏆 You finished all 12 sessions!</h3>
          <p>Open the level-up checklist below. If you can tick everything, move up a level.</p>
          <button type="button" class="btn btn--primary" data-go="level">Choose a new plan</button>
        </div>
      </section>`;
  }

  const saved = loadData(CHECKLIST_KEY, {});
  const checklist = level.levelUp.map((item, i) => {
    const id = `check-${state.level}-${i}`;
    return `<li><label><input type="checkbox" id="${id}" data-check ${saved[id] ? "checked" : ""}> ${escapeHTML(item)}</label></li>`;
  }).join("");

  return `
    <div class="plan-screen">
      <div class="plan-hero">
        <div class="plan-hero__text">
          <p class="plan-hero__tag">${goal.emoji} ${escapeHTML(level.label)} · ${escapeHTML(goal.name)}</p>
          <h2 class="plan-hero__title" tabindex="-1">${escapeHTML(programme.title)}</h2>
          <p>${escapeHTML(programme.summary)}</p>
          <button type="button" class="link-button link-button--light" data-go="level">Change plan</button>
        </div>
        ${ringHTML(done, total)}
      </div>

      ${nextCard}

      <section class="plan-section" aria-labelledby="weeks-title">
        <h3 id="weeks-title">Your 4 weeks</h3>
        <div id="week-view">${weekViewHTML(programme, viewWeek, next)}</div>
        <p class="muted">Do 3 sessions a week with a rest day in between.</p>
      </section>

      <details class="plan-extra">
        <summary>Ready to level up? <span class="muted">Open the checklist</span></summary>
        <p>Tick each one you can honestly do. When they're all ticked, move up a level.</p>
        <ul class="levelup__list">${checklist}</ul>
        <p class="levelup__count" aria-live="polite"></p>
      </details>

      <p class="notice notice--warning">Always warm up, stop if something hurts, and keep 1-2 rest days a week. If you also train with a club, do fewer sessions.</p>
    </div>`;
}

// =========================================================
// SCREEN 4: session mode (one step at a time, with a timer)
// =========================================================

const timer = { id: null, secondsLeft: 0, running: false };

function stopTimer() {
  clearInterval(timer.id);
  timer.id = null;
  timer.running = false;
}

function formatTime(seconds) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function sessionScreenHTML() {
  const programme = getProgramme();
  const { week, letter, stepIndex } = state.session;
  const { session, steps } = buildSteps(programme, week, letter);
  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;
  const dots = steps.map((s, i) => `<span class="step-dot ${i < stepIndex ? "is-past" : ""} ${i === stepIndex ? "is-current" : ""}"></span>`).join("");

  return `
    <div class="session-mode">
      <div class="session-mode__top">
        <button type="button" class="back-link" data-go="plan">← Back to my plan</button>
        <p class="session-mode__name">Week ${week} · Session ${sessionNumber(letter)}: ${escapeHTML(session.aim)}</p>
        <div class="step-dots" aria-hidden="true">${dots}</div>
      </div>

      <div class="step-card">
        <p class="step-card__count">Step ${stepIndex + 1} of ${steps.length}</p>
        <h2 class="step-card__title" tabindex="-1">${escapeHTML(step.title)}</h2>
        <div class="step-timer">
          <span class="step-timer__clock" id="step-clock" aria-hidden="true">${formatTime(step.minutes * 60)}</span>
          <button type="button" class="btn btn--green" id="timer-toggle">▶ Start ${step.minutes}-min timer</button>
        </div>
        <div class="step-card__body">${stepBodyHTML(step)}</div>
      </div>

      <div class="session-mode__nav">
        <button type="button" class="btn btn--outline" data-step="prev" ${stepIndex === 0 ? "disabled" : ""}>← Back</button>
        ${isLast
          ? `<button type="button" class="btn btn--primary btn--big" data-finish>Finish session ✓</button>`
          : `<button type="button" class="btn btn--primary btn--big btn--arrow" data-step="next">Next: ${escapeHTML(steps[stepIndex + 1].title)}</button>`}
      </div>
      <p class="visually-hidden" id="session-announce" aria-live="polite"></p>
    </div>`;
}

function toggleTimer() {
  const button = document.getElementById("timer-toggle");
  const clock = document.getElementById("step-clock");
  if (timer.running) {
    stopTimer();
    button.textContent = "▶ Resume";
    return;
  }
  if (timer.secondsLeft <= 0) {
    const { steps } = buildSteps(getProgramme(), state.session.week, state.session.letter);
    timer.secondsLeft = steps[state.session.stepIndex].minutes * 60;
  }
  timer.running = true;
  button.textContent = "⏸ Pause";
  timer.id = setInterval(() => {
    timer.secondsLeft -= 1;
    clock.textContent = formatTime(Math.max(timer.secondsLeft, 0));
    if (timer.secondsLeft <= 0) {
      stopTimer();
      clock.textContent = "Time!";
      button.textContent = "↺ Restart timer";
      document.getElementById("session-announce").textContent = "Time is up. Move on to the next step when you're ready.";
    }
  }, 1000);
}

// Saves the finished session to the plan progress AND the tracker
function finishSession(effort) {
  const programme = getProgramme();
  const { week, letter } = state.session;
  const key = sessionKey(programme, week, letter);
  const progress = loadProgress();
  if (progress.done[key]) return; // already saved

  const { total } = buildSteps(programme, week, letter);
  const trackerSession = {
    id: `prog-${key}-${Date.now().toString(36)}`,
    date: todayText(),
    type: programme.focus === "Physical Development" ? "fitness" : "technical",
    duration: total,
    effort,
    position: "",
    notes: `${LEVELS[state.level].label} · ${programme.title} · Week ${week} Session ${sessionNumber(letter)}`,
  };
  const tracker = loadData(TRACKER_KEY, null) || {
    version: 1, profile: { nickname: "", position: "", level: "", weeklyGoal: 3 }, sessions: [], ratings: [],
  };
  tracker.sessions.push(trackerSession);
  saveData(TRACKER_KEY, tracker);
  progress.done[key] = { date: todayText(), trackerId: trackerSession.id };
  saveData(PROGRESS_KEY, progress);
}

// =========================================================
// SCREEN 5: celebration
// =========================================================

function celebrateHTML() {
  const done = doneCount(getProgramme());
  const colours = ["#7CC6F2", "#A9DCFA", "#1565C0", "#F6F8FB"];
  const confetti = Array.from({ length: 28 }, (_, i) =>
    `<span class="confetti" style="--x:${(i * 37) % 100}%;--d:${(i % 7) * 110}ms;--c:${colours[i % 4]}"></span>`).join("");
  return `
    <div class="celebrate">
      <div class="confetti-box" aria-hidden="true">${confetti}</div>
      <p class="celebrate__emoji" aria-hidden="true">🎉</p>
      <h2 class="celebrate__title" tabindex="-1">Session complete!</h2>
      <p class="lead">That's <strong>${done} of 12</strong> sessions done. It's saved in your tracker.</p>
      <p class="celebrate__ask">How hard did it feel?</p>
      <div class="effort-pick" role="group" aria-label="How hard did it feel">
        <button type="button" class="btn btn--outline" data-effort="4">😌 Easy</button>
        <button type="button" class="btn btn--outline" data-effort="6">🙂 Just right</button>
        <button type="button" class="btn btn--outline" data-effort="8">😤 Hard</button>
      </div>
      <p class="muted" id="effort-msg" aria-live="polite"></p>
      <div class="btn-row" style="justify-content:center">
        <button type="button" class="btn btn--primary btn--arrow" data-go="plan">Back to my plan</button>
        <a class="btn btn--outline" href="tracker.html">See my tracker</a>
      </div>
    </div>`;
}

// Update the effort on the session we just saved
function setEffort(effort) {
  const programme = getProgramme();
  const entry = loadProgress().done[sessionKey(programme, state.session.week, state.session.letter)];
  const tracker = loadData(TRACKER_KEY, null);
  if (!entry || !tracker) return;
  const saved = tracker.sessions.find((s) => s.id === entry.trackerId);
  if (saved) saved.effort = effort;
  saveData(TRACKER_KEY, tracker);
  document.querySelectorAll("[data-effort]").forEach((b) => b.classList.toggle("is-picked", Number(b.dataset.effort) === effort));
  document.getElementById("effort-msg").textContent = "Thanks! Saved.";
}

async function undoSession(week, letter) {
  const ok = await askToConfirm("Mark this session as not done? It will also be removed from your tracker.", "Mark as not done");
  if (!ok) return;
  const key = sessionKey(getProgramme(), week, letter);
  const progress = loadProgress();
  const entry = progress.done[key];
  delete progress.done[key];
  saveData(PROGRESS_KEY, progress);
  const tracker = loadData(TRACKER_KEY, null);
  if (entry && tracker) {
    tracker.sessions = tracker.sessions.filter((s) => s.id !== entry.trackerId);
    saveData(TRACKER_KEY, tracker);
  }
  render();
}

// =========================================================
// Showing a screen
// =========================================================

function render() {
  stopTimer();
  timer.secondsLeft = 0;
  let html = "";
  if (state.screen === "level") html = levelScreenHTML();
  else if (state.screen === "goal") html = goalScreenHTML();
  else if (state.screen === "plan") html = planScreenHTML();
  else if (state.screen === "session") html = sessionScreenHTML();
  else if (state.screen === "celebrate") html = celebrateHTML();
  app.innerHTML = `<div class="screen">${html}</div>`;

  updateChecklistCount();
  updateURL();

  // Move focus to the new screen's heading (helps keyboard and screen reader users)
  const heading = app.querySelector("h2[tabindex]");
  if (heading) heading.focus({ preventScroll: true });
  const top = document.getElementById("app-top").getBoundingClientRect().top + window.scrollY - 90;
  if (window.scrollY > top) window.scrollTo({ top, behavior: "auto" });
}

function go(screen) {
  state.screen = screen;
  render();
}

function updateURL() {
  const url = new URL(window.location);
  url.search = "";
  if (state.level && state.screen !== "level") url.searchParams.set("level", state.level);
  if (state.programmeId && ["plan", "session", "celebrate"].includes(state.screen)) url.searchParams.set("programme", state.programmeId);
  history.replaceState(null, "", url);
}

function updateChecklistCount() {
  const el = app.querySelector(".levelup__count");
  if (!el) return;
  const boxes = app.querySelectorAll("[data-check]");
  const ticked = [...boxes].filter((b) => b.checked).length;
  el.textContent = ticked === boxes.length ? "All ticked! You're ready for the next level." : `${ticked} of ${boxes.length} ticked.`;
}

// =========================================================
// Clicks (one listener for the whole app)
// =========================================================

app.addEventListener("click", (event) => {
  const b = event.target.closest("button");
  if (!b) return;

  if (b.dataset.chooseLevel) {
    state.level = b.dataset.chooseLevel;
    go("goal");
  } else if (b.dataset.chooseProgramme) {
    state.programmeId = b.dataset.chooseProgramme;
    state.viewWeek = null;
    saveData(PLAN_KEY, { level: state.level, programmeId: state.programmeId });
    go("plan");
  } else if (b.dataset.go) {
    if (b.dataset.go === "level") removeData(PLAN_KEY);
    go(b.dataset.go);
  } else if (b.dataset.viewWeek) {
    // Only redraw the week part, so the page doesn't jump
    state.viewWeek = Number(b.dataset.viewWeek);
    const programme = getProgramme();
    document.getElementById("week-view").innerHTML = weekViewHTML(programme, state.viewWeek, nextSession(programme));
    const picked = app.querySelector(`[data-view-week="${state.viewWeek}"]`);
    if (picked) picked.focus();
  } else if (b.dataset.undo) {
    const [week, letter] = b.dataset.undo.split("-");
    undoSession(Number(week), letter);
  } else if (b.dataset.start) {
    const [week, letter] = b.dataset.start.split("-");
    state.session = { week: Number(week), letter, stepIndex: 0 };
    go("session");
  } else if (b.dataset.step) {
    state.session.stepIndex += b.dataset.step === "next" ? 1 : -1;
    render();
  } else if (b.dataset.finish !== undefined) {
    finishSession(6);
    state.viewWeek = null; // back on the plan, show the week of the next session
    go("celebrate");
  } else if (b.dataset.effort) {
    setEffort(Number(b.dataset.effort));
  } else if (b.dataset.openDrill) {
    openDrillModal(b.dataset.openDrill, b);
  } else if (b.id === "timer-toggle") {
    toggleTimer();
  }
});

app.addEventListener("change", (event) => {
  if (!event.target.matches("[data-check]")) return;
  const saved = loadData(CHECKLIST_KEY, {});
  saved[event.target.id] = event.target.checked;
  saveData(CHECKLIST_KEY, saved);
  updateChecklistCount();
});

// =========================================================
// Start: use the link first, then the saved plan
// =========================================================

function start() {
  const params = new URLSearchParams(window.location.search);
  const saved = loadData(PLAN_KEY, null);
  const level = params.get("level") || (saved && saved.level);
  const programmeId = params.get("programme") || (saved && saved.programmeId);

  if (LEVELS[level]) {
    state.level = level;
    state.screen = "goal";
    if (LEVELS[level].programmes.some((p) => p.id === programmeId)) {
      state.programmeId = programmeId;
      state.screen = "plan";
    }
  }
  render();
}

start();
