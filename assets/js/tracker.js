// =========================================================
// tracker.js: the Player Progress Tracker.
// Everything is saved in localStorage on this device only.
//
// Saved data format (versioned so it can change later):
// {
//   version: 1,
//   profile:  { nickname, position, level, weeklyGoal },
//   sessions: [ { id, date, type, duration, effort, position, notes } ],
//   ratings:  [ { id, date, passing, dribbling, shooting,
//                 firstTouch, speed, stamina, positionSkill } ]
// }
// Dates are stored as text "YYYY-MM-DD".
// =========================================================

import { isStorageAvailable, loadData, saveData, removeData, downloadFile, escapeHTML, askToConfirm } from "./storage.js";
import { BRAND } from "./config.js";
import { setUpTabs } from "./tabs.js";

const STORAGE_KEY = "pitchpath-tracker";
const DATA_VERSION = 1;

const SESSION_TYPES = { technical: "Technical", fitness: "Fitness", match: "Match", other: "Other" };
const POSITIONS = { goalkeeper: "Goalkeeper", defender: "Defender", midfielder: "Midfielder", winger: "Winger", striker: "Striker" };
const LEVELS = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };

const EFFORT_WORDS = {
  1: "Very, very easy: like resting",
  2: "Very easy: gentle walking",
  3: "Easy: could chat the whole time",
  4: "Fairly easy: breathing a bit faster",
  5: "Moderate: working, but comfortable",
  6: "Somewhat hard: hard to talk in full sentences",
  7: "Hard: breathing hard, need to concentrate",
  8: "Very hard: can only say a few words",
  9: "Very, very hard: almost at my limit",
  10: "Maximum: I couldn't do any more",
};

// The 7 skills. Each has a different marker shape on the chart,
// so you don't need to tell colours apart.
const SKILLS = [
  { key: "passing", label: "Passing", color: "#1565C0", shape: "circle" },
  { key: "dribbling", label: "Dribbling", color: "#0B5C8E", shape: "square" },
  { key: "shooting", label: "Shooting", color: "#0A1F44", shape: "triangle" },
  { key: "firstTouch", label: "First touch", color: "#6A3FA0", shape: "diamond" },
  { key: "speed", label: "Speed", color: "#1F6FB2", shape: "circle-open" },
  { key: "stamina", label: "Stamina", color: "#8A6D00", shape: "square-open" },
  { key: "positionSkill", label: "Position skill", color: "#B3261E", shape: "triangle-open" },
];

const POSITION_SKILL_NAMES = {
  goalkeeper: "Shot-stopping",
  defender: "Tackling and marking",
  midfielder: "Vision and scanning",
  winger: "Crossing and 1v1s",
  striker: "Finishing",
};

const RATING_WORDS = { 1: "Need lots of work", 2: "Getting there", 3: "OK", 4: "Good", 5: "Excellent" };

// ---------------------------------------------------------
// Data: load, save, empty state
// ---------------------------------------------------------

const storageWorks = isStorageAvailable();

function emptyData() {
  return { version: DATA_VERSION, profile: { nickname: "", position: "", level: "", weeklyGoal: 3 }, sessions: [], ratings: [] };
}

let data = loadTrackerData();

function loadTrackerData() {
  if (!storageWorks) return emptyData();
  const saved = loadData(STORAGE_KEY, null);
  if (!saved) return emptyData();
  const cleaned = cleanImportedData(saved);
  return cleaned ? cleaned.data : emptyData();
}

function persist() {
  if (!storageWorks) return false;
  const ok = saveData(STORAGE_KEY, data);
  if (!ok) showMessage("global-message", "Sorry, your data could not be saved. Your browser storage may be full or turned off.", "error");
  return ok;
}

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// ---------------------------------------------------------
// Dates and weeks (weeks start on Monday)
// ---------------------------------------------------------

