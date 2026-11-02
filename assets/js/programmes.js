// =========================================================
// programmes.js: the Training Programmes page.
//
// The page works in 3 clear steps, all on ONE page:
//   Step 1: choose a level  (Beginner / Intermediate / Advanced)
//   Step 2: choose a programme (Technical / Game / Physical)
//   Step 3: train: pick a week, open a session, follow it.
// Drills open in a popup and the warm-up / fitness exercises
// open inline, so the player never gets sent to another page.
// "Mark as done" saves the session to the Progress Tracker.
//
// Choices are kept in the URL, e.g.
//   programmes.html?level=beginner&programme=beg-tech&week=2
// =========================================================

import {
  LEVELS, WARM_UP_MIN, COOL_DOWN_MIN, WEEK_BONUS_MIN,
} from "./data/programmes.js";
import { WARM_UP, STRENGTH, SPEED, ENDURANCE, MOBILITY } from "./data/fitness.js";
import { DRILLS, POSITION_LABELS } from "./data/drills.js";
import { openDrillModal, findDrill } from "./drill-modal.js";
import { loadData, saveData, escapeHTML, askToConfirm } from "./storage.js";

const CHECKLIST_KEY = "pitchpath-levelup-v1";
const PROGRESS_KEY = "pitchpath-programme-progress"; // which sessions are done
const TRACKER_KEY = "pitchpath-tracker";             // same key tracker.js uses
const levelKeys = Object.keys(LEVELS);
const SESSION_LETTERS = ["A", "B", "C"];

// What the page is currently showing
const state = { level: "beginner", programmeId: null, week: 1 };

// =========================================================
// Small helpers
// =========================================================

function todayText() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function currentLevel() { return LEVELS[state.level]; }

function currentProgramme() {
  return currentLevel().programmes.find((p) => p.id === state.programmeId);
}

function sessionId(programme, weekIndex, letter) {
  return `${programme.id}-w${weekIndex + 1}-${letter}`;
}

// Minutes for one session in a given week (weekIndex 0-3)
function sessionMinutes(programme, session, weekIndex) {
  const bonus = (programme.weekBonus || WEEK_BONUS_MIN)[weekIndex];
  const activities = session.activities.reduce((sum, a) => sum + a.minutes, 0);
  return WARM_UP_MIN + activities + bonus + COOL_DOWN_MIN;
}

// ---------- Saved progress ----------

function loadProgress() {
  const saved = loadData(PROGRESS_KEY, null);
  if (saved && saved.version === 1 && saved.done) return saved;
  return { version: 1, done: {} };
}

function countDone(programme) {
  const done = loadProgress().done;
  return Object.keys(done).filter((id) => id.startsWith(`${programme.id}-`)).length;
}

function countDoneInWeek(programme, weekIndex) {
  const done = loadProgress().done;
  return SESSION_LETTERS.filter((l) => done[sessionId(programme, weekIndex, l)]).length;
}

// =========================================================
// Inline guides: the warm-up and fitness exercises, shown
// right inside the session instead of on another page
// =========================================================

function warmUpGuideHTML() {
  const steps = WARM_UP.map((s) =>
    `<li><strong>${escapeHTML(s.name)}</strong> (${Math.round(s.seconds / 60 * 10) / 10} min): ${escapeHTML(s.how)}</li>`).join("");
  return `
    <details class="inline-guide">
      <summary>Show the 10-minute warm-up</summary>
      <ol>${steps}</ol>
    </details>`;
}

function fitnessGuideHTML(link) {
  const section = link.split("#")[1];
  const levelLabel = currentLevel().label;
  let inner = "";
  if (section === "strength") {
    const key = state.level;
    inner = `<ul>${STRENGTH.map((ex) => `<li><strong>${escapeHTML(ex.name)}:</strong> ${escapeHTML(ex[key])}. <span class="muted">${escapeHTML(ex.how)}</span></li>`).join("")}</ul>
      <p class="muted">Rest 60 seconds between sets. Perfect form first.</p>`;
  } else if (section === "speed") {
    inner = `<ul>${SPEED.map((s) => `<li><strong>${escapeHTML(s.name)}:</strong> ${escapeHTML(s.how)} <em>Rest: ${escapeHTML(s.rest)}</em></li>`).join("")}</ul>`;
  } else if (section === "endurance") {
    const plan = ENDURANCE.find((e) => e.level === levelLabel) || ENDURANCE[0];
    inner = `<p>${escapeHTML(plan.plan)}</p>`;
  } else if (section === "mobility") {
    inner = `<ul>${MOBILITY.map((m) => `<li><strong>${escapeHTML(m.name)}:</strong> ${escapeHTML(m.how)}</li>`).join("")}</ul>`;
  } else {
    return "";
  }
  return `
    <details class="inline-guide">
      <summary>Show the exercises</summary>
      ${inner}
    </details>`;
}

