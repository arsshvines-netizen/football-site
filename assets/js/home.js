// =========================================================
// home.js: the app-style Home screen.
// Uses only what's saved on this device (nothing is sent):
//   - Greeting that changes with the time of day
//   - TODAY card: your next programme session (or "get a plan")
//   - THIS WEEK: which days you logged training in the Tracker
//   - Challenge of the month (from data/plans.js)
// =========================================================

import { LEVELS, WARM_UP_MIN, COOL_DOWN_MIN, WEEK_BONUS_MIN } from "./data/programmes.js";
import { CHALLENGE } from "./data/plans.js";
import { loadData, escapeHTML } from "./storage.js";

// Same storage keys as programmes.js and tracker.js
const PLAN_KEY = "pitchpath-my-plan";
const PROGRESS_KEY = "pitchpath-programme-progress";
const TRACKER_KEY = "pitchpath-tracker";
const LETTERS = ["A", "B", "C"];

// ---------- Greeting ----------

function greeting() {
  const hour = new Date().getHours();
  const part = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  document.getElementById("ah-greet").textContent = `${part} 👋`;
}

// ---------- Today card ----------

function savedProgramme() {
  const plan = loadData(PLAN_KEY, null);
  if (!plan || !LEVELS[plan.level]) return null;
  return LEVELS[plan.level].programmes.find((p) => p.id === plan.programmeId) || null;
}

function sessionMinutes(programme, week, letter) {
  const session = programme.sessions[LETTERS.indexOf(letter)];
  const bonus = (programme.weekBonus || WEEK_BONUS_MIN)[week - 1];
  return WARM_UP_MIN + COOL_DOWN_MIN + bonus + session.activities.reduce((sum, a) => sum + a.minutes, 0);
}

function ringSVG(done, total) {
  const r = 40, c = 2 * Math.PI * r;
  return `
    <svg class="ah-ring" viewBox="0 0 100 100" role="img" aria-label="${done} of ${total} sessions done">
      <circle cx="50" cy="50" r="${r}" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="10"/>
      <circle class="ah-ring__bar" cx="50" cy="50" r="${r}" fill="none" stroke="#FFC857" stroke-width="10" stroke-linecap="round"
        stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (1 - done / total)).toFixed(1)}" transform="rotate(-90 50 50)"/>
      <text x="50" y="50" text-anchor="middle" font-size="24" font-weight="900" fill="#FFFFFF">${done}</text>
      <text x="50" y="67" text-anchor="middle" font-size="11" font-weight="700" fill="#FFFFFF">of ${total}</text>
    </svg>`;
}

function buildToday() {
  const programme = savedProgramme();
  if (!programme) return; // keep the "Get your free plan" card from the HTML
  const progress = loadData(PROGRESS_KEY, null);
  const done = (progress && progress.version === 1 && progress.done) || {};
  const all = [];
  programme.weeks.forEach((_, w) => LETTERS.forEach((letter) => all.push({ week: w + 1, letter })));
  const isDone = (s) => Boolean(done[`${programme.id}-w${s.week}-${s.letter}`]);
  const doneCount = all.filter(isDone).length;
  const next = all.find((s) => !isDone(s));
  const card = document.getElementById("ah-today");

  if (!next) {
    card.innerHTML = `
      <p class="ah-label">🏆 Plan complete</p>
      <h2 id="ah-today-title" class="ah-today__title">You finished all ${all.length} sessions!</h2>
      <p class="ah-today__text">Check the level-up list, then pick your next plan.</p>
      <a class="btn-start" href="programmes.html"><span class="btn-start__ball" aria-hidden="true">🏆</span><span class="btn-start__text">Choose a new plan</span><span class="btn-start__arrow" aria-hidden="true">→</span></a>`;
    return;
  }
  const session = programme.sessions[LETTERS.indexOf(next.letter)];
  const number = LETTERS.indexOf(next.letter) + 1;
  card.classList.add("has-plan");
  card.innerHTML = `
    <div class="ah-today__top">
      <div>
        <p class="ah-label">⚽ Today · Week ${next.week}, session ${number} of 3</p>
        <h2 id="ah-today-title" class="ah-today__title">${escapeHTML(session.aim)}</h2>
        <p class="ah-today__text">${escapeHTML(programme.title)} · ⏱ ${sessionMinutes(programme, next.week, next.letter)} min</p>
      </div>
      ${ringSVG(doneCount, all.length)}
    </div>
    <a class="btn-start" href="programmes.html">
      <span class="btn-start__ball" aria-hidden="true">⚽</span>
      <span class="btn-start__text">Start session <small>Your plan is ready</small></span>
      <span class="btn-start__arrow" aria-hidden="true">→</span>
    </a>`;
}

// ---------- This week (from the Tracker) ----------

function isoDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function buildWeek() {
  const sessions = (loadData(TRACKER_KEY, null)?.sessions) || [];
  const trainedDays = new Set(sessions.map((s) => s.date));
  const todayIndex = (new Date().getDay() + 6) % 7; // Monday = 0
  const monday = new Date();
  monday.setDate(monday.getDate() - todayIndex);
  let count = 0;
  let minutes = 0;
  const names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  document.getElementById("ah-days").innerHTML = names.map((name, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    const trained = trainedDays.has(isoDate(day));
    if (trained) {
      count += 1;
      minutes += sessions.filter((s) => s.date === isoDate(day)).reduce((sum, s) => sum + (Number(s.duration) || 0), 0);
    }
    const label = `${name}: ${trained ? "trained" : i < todayIndex ? "no training" : i === todayIndex ? "today" : "coming up"}`;
    return `
      <li class="ah-day ${trained ? "is-trained" : ""} ${i === todayIndex ? "is-today" : ""}" style="--d:${i}" aria-label="${label}">
        <span class="ah-day__dot" aria-hidden="true">${trained ? "✓" : ""}</span>
        <span class="ah-day__name" aria-hidden="true">${name.charAt(0)}</span>
      </li>`;
  }).join("");
  const sessionsThisWeek = sessions.filter((s) => {
    const i = Math.round((new Date(`${s.date}T12:00`) - new Date(`${isoDate(monday)}T12:00`)) / 86400000);
    return i >= 0 && i < 7;
  }).length;
  document.getElementById("ah-week-sessions").textContent = sessionsThisWeek;
  document.getElementById("ah-week-minutes").textContent = minutes;
  document.getElementById("ah-week-count").textContent = count
    ? (count >= 3 ? "Brilliant week! Keep it up 🔥" : "Nice start. Keep it going! 💪")
    : "No sessions yet this week. Today's a great day to start!";
}

// ---------- Challenge ----------

function buildChallenge() {
  const box = document.getElementById("challenge");
  const month = new Date().toLocaleDateString("en-GB", { month: "long" });
  box.innerHTML = `
    <p class="ah-label">🏆 ${month} challenge</p>
    <h2 id="ah-challenge-title" class="ah-challenge__title">${escapeHTML(CHALLENGE.title)}</h2>
    <p class="ah-challenge__goal">${escapeHTML(CHALLENGE.goal)}</p>
    <a class="btn btn--primary btn--arrow" href="tracker.html#log-session">Log today's session</a>`;
}

greeting();
buildToday();
buildWeek();
buildChallenge();