function parseDate(text) {
  const [y, m, d] = text.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toDateText(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function todayText() {
  return toDateText(new Date());
}

function startOfWeek(date) {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = (copy.getDay() + 6) % 7; // Monday = 0
  copy.setDate(copy.getDate() - day);
  return copy;
}

function weekKey(dateText) {
  return toDateText(startOfWeek(parseDate(dateText)));
}

function shortDate(dateText) {
  return parseDate(dateText).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function isValidDateText(text) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text || "")) return false;
  const date = parseDate(text);
  return toDateText(date) === text; // catches 2025-02-31 etc.
}

// ---------------------------------------------------------
// Validation: used by the forms AND by import
// Each returns { ok, errors: {field: message}, value }
// ---------------------------------------------------------

function validateSession(input) {
  const errors = {};
  const date = String(input.date || "");
  if (!date) errors.date = "Please choose the date of your session.";
  else if (!isValidDateText(date)) errors.date = "That date doesn't look right.";
  else if (date > todayText()) errors.date = "The date can't be in the future.";

  if (!SESSION_TYPES[input.type]) errors.type = "Please choose a session type.";

  const duration = Number(input.duration);
  if (input.duration === "" || input.duration === undefined || Number.isNaN(duration)) errors.duration = "Please enter how many minutes you trained.";
  else if (duration <= 0) errors.duration = "Duration must be more than 0 minutes.";
  else if (duration > 300) errors.duration = "That's more than 5 hours. Please check the number.";
  else if (!Number.isInteger(duration)) errors.duration = "Please use whole minutes (e.g. 45).";

  const effort = Number(input.effort);
  if (!Number.isInteger(effort) || effort < 1 || effort > 10) errors.effort = "Effort must be between 1 and 10.";

  if (input.position && !POSITIONS[input.position]) errors.position = "Please choose a position from the list.";

  const notes = String(input.notes || "").slice(0, 300);

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    value: { id: input.id || makeId(), date, type: input.type, duration, effort, position: input.position || "", notes },
  };
}

function validateRating(input) {
  const errors = {};
  const date = String(input.date || "");
  if (!date) errors.date = "Please choose a date.";
  else if (!isValidDateText(date)) errors.date = "That date doesn't look right.";
  else if (date > todayText()) errors.date = "The date can't be in the future.";

  const value = { id: input.id || makeId(), date };
  SKILLS.forEach((skill) => {
    const n = Number(input[skill.key]);
    if (!Number.isInteger(n) || n < 1 || n > 5) errors[skill.key] = "Choose a rating from 1 to 5.";
    value[skill.key] = n;
  });
  return { ok: Object.keys(errors).length === 0, errors, value };
}

function validateProfile(input) {
  const errors = {};
  const nickname = String(input.nickname || "").trim().slice(0, 20);
  if (input.position && !POSITIONS[input.position]) errors.position = "Please choose a position from the list.";
  if (input.level && !LEVELS[input.level]) errors.level = "Please choose a level from the list.";
  const goal = Number(input.weeklyGoal);
  if (!Number.isInteger(goal) || goal < 1 || goal > 7) errors.weeklyGoal = "Weekly goal must be between 1 and 7 sessions.";
  return {
    ok: Object.keys(errors).length === 0,
    errors,
    value: { nickname, position: input.position || "", level: input.level || "", weeklyGoal: goal },
  };
}

// Checks imported (or saved) data. Bad entries are skipped.
function cleanImportedData(raw) {
  if (!raw || typeof raw !== "object") return null;
  if (raw.version !== DATA_VERSION) return null;
  if (!Array.isArray(raw.sessions) || !Array.isArray(raw.ratings)) return null;

  const profileCheck = validateProfile(raw.profile || {});
  const profile = profileCheck.ok ? profileCheck.value : emptyData().profile;
  const sessions = raw.sessions.map(validateSession).filter((r) => r.ok).map((r) => r.value);
  const ratings = raw.ratings.map(validateRating).filter((r) => r.ok).map((r) => r.value);
  const skipped = (raw.sessions.length - sessions.length) + (raw.ratings.length - ratings.length);
  return { data: { version: DATA_VERSION, profile, sessions, ratings }, skipped };
}