// =========================================================
// HTML builders
// =========================================================

function activityHTML(activity, minutes) {
  let action = "";
  if (activity.drill && findDrill(activity.drill)) {
    action = `<button type="button" class="btn btn--green btn--small" data-open-drill="${activity.drill}">View drill</button>`;
  } else if (activity.link) {
    action = fitnessGuideHTML(activity.link);
  }
  const how = activity.how ? `<p class="activity__how">${escapeHTML(activity.how)}</p>` : "";
  return `
    <li class="activity">
      <div class="activity__top">
        <span class="activity__name">${escapeHTML(activity.name)}</span>
        <span class="activity__time">${minutes} min</span>
      </div>
      ${how}
      ${action}
    </li>`;
}

function sessionHTML(programme, session, weekIndex, letterIndex, openByDefault) {
  const letter = SESSION_LETTERS[letterIndex];
  const id = sessionId(programme, weekIndex, letter);
  const done = Boolean(loadProgress().done[id]);
  const bonus = (programme.weekBonus || WEEK_BONUS_MIN)[weekIndex];
  const total = sessionMinutes(programme, session, weekIndex);
  const activities = session.activities
    .map((a, i) => activityHTML(a, a.minutes + (i === 0 ? bonus : 0)))
    .join("");
  const doneButton = done
    ? `<p class="session__done-msg"><span class="tick-pop" aria-hidden="true">✓</span> Done and saved in your tracker.</p>
       <button type="button" class="btn btn--outline btn--small" data-undo="${id}">Undo</button>`
    : `<button type="button" class="btn btn--primary" data-done="${id}" data-minutes="${total}" data-label="${escapeHTML(`${currentLevel().label} · ${programme.title} · Week ${weekIndex + 1} Session ${letter}`)}">Mark session as done</button>`;

  return `
    <div class="accordion session ${done ? "session--done" : ""}">
      <h4 class="accordion__heading">
        <button class="accordion__button" type="button" aria-expanded="${openByDefault}" aria-controls="panel-${id}">
          <span class="session__title">
            <span class="session__status" aria-hidden="true">${done ? "✓" : letter}</span>
            <span>Session ${letter}: ${escapeHTML(session.aim)}</span>
          </span>
          <span class="badge">${total} min${done ? " · done" : ""}</span>
        </button>
      </h4>
      <div class="accordion__panel" id="panel-${id}" ${openByDefault ? "" : "hidden"}>
        <ol class="session__steps">
          <li class="session__step">
            <h5>Warm-up <span class="muted">· ${WARM_UP_MIN} min</span></h5>
            <p>Easy jog, leg swings, high knees, lunges, side shuffles and build-up runs.</p>
            ${warmUpGuideHTML()}
          </li>
          <li class="session__step">
            <h5>Main activities</h5>
            <ul class="activity-list">${activities}</ul>
          </li>
          <li class="session__step">
            <h5>Cool-down <span class="muted">· ${COOL_DOWN_MIN} min</span></h5>
            <p>Easy walk or jog, then gentle stretches for calves, thighs, hips and back. Drink water.</p>
          </li>
        </ol>
        <div class="session__footer">${doneButton}</div>
      </div>
    </div>`;
}

function weekPanelHTML(programme, weekIndex) {
  const weekText = programme.weeks[weekIndex];
  const change = weekText.split(":").slice(1).join(":").trim();
  const done = loadProgress().done;
  // Open the first session that isn't done yet
  const firstNotDone = SESSION_LETTERS.findIndex((l) => !done[sessionId(programme, weekIndex, l)]);
  const sessions = programme.sessions
    .map((s, i) => sessionHTML(programme, s, weekIndex, i, i === firstNotDone))
    .join("");
  return `
    <div class="week-panel" id="week-panel-${weekIndex + 1}" role="tabpanel" aria-labelledby="week-tab-${weekIndex + 1}" ${weekIndex + 1 === state.week ? "" : "hidden"}>
      <h4 class="print-only">Week ${weekIndex + 1}</h4>
      <p class="week__change"><strong>This week:</strong> ${escapeHTML(change)}</p>
      ${sessions}
    </div>`;
}