// ---------------------------------------------------------
// Form helpers
// ---------------------------------------------------------

function showErrors(form, errors) {
  form.querySelectorAll("[data-error-for]").forEach((el) => { el.textContent = ""; });
  form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
  let first = null;
  Object.entries(errors).forEach(([field, message]) => {
    const errorEl = form.querySelector(`[data-error-for="${field}"]`);
    const input = form.elements[field];
    if (errorEl) errorEl.textContent = message;
    if (input && input.setAttribute) {
      input.setAttribute("aria-invalid", "true");
      if (!first) first = input;
    }
  });
  if (first) first.focus();
}

function showMessage(id, text, type = "success") {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = `notice ${type === "error" ? "notice--error" : type === "warning" ? "notice--warning" : ""}`;
  el.textContent = text;
}

function formToObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

// ---------------------------------------------------------
// Statistics
// ---------------------------------------------------------

function getStats() {
  const totalSessions = data.sessions.length;
  const totalMinutes = data.sessions.reduce((sum, s) => sum + s.duration, 0);
  const goal = data.profile.weeklyGoal || 3;

  // Count sessions in each week
  const perWeek = {};
  data.sessions.forEach((s) => {
    const key = weekKey(s.date);
    perWeek[key] = (perWeek[key] || 0) + 1;
  });

  const thisWeek = toDateText(startOfWeek(new Date()));
  const thisWeekCount = perWeek[thisWeek] || 0;

  // Streak: weeks in a row where you reached your goal.
  // This week counts if the goal is already reached; if not, we start from last week.
  let streak = 0;
  const cursor = startOfWeek(new Date());
  if ((perWeek[toDateText(cursor)] || 0) < goal) cursor.setDate(cursor.getDate() - 7);
  while ((perWeek[toDateText(cursor)] || 0) >= goal) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 7);
  }

  return { totalSessions, totalMinutes, goal, thisWeekCount, streak };
}

// Minutes per week for the last `count` weeks (oldest first)
function minutesPerWeek(count = 8) {
  const weeks = [];
  const start = startOfWeek(new Date());
  start.setDate(start.getDate() - 7 * (count - 1));
  for (let i = 0; i < count; i++) {
    const key = toDateText(start);
    weeks.push({ key, minutes: 0 });
    start.setDate(start.getDate() + 7);
  }
  data.sessions.forEach((s) => {
    const week = weeks.find((w) => w.key === weekKey(s.date));
    if (week) week.minutes += s.duration;
  });
  return weeks;
}

// ---------------------------------------------------------
// Charts (hand-made SVG, no libraries)
// ---------------------------------------------------------

function markerSVG(shape, x, y, color) {
  const open = shape.endsWith("-open");
  const fill = open ? "#FFFFFF" : color;
  const base = shape.replace("-open", "");
  const s = 5;
  if (base === "square") return `<rect x="${x - s}" y="${y - s}" width="${s * 2}" height="${s * 2}" fill="${fill}" stroke="${color}" stroke-width="2"/>`;
  if (base === "triangle") return `<polygon points="${x},${y - s - 1} ${x - s},${y + s} ${x + s},${y + s}" fill="${fill}" stroke="${color}" stroke-width="2"/>`;
  if (base === "diamond") return `<polygon points="${x},${y - s - 1} ${x + s + 1},${y} ${x},${y + s + 1} ${x - s - 1},${y}" fill="${fill}" stroke="${color}" stroke-width="2"/>`;
  return `<circle cx="${x}" cy="${y}" r="${s}" fill="${fill}" stroke="${color}" stroke-width="2"/>`;
}

function drawSkillChart() {
  const wrap = document.getElementById("skill-chart");
  const tableWrap = document.getElementById("skill-table");
  const choice = document.getElementById("skill-choice").value;
  const ratings = [...data.ratings].sort((a, b) => a.date.localeCompare(b.date)).slice(-12);

  if (ratings.length === 0) {
    wrap.innerHTML = `<div class="empty-state"><p><strong>No skill ratings yet.</strong></p><p>Rate yourself every few weeks and this chart will show how you're improving.</p><a class="btn btn--green btn--small" href="#rate-skills">Rate my skills</a></div>`;
    tableWrap.innerHTML = "";
    return;
  }

  const skills = choice === "all" ? SKILLS : SKILLS.filter((s) => s.key === choice);
  const W = 600, H = 300, left = 40, right = 20, top = 20, bottom = 50;
  const plotW = W - left - right, plotH = H - top - bottom;
  const xFor = (i) => left + (ratings.length === 1 ? plotW / 2 : (i / (ratings.length - 1)) * plotW);
  const yFor = (v) => top + plotH - ((v - 1) / 4) * plotH;

  let svg = "";
  for (let v = 1; v <= 5; v++) {
    svg += `<line x1="${left}" x2="${W - right}" y1="${yFor(v)}" y2="${yFor(v)}" stroke="#D5DDE3"/>`;
    svg += `<text x="${left - 10}" y="${yFor(v) + 5}" text-anchor="end" font-size="13" fill="#4A5866">${v}</text>`;
  }
  ratings.forEach((r, i) => {
    svg += `<text x="${xFor(i)}" y="${H - bottom + 22}" text-anchor="middle" font-size="12" fill="#4A5866">${shortDate(r.date)}</text>`;
  });
  svg += `<text x="${left + plotW / 2}" y="${H - 6}" text-anchor="middle" font-size="13" fill="#0A1F44">Date of rating</text>`;

  skills.forEach((skill) => {
    const points = ratings.map((r, i) => `${xFor(i)},${yFor(r[skill.key])}`).join(" ");
    svg += `<polyline points="${points}" fill="none" stroke="${skill.color}" stroke-width="2.5"/>`;
    ratings.forEach((r, i) => { svg += markerSVG(skill.shape, xFor(i), yFor(r[skill.key]), skill.color); });
  });

  const summary = skills.map((skill) => {
    const first = ratings[0][skill.key], last = ratings[ratings.length - 1][skill.key];
    return `${skill.label} went from ${first} to ${last}`;
  }).join("; ");

  const legend = skills.map((s) => `
    <li><svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">${markerSVG(s.shape, 10, 10, s.color)}</svg> ${skillLabel(s)}</li>`).join("");

  wrap.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Line chart of skill ratings from 1 to 5 over time. ${summary}.">${svg}</svg>
    <ul class="chart-legend">${legend}</ul>`;

  // Text alternative: the same numbers as a table
  tableWrap.innerHTML = `
    <details>
      <summary>Show skill ratings as a table</summary>
      <div class="table-wrap">
        <table>
          <thead><tr><th scope="col">Date</th>${SKILLS.map((s) => `<th scope="col">${skillLabel(s)}</th>`).join("")}</tr></thead>
          <tbody>${[...ratings].reverse().map((r) => `
            <tr><th scope="row">${shortDate(r.date)}</th>${SKILLS.map((s) => `<td>${r[s.key]}</td>`).join("")}</tr>`).join("")}
          </tbody>
        </table>
      </div>
    </details>`;
}

function drawMinutesChart() {
  const wrap = document.getElementById("minutes-chart");
  const weeks = minutesPerWeek(8);
  const max = Math.max(60, ...weeks.map((w) => w.minutes));

  if (data.sessions.length === 0) {
    wrap.innerHTML = `<div class="empty-state"><p><strong>No sessions logged yet.</strong></p><p>Log a session and you'll see a bar for each week here.</p><a class="btn btn--green btn--small" href="#log-session">Log a session</a></div>`;
    return;
  }

  const W = 600, H = 280, left = 46, right = 10, top = 24, bottom = 50;
  const plotW = W - left - right, plotH = H - top - bottom;
  const barGap = 10;
  const barW = plotW / weeks.length - barGap;
  const niceMax = Math.ceil(max / 60) * 60;

  let svg = "";
  for (let i = 0; i <= 4; i++) {
    const v = (niceMax / 4) * i;
    const y = top + plotH - (v / niceMax) * plotH;
    svg += `<line x1="${left}" x2="${W - right}" y1="${y}" y2="${y}" stroke="#D5DDE3"/>`;
    svg += `<text x="${left - 8}" y="${y + 5}" text-anchor="end" font-size="12" fill="#4A5866">${Math.round(v)}</text>`;
  }
  weeks.forEach((w, i) => {
    const x = left + i * (barW + barGap) + barGap / 2;
    const h = (w.minutes / niceMax) * plotH;
    const y = top + plotH - h;
    svg += `<rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="4" fill="#1565C0"/>`;
    svg += `<text x="${x + barW / 2}" y="${y - 6}" text-anchor="middle" font-size="12" font-weight="700" fill="#0A1F44">${w.minutes}</text>`;
    svg += `<text x="${x + barW / 2}" y="${H - bottom + 20}" text-anchor="middle" font-size="11" fill="#4A5866">${shortDate(w.key)}</text>`;
  });
  svg += `<text x="${left + plotW / 2}" y="${H - 6}" text-anchor="middle" font-size="13" fill="#0A1F44">Week starting (Monday)</text>`;

  const summary = weeks.map((w) => `week of ${shortDate(w.key)}: ${w.minutes} minutes`).join(", ");
  wrap.innerHTML = `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Bar chart of minutes trained per week for the last 8 weeks. ${summary}.">${svg}</svg>`;
}