function programmeViewHTML(programme) {
  const total = programme.weeks.length * programme.sessions.length;
  const doneCount = countDone(programme);
  const percent = Math.round((doneCount / total) * 100);
  const weekTabs = programme.weeks.map((_, i) => {
    const weekDone = countDoneInWeek(programme, i);
    const complete = weekDone === programme.sessions.length;
    return `<button type="button" role="tab" class="week-tab ${complete ? "week-tab--complete" : ""}" id="week-tab-${i + 1}"
      aria-controls="week-panel-${i + 1}" aria-selected="${i + 1 === state.week}" tabindex="${i + 1 === state.week ? 0 : -1}" data-week="${i + 1}">
      <span class="week-tab__label">Week ${i + 1}</span>
      <span class="week-tab__count">${complete ? "✓ Complete" : `${weekDone}/${programme.sessions.length} done`}</span>
    </button>`;
  }).join("");

  return `
    <div class="programme-view__header">
      <div>
        <span class="eyebrow">${escapeHTML(currentLevel().label)} · ${escapeHTML(programme.focus)}</span>
        <h3 class="programme-view__title" id="programme-title" tabindex="-1">${escapeHTML(programme.title)}</h3>
        <p>${escapeHTML(programme.summary)}</p>
      </div>
      <div class="programme-progress">
        <p class="programme-progress__text"><strong>${doneCount}</strong> of ${total} sessions done</p>
        <div class="programme-progress__track" role="progressbar" aria-label="Programme progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}">
          <div class="programme-progress__bar" style="width:${percent}%"></div>
        </div>
        <button type="button" class="btn btn--outline btn--small no-print" id="print-plan">Print this programme</button>
      </div>
    </div>
    <div class="week-tabs no-print" role="tablist" aria-label="Weeks">${weekTabs}</div>
    ${programme.weeks.map((_, i) => weekPanelHTML(programme, i)).join("")}
    <p class="muted">Do the 3 sessions on different days, with a rest day in between. Then move to the next week.</p>`;
}

function programmePickerHTML(level) {
  return level.programmes.map((p) => {
    const total = p.weeks.length * p.sessions.length;
    const done = countDone(p);
    const selected = p.id === state.programmeId;
    return `
      <button type="button" class="programme-choice ${selected ? "is-selected" : ""}" data-programme="${p.id}" aria-pressed="${selected}">
        <span class="programme-choice__focus">${escapeHTML(p.focus)}</span>
        <span class="programme-choice__title">${escapeHTML(p.title)}</span>
        <span class="programme-choice__summary">${escapeHTML(p.summary)}</span>
        <span class="programme-choice__meta">4 weeks · 3 sessions a week · ${done}/${total} done</span>
      </button>`;
  }).join("");
}

function positionAddOnsHTML() {
  const cards = Object.entries(POSITION_LABELS).map(([posKey, posLabel]) => {
    const drills = DRILLS.filter((d) => d.position === posKey && d.level === state.level);
    const buttons = drills
      .map((d) => `<li><button type="button" class="link-button" data-open-drill="${d.id}">${escapeHTML(d.name)}</button></li>`)
      .join("");
    return `
      <div class="card card--orange addon" id="addon-${posKey}">
        <h3>${posLabel}</h3>
        <ul>${buttons}</ul>
      </div>`;
  }).join("");
  return `
    <p>Swap one main activity in any session for a drill made for your position.</p>
    <div class="grid grid--5 addons-grid">${cards}</div>`;
}

function checklistHTML(level) {
  const saved = loadData(CHECKLIST_KEY, {});
  const items = level.levelUp.map((item, i) => {
    const id = `check-${state.level}-${i}`;
    return `<li><label><input type="checkbox" id="${id}" data-check ${saved[id] ? "checked" : ""}> ${escapeHTML(item)}</label></li>`;
  }).join("");
  const next = levelKeys[levelKeys.indexOf(state.level) + 1];
  const nextButton = next
    ? `<button type="button" class="btn btn--primary" data-go-level="${next}">Move up to ${LEVELS[next].label}</button>`
    : `<a class="btn btn--primary" href="tracker.html">See your progress</a>`;
  return `
    <p>Tick each one you can honestly do. When they're all ticked, move up a level. Your ticks are saved on this device.</p>
    <ul class="levelup__list">${items}</ul>
    <p class="levelup__count" aria-live="polite"></p>
    ${nextButton}`;
}

// =========================================================
// Rendering
// =========================================================

function renderLevel() {
  const level = currentLevel();
  document.querySelectorAll("#level-tabs [role=tab]").forEach((tab) => {
    const selected = tab.dataset.level === state.level;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  document.getElementById("level-who").textContent = level.who;
  document.getElementById("level-before").innerHTML = level.startHere.map((s) => `<li>${escapeHTML(s)}</li>`).join("");
  document.getElementById("addons").innerHTML = positionAddOnsHTML();
  document.getElementById("levelup").innerHTML = checklistHTML(level);
  document.getElementById("levelup-title").textContent = `Ready to leave ${level.label}?`;
  updateChecklistCount();
  renderProgrammes();
}

function renderProgrammes() {
  document.getElementById("programme-picker").innerHTML = programmePickerHTML(currentLevel());
  const view = document.getElementById("programme-view");
  const programme = currentProgramme();
  if (!programme) {
    view.innerHTML = `
      <div class="empty-state">
        <p><strong>Choose a programme above to see your sessions.</strong></p>
        <p>Not sure? Start with <strong>Technical Skills</strong>. It's the best all-round choice.</p>
      </div>`;
    document.getElementById("step-3").classList.remove("is-active");
    return;
  }
  view.innerHTML = programmeViewHTML(programme);
  document.getElementById("step-3").classList.add("is-active");
}

function updateURL() {
  const url = new URL(window.location);
  url.search = "";
  url.hash = "";
  url.searchParams.set("level", state.level);
  if (state.programmeId) {
    url.searchParams.set("programme", state.programmeId);
    url.searchParams.set("week", String(state.week));
  }
  history.replaceState(null, "", url);
}

function updateChecklistCount() {
  const boxes = document.querySelectorAll("#levelup [data-check]");
  const ticked = [...boxes].filter((b) => b.checked).length;
  const el = document.querySelector("#levelup .levelup__count");
  if (el) {
    el.textContent = ticked === boxes.length
      ? `All ${boxes.length} ticked! You're ready for the next level.`
      : `${ticked} of ${boxes.length} ticked.`;
  }
}

// =========================================================
// Actions
// =========================================================

function chooseLevel(levelKey) {
  state.level = levelKey;
  state.programmeId = null;
  state.week = 1;
  renderLevel();
  updateURL();
}

function chooseProgramme(programmeId) {
  state.programmeId = programmeId;
  state.week = 1;
  // Jump to the first week that isn't complete yet
  const programme = currentProgramme();
  for (let i = 0; i < programme.weeks.length; i++) {
    if (countDoneInWeek(programme, i) < programme.sessions.length) { state.week = i + 1; break; }
  }
  renderProgrammes();
  updateURL();
  const title = document.getElementById("programme-title");
  document.getElementById("step-3").scrollIntoView({ block: "start" });
  if (title) title.focus({ preventScroll: true });
}

function chooseWeek(week) {
  state.week = week;
  document.querySelectorAll(".week-tab").forEach((tab) => {
    const selected = Number(tab.dataset.week) === week;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  document.querySelectorAll(".week-panel").forEach((panel) => {
    panel.hidden = panel.id !== `week-panel-${week}`;
  });
  updateURL();
}

// Saves a finished session in the programme progress AND the tracker
function markDone(button) {
  const id = button.dataset.done;
  const minutes = Number(button.dataset.minutes);
  const programme = currentProgramme();
  const trackerSession = {
    id: `prog-${id}-${Date.now().toString(36)}`,
    date: todayText(),
    type: programme.focus === "Physical Development" ? "fitness" : "technical",
    duration: minutes,
    effort: 6,
    position: "",
    notes: `Programme: ${button.dataset.label}`.slice(0, 300),
  };
  const tracker = loadData(TRACKER_KEY, null) || {
    version: 1, profile: { nickname: "", position: "", level: "", weeklyGoal: 3 }, sessions: [], ratings: [],
  };
  tracker.sessions.push(trackerSession);
  saveData(TRACKER_KEY, tracker);

  const progress = loadProgress();
  progress.done[id] = { date: todayText(), trackerId: trackerSession.id };
  saveData(PROGRESS_KEY, progress);
  rerenderKeepingWeek(id);
}

async function undoDone(id) {
  const ok = await askToConfirm("Mark this session as not done? It will also be removed from your tracker.", "Yes, undo");
  if (!ok) return;
  const progress = loadProgress();
  const entry = progress.done[id];
  delete progress.done[id];
  saveData(PROGRESS_KEY, progress);
  if (entry) {
    const tracker = loadData(TRACKER_KEY, null);
    if (tracker && Array.isArray(tracker.sessions)) {
      tracker.sessions = tracker.sessions.filter((s) => s.id !== entry.trackerId);
      saveData(TRACKER_KEY, tracker);
    }
  }
  rerenderKeepingWeek(id);
}

// Redraw after a change, keep the same week, and keep focus near the session
function rerenderKeepingWeek(id) {
  renderProgrammes();
  const panel = document.getElementById(`panel-${id}`);
  if (panel) {
    panel.hidden = false;
    const button = panel.parentElement.querySelector(".accordion__button");
    button.setAttribute("aria-expanded", "true");
    const focusTarget = panel.querySelector("[data-undo], [data-done]") || button;
    focusTarget.focus();
  }
}

// =========================================================
// Events (one listener for the whole page)
// =========================================================

function setUpEvents() {
  const main = document.getElementById("main");

  main.addEventListener("click", (event) => {
    const target = event.target.closest("button");
    if (!target) return;

    if (target.closest("#level-tabs") && target.dataset.level) chooseLevel(target.dataset.level);
    else if (target.dataset.programme) chooseProgramme(target.dataset.programme);
    else if (target.dataset.week) chooseWeek(Number(target.dataset.week));
    else if (target.dataset.openDrill) openDrillModal(target.dataset.openDrill, target);
    else if (target.dataset.done) markDone(target);
    else if (target.dataset.undo) undoDone(target.dataset.undo);
    else if (target.dataset.goLevel) {
      chooseLevel(target.dataset.goLevel);
      document.getElementById("step-1").scrollIntoView({ block: "start" });
    } else if (target.id === "print-plan") window.print();
    else if (target.classList.contains("accordion__button")) {
      const panel = document.getElementById(target.getAttribute("aria-controls"));
      const isOpen = target.getAttribute("aria-expanded") === "true";
      target.setAttribute("aria-expanded", String(!isOpen));
      panel.hidden = isOpen;
    }
  });

  main.addEventListener("change", (event) => {
    if (!event.target.matches("[data-check]")) return;
    const saved = loadData(CHECKLIST_KEY, {});
    saved[event.target.id] = event.target.checked;
    saveData(CHECKLIST_KEY, saved);
    updateChecklistCount();
  });

  // Arrow keys move between tabs (standard keyboard pattern for tabs)
  main.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const tab = event.target.closest("[role=tab]");
    if (!tab) return;
    const tabs = [...tab.parentElement.querySelectorAll("[role=tab]")];
    const index = tabs.indexOf(tab);
    const next = tabs[(index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
    next.click();
    next.focus();
  });
}

// =========================================================
// Start
// =========================================================

function buildLevelTabs() {
  document.getElementById("level-tabs").innerHTML = levelKeys.map((key) => `
    <button class="tab" role="tab" type="button" id="tab-${key}" data-level="${key}"
      aria-controls="level-info" aria-selected="false">${LEVELS[key].label}</button>`).join("");
}

function readURL() {
  const params = new URLSearchParams(window.location.search);
  const level = params.get("level");
  if (levelKeys.includes(level)) state.level = level;
  const programmeId = params.get("programme");
  if (currentLevel().programmes.some((p) => p.id === programmeId)) {
    state.programmeId = programmeId;
    const week = Number(params.get("week"));
    if (week >= 1 && week <= 4) state.week = week;
  }
}

buildLevelTabs();
readURL();
setUpEvents();
renderLevel();