// ---------------------------------------------------------
// Rendering the dashboard and history
// ---------------------------------------------------------

function skillLabel(skill) {
  if (skill.key !== "positionSkill") return skill.label;
  return POSITION_SKILL_NAMES[data.profile.position] || "Position skill";
}

function renderStats() {
  const stats = getStats();
  document.getElementById("stat-sessions").textContent = stats.totalSessions;
  document.getElementById("stat-minutes").textContent = stats.totalMinutes;
  document.getElementById("stat-streak").textContent = stats.streak;
  document.getElementById("stat-goal").textContent = `${stats.thisWeekCount}/${stats.goal}`;

  const percent = Math.min(100, Math.round((stats.thisWeekCount / stats.goal) * 100));
  const bar = document.getElementById("goal-bar");
  bar.style.width = `${percent}%`;
  bar.parentElement.setAttribute("aria-valuenow", String(percent));
  document.getElementById("goal-text").textContent = stats.thisWeekCount >= stats.goal
    ? `Goal reached this week. Great work! Remember to rest too.`
    : `${stats.goal - stats.thisWeekCount} more session${stats.goal - stats.thisWeekCount === 1 ? "" : "s"} to reach your goal this week.`;

  const name = data.profile.nickname ? `, ${escapeHTML(data.profile.nickname)}` : "";
  document.getElementById("welcome").innerHTML = data.sessions.length
    ? `Welcome back${name}! Here's your progress.`
    : `Welcome${name}! Log your first session to start your dashboard.`;
}

function renderHistory() {
  const wrap = document.getElementById("history-list");
  if (data.sessions.length === 0) {
    wrap.innerHTML = `
      <div class="empty-state">
        <p><strong>Your training history will appear here.</strong></p>
        <p>Example: <em>12 Oct · Technical · 45 min · Effort 6 · "Worked on my weak foot"</em></p>
        <a class="btn btn--green btn--small" href="#log-session">Log your first session</a>
      </div>`;
    return;
  }
  const rows = [...data.sessions]
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
    .map((s) => `
      <tr>
        <td data-label="Date">${shortDate(s.date)} ${parseDate(s.date).getFullYear()}</td>
        <td data-label="Type">${SESSION_TYPES[s.type]}</td>
        <td data-label="Minutes">${s.duration}</td>
        <td data-label="Effort">${s.effort}/10</td>
        <td data-label="Position">${s.position ? POSITIONS[s.position] : "–"}</td>
        <td data-label="Notes">${escapeHTML(s.notes) || "–"}</td>
        <td data-label="Delete"><button type="button" class="btn btn--danger btn--small" data-delete="${s.id}" aria-label="Delete session on ${shortDate(s.date)}">Delete</button></td>
      </tr>`).join("");
  wrap.innerHTML = `
    <div class="table-wrap">
      <table class="history-table">
        <caption class="visually-hidden">Session history, newest first</caption>
        <thead><tr><th scope="col">Date</th><th scope="col">Type</th><th scope="col">Minutes</th><th scope="col">Effort</th><th scope="col">Position</th><th scope="col">Notes</th><th scope="col"><span class="visually-hidden">Actions</span></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <p class="muted">${data.sessions.length} session${data.sessions.length === 1 ? "" : "s"} saved.</p>`;
}

function renderPositionSkillLabel() {
  const label = document.querySelector('label[for="rate-positionSkill"]');
  if (label) label.textContent = `${POSITION_SKILL_NAMES[data.profile.position] || "Position skill"} (your position)`;
  const option = document.querySelector('#skill-choice option[value="positionSkill"]');
  if (option) option.textContent = POSITION_SKILL_NAMES[data.profile.position] || "Position skill";
}


// ---------------------------------------------------------
// Badges (customer engagement): rewards for training often
// ---------------------------------------------------------

function getBadges() {
  const stats = getStats();
  const thisMonth = todayText().slice(0, 7); // e.g. "2026-11"
  const weakFootDays = new Set(
    data.sessions
      .filter((s) => s.date.startsWith(thisMonth) && /weak\s*foot/i.test(s.notes))
      .map((s) => s.date),
  ).size;
  return [
    { name: "First Kick", how: "Log your first session", earned: stats.totalSessions >= 1 },
    { name: "Regular", how: "Log 10 sessions", earned: stats.totalSessions >= 10 },
    { name: "Committed", how: "Log 25 sessions", earned: stats.totalSessions >= 25 },
    { name: "500 Club", how: "Train for 500 minutes in total", earned: stats.totalMinutes >= 500 },
    { name: "On a Roll", how: "Hit your weekly goal 4 weeks in a row", earned: stats.streak >= 4 },
    { name: "Self-Scout", how: "Rate your skills twice", earned: data.ratings.length >= 2 },
    { name: "Two-Footed", how: `Monthly challenge: weak-foot practice on 12 days this month (${weakFootDays}/12)`, earned: weakFootDays >= 12 },
  ];
}

function renderBadges() {
  const wrap = document.getElementById("badges");
  if (!wrap) return;
  const badges = getBadges();
  const earned = badges.filter((b) => b.earned).length;
  document.getElementById("badge-count").textContent = `${earned} of ${badges.length} earned`;
  wrap.innerHTML = badges.map((b) => `
    <li class="badge-tile ${b.earned ? "badge-tile--earned" : ""}">
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r="20" fill="${b.earned ? "#A9DCFA" : "#E7F1FB"}" stroke="${b.earned ? "#0A1F44" : "#8796A3"}" stroke-width="3" ${b.earned ? "" : 'stroke-dasharray="5 4"'}/>
        ${b.earned
          ? '<path d="M15 25l6 6 12-13" fill="none" stroke="#0A1F44" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>'
          : '<rect x="17" y="22" width="14" height="11" rx="2" fill="#8796A3"/><path d="M20 22v-3a4 4 0 0 1 8 0v3" fill="none" stroke="#8796A3" stroke-width="3"/>'}
      </svg>
      <span class="badge-tile__name">${b.name}</span>
      <span class="badge-tile__how">${b.earned ? "Earned!" : escapeHTML(b.how)}</span>
    </li>`).join("");
}

function renderAll() {
  renderStats();
  renderBadges();
  drawSkillChart();
  drawMinutesChart();
  renderHistory();
  renderPositionSkillLabel();
}

// ---------------------------------------------------------
// Building the form controls
// ---------------------------------------------------------

function fillOptions(select, labels, placeholder) {
  select.innerHTML = (placeholder ? `<option value="">${placeholder}</option>` : "") +
    Object.entries(labels).map(([v, l]) => `<option value="${v}">${l}</option>`).join("");
}

function buildRatingFields() {
  const wrap = document.getElementById("rating-fields");
  wrap.innerHTML = SKILLS.map((skill) => `
    <div class="field">
      <label for="rate-${skill.key}">${skill.label}</label>
      <select id="rate-${skill.key}" name="${skill.key}">
        <option value="">Choose 1-5</option>
        ${[1, 2, 3, 4, 5].map((n) => `<option value="${n}">${n}: ${RATING_WORDS[n]}</option>`).join("")}
      </select>
      <span class="field-error" data-error-for="${skill.key}"></span>
    </div>`).join("");

  // Pre-fill with the most recent ratings so updating is quick
  const latest = [...data.ratings].sort((a, b) => b.date.localeCompare(a.date))[0];
  if (latest) SKILLS.forEach((s) => { document.getElementById(`rate-${s.key}`).value = String(latest[s.key]); });

  document.getElementById("skill-choice").innerHTML =
    `<option value="all">All skills</option>` + SKILLS.map((s) => `<option value="${s.key}">${s.label}</option>`).join("");
}

function fillProfileForm() {
  const form = document.getElementById("profile-form");
  form.elements.nickname.value = data.profile.nickname;
  form.elements.position.value = data.profile.position;
  form.elements.level.value = data.profile.level;
  form.elements.weeklyGoal.value = data.profile.weeklyGoal;
}

function updateEffortText() {
  const slider = document.getElementById("session-effort");
  document.getElementById("effort-value").textContent = `${slider.value}: ${EFFORT_WORDS[slider.value]}`;
}

// ---------------------------------------------------------
// Event handlers
// ---------------------------------------------------------

function onSessionSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const result = validateSession(formToObject(form));
  showErrors(form, result.errors);
  if (!result.ok) {
    showMessage("session-message", "Please fix the highlighted boxes.", "error");
    return;
  }
  data.sessions.push(result.value);
  persist();
  renderAll();
  form.reset();
  form.elements.date.value = todayText();
  form.elements.position.value = data.profile.position;
  updateEffortText();
  showMessage("session-message", `Saved! ${result.value.duration} minutes of ${SESSION_TYPES[result.value.type].toLowerCase()} training added.`);
}

function onRatingSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const result = validateRating(formToObject(form));
  showErrors(form, result.errors);
  if (!result.ok) {
    showMessage("rating-message", "Please rate every skill from 1 to 5.", "error");
    return;
  }
  data.ratings.push(result.value);
  persist();
  renderAll();
  showMessage("rating-message", "Ratings saved. Check the chart to see your progress!");
}

function onProfileSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const result = validateProfile(formToObject(form));
  showErrors(form, result.errors);
  if (!result.ok) {
    showMessage("profile-message", "Please fix the highlighted boxes.", "error");
    return;
  }
  data.profile = result.value;
  persist();
  renderAll();
  showMessage("profile-message", "Profile saved.");
}

async function onHistoryClick(event) {
  const button = event.target.closest("[data-delete]");
  if (!button) return;
  const session = data.sessions.find((s) => s.id === button.dataset.delete);
  if (!session) return;
  const ok = await askToConfirm(`Delete the ${SESSION_TYPES[session.type].toLowerCase()} session on ${shortDate(session.date)} (${session.duration} min)? This can't be undone.`, "Delete");
  if (!ok) return;
  data.sessions = data.sessions.filter((s) => s.id !== session.id);
  persist();
  renderAll();
  showMessage("global-message", "Session deleted.");
  document.getElementById("history-heading").focus();
}

function onExport() {
  const filename = `${BRAND.name.toLowerCase()}-tracker-${todayText()}.json`;
  downloadFile(filename, JSON.stringify(data, null, 2));
  showMessage("data-message", `Downloaded ${filename}. Keep it safe as a backup.`);
}

function onImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    let raw;
    try {
      raw = JSON.parse(reader.result);
    } catch (error) {
      showMessage("data-message", "That file isn't a valid tracker backup (it's not JSON).", "error");
      event.target.value = "";
      return;
    }
    const cleaned = cleanImportedData(raw);
    if (!cleaned) {
      showMessage("data-message", `That file isn't a ${BRAND.name} tracker backup (version ${DATA_VERSION}).`, "error");
      event.target.value = "";
      return;
    }
    const ok = await askToConfirm(`Import ${cleaned.data.sessions.length} sessions and ${cleaned.data.ratings.length} ratings? This will REPLACE the data currently on this device.`, "Import");
    if (ok) {
      data = cleaned.data;
      persist();
      fillProfileForm();
      buildRatingFields();
      renderAll();
      const skippedText = cleaned.skipped ? ` ${cleaned.skipped} broken entr${cleaned.skipped === 1 ? "y was" : "ies were"} skipped.` : "";
      showMessage("data-message", `Import complete.${skippedText}`);
    }
    event.target.value = "";
  };
  reader.onerror = () => showMessage("data-message", "Sorry, that file couldn't be read.", "error");
  reader.readAsText(file);
}

async function onReset() {
  const ok = await askToConfirm("This deletes ALL your sessions, ratings and profile from this device. Tip: export a backup first.", "Delete everything");
  if (!ok) return;
  data = emptyData();
  if (storageWorks) removeData(STORAGE_KEY);
  fillProfileForm();
  buildRatingFields();
  renderAll();
  showMessage("data-message", "All tracker data has been deleted.");
}

// ---------------------------------------------------------
// Start
// ---------------------------------------------------------

function start() {
  if (!storageWorks) {
    showMessage("global-message", "Your browser isn't letting this site save data (storage is turned off or you're in a private window). You can still try the tracker, but it will be lost when you close the page.", "warning");
  }

  const sessionForm = document.getElementById("session-form");
  fillOptions(sessionForm.elements.type, SESSION_TYPES, "Choose a type");
  fillOptions(sessionForm.elements.position, POSITIONS, "Any / not sure");
  const profileForm = document.getElementById("profile-form");
  fillOptions(profileForm.elements.position, POSITIONS, "Not chosen");
  fillOptions(profileForm.elements.level, LEVELS, "Not chosen");

  sessionForm.elements.date.value = todayText();
  sessionForm.elements.date.max = todayText();
  document.getElementById("rating-form").elements.date.value = todayText();
  document.getElementById("rating-form").elements.date.max = todayText();

  buildRatingFields();
  fillProfileForm();
  sessionForm.elements.position.value = data.profile.position;

  const effortSlider = document.getElementById("session-effort");
  effortSlider.addEventListener("input", updateEffortText);
  updateEffortText();
  document.getElementById("effort-scale").innerHTML =
    Object.entries(EFFORT_WORDS).map(([n, w]) => `<li><strong>${n}</strong>: ${w}</li>`).join("");

  sessionForm.addEventListener("submit", onSessionSubmit);
  document.getElementById("rating-form").addEventListener("submit", onRatingSubmit);
  profileForm.addEventListener("submit", onProfileSubmit);
  document.getElementById("history-list").addEventListener("click", onHistoryClick);
  document.getElementById("skill-choice").addEventListener("change", drawSkillChart);
  document.getElementById("export-btn").addEventListener("click", onExport);
  document.getElementById("import-file").addEventListener("change", onImport);
  document.getElementById("reset-btn").addEventListener("click", onReset);

  renderAll();
  setUpTabs(document.querySelector("[data-tabs]")); // Overview / Log / Rate / History / Profile tabs
}

start();
