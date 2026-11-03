// =========================================================
// planner.js: the Weekly Planner (a PLUS feature).
//
// Plus members get a board with 7 days (Mon-Sun). On each day
// they can add: a drill, a programme session, fitness, a match,
// a rest day or their own activity. They can tick things off,
// remove them, print the week and start a fresh week.
// Everyone else sees a locked preview and a "Get Plus" button.
//
// Saved in localStorage only (key: pitchpath-planner):
//   { days: { mon: [ { id, type, title, minutes, ref, done } ], ... } }
// =========================================================

import { DRILLS, POSITION_LABELS } from "./data/drills.js";
import { loadData, saveData, escapeHTML, askToConfirm } from "./storage.js";
import { isPlus, GET_PLUS_HREF, plusPriceText } from "./plus.js";
import { openDrillModal } from "./drill-modal.js";

const PLANNER_KEY = "pitchpath-planner";
const app = document.getElementById("planner-app");

const DAYS = [
  ["mon", "Monday"], ["tue", "Tuesday"], ["wed", "Wednesday"], ["thu", "Thursday"],
  ["fri", "Friday"], ["sat", "Saturday"], ["sun", "Sunday"],
];

// The kinds of things you can add. "ask" says what the form asks for.
const TYPES = {
  drill:     { label: "Drill",             icon: "⚽", ask: "drill",   minutes: 15 },
  programme: { label: "Programme session", icon: "📋", ask: "none",    minutes: 45 },
  fitness:   { label: "Fitness",           icon: "⚡", ask: "fitness", minutes: 20 },
  match:     { label: "Match",             icon: "🏟️", ask: "none",    minutes: 60 },
  rest:      { label: "Rest day",          icon: "😴", ask: "none",    minutes: 0 },
  own:       { label: "My own activity",   icon: "✏️", ask: "text",    minutes: 30 },
};

// Fitness choices link to the matching tab on the Fitness page
const FITNESS = {
  "warm-up":   "Warm-up",
  speed:       "Speed and agility",
  strength:    "Bodyweight strength",
  endurance:   "Stamina",
  recovery:    "Recovery and mobility",
};

// ---------- Saving ----------

function emptyWeek() {
  return { days: Object.fromEntries(DAYS.map(([key]) => [key, []])) };
}

function loadWeek() {
  const saved = loadData(PLANNER_KEY, null);
  if (!saved || !saved.days) return emptyWeek();
  DAYS.forEach(([key]) => { if (!Array.isArray(saved.days[key])) saved.days[key] = []; });
  return saved;
}

let week = loadWeek();
function saveWeek() { saveData(PLANNER_KEY, week); }

// Monday = 0 ... Sunday = 6 (JavaScript's getDay() starts on Sunday)
function todayKey() { return DAYS[(new Date().getDay() + 6) % 7][0]; }

// ---------- Locked view (not Plus) ----------

function lockedHTML() {
  // A pretend week, blurred behind the "Get Plus" card
  const sample = [["Mon", "⚽ Gate Dribbling"], ["Tue", "😴 Rest day"], ["Wed", "📋 Programme session"],
    ["Thu", "⚡ Speed and agility"], ["Fri", "😴 Rest day"], ["Sat", "🏟️ Match"], ["Sun", "⚽ Shooting drill"]];
  return `
    <div class="planner-locked">
      <div class="planner-locked__preview" aria-hidden="true">
        ${sample.map(([day, item]) => `<div class="planner-locked__day"><strong>${day}</strong><span>${item}</span></div>`).join("")}
      </div>
      <div class="planner-locked__card">
        <p class="plus-popup__badge">★ PITCHPATH PLUS</p>
        <h2>Unlock the Weekly Planner</h2>
        <p>Build your whole training week in one place, and tick things off as you go.</p>
        <ul class="plus-perks">
          <li><span aria-hidden="true">🗓️</span> Weekly Planner</li>
          <li><span aria-hidden="true">⚽</span> 10 extra Plus drills</li>
          <li><span aria-hidden="true">★</span> Plus member badge</li>
        </ul>
        <a class="btn btn--gold btn--big btn--arrow" href="${GET_PLUS_HREF}">Get Plus · ${plusPriceText()}</a>
      </div>
    </div>`;
}

// ---------- The planner (Plus) ----------

function itemHTML(dayKey, item) {
  const type = TYPES[item.type] || TYPES.own;
  const minutes = item.minutes ? `<span class="plan-item__min">${item.minutes} min</span>` : "";
  // Drills open their popup; fitness links to the right Fitness tab
  let title = escapeHTML(item.title);
  if (item.type === "drill" && item.ref) title = `<button type="button" class="plan-item__link" data-open-drill="${escapeHTML(item.ref)}">${title}</button>`;
  if (item.type === "fitness" && item.ref) title = `<a class="plan-item__link" href="fitness.html#${escapeHTML(item.ref)}">${title}</a>`;
  if (item.type === "programme") title = `<a class="plan-item__link" href="programmes.html">${title}</a>`;
  return `
    <li class="plan-item plan-item--${item.type} ${item.done ? "is-done" : ""}">
      <button type="button" class="plan-item__tick" data-tick="${dayKey}:${item.id}" aria-pressed="${item.done}"
        aria-label="${item.done ? "Done" : "Mark as done"}: ${escapeHTML(item.title)}">${item.done ? "✓" : ""}</button>
      <span class="plan-item__icon" aria-hidden="true">${type.icon}</span>
      <span class="plan-item__text">${title}${minutes}</span>
      <button type="button" class="plan-item__remove" data-remove="${dayKey}:${item.id}" aria-label="Remove ${escapeHTML(item.title)}">✕</button>
    </li>`;
}

function dayHTML([key, name]) {
  const items = week.days[key];
  const minutes = items.reduce((sum, item) => sum + (item.minutes || 0), 0);
  const isToday = key === todayKey();
  return `
    <section class="plan-day ${isToday ? "is-today" : ""}" aria-labelledby="day-${key}">
      <header class="plan-day__head">
        <h2 id="day-${key}" class="plan-day__name">${name}${isToday ? ' <span class="plan-day__today">Today</span>' : ""}</h2>
        <span class="plan-day__min">${minutes ? `${minutes} min` : ""}</span>
      </header>
      <ul class="plan-day__items">${items.map((item) => itemHTML(key, item)).join("") || '<li class="plan-day__empty">Nothing planned</li>'}</ul>
      <button type="button" class="plan-day__add" data-add="${key}" aria-label="Add to ${name}">+ Add</button>
    </section>`;
}

function summaryHTML() {
  const all = DAYS.flatMap(([key]) => week.days[key]);
  const training = all.filter((item) => item.type !== "rest");
  const minutes = training.reduce((sum, item) => sum + (item.minutes || 0), 0);
  // A rest day = a day marked "Rest day", or a day with nothing planned
  const restDays = DAYS.filter(([key]) => {
    const items = week.days[key];
    return items.length === 0 || items.some((item) => item.type === "rest");
  }).length;
  const done = training.filter((item) => item.done).length;
  return `
    <div class="planner-summary">
      <div class="planner-stat"><span class="planner-stat__value">${training.length}</span><span class="planner-stat__label">things planned</span></div>
      <div class="planner-stat"><span class="planner-stat__value">${minutes}</span><span class="planner-stat__label">minutes</span></div>
      <div class="planner-stat"><span class="planner-stat__value">${restDays}</span><span class="planner-stat__label">rest days</span></div>
      <div class="planner-stat"><span class="planner-stat__value">${done}/${training.length}</span><span class="planner-stat__label">done</span></div>
    </div>
    ${restDays === 0 ? '<p class="notice notice--warning">Your week has no rest day. Keep 1-2 rest days a week so your body can recover.</p>' : ""}`;
}

function plannerHTML() {
  return `
    <div class="planner">
      <div class="planner-top">
        <p class="planner-top__hello"><span class="plus-tag">★ PLUS</span> Your week</p>
        <div class="planner-top__actions">
          <button type="button" class="btn btn--outline btn--small" data-new-week>New week: untick all</button>
          <button type="button" class="btn btn--outline btn--small" data-print>Print my week</button>
          <button type="button" class="btn btn--outline btn--small" data-clear-week>Clear week</button>
        </div>
      </div>
      <div id="planner-summary">${summaryHTML()}</div>
      <div class="planner-board">${DAYS.map(dayHTML).join("")}</div>
      <p class="muted planner-note">Saved on this device only. Don't type your name or other personal details.</p>
    </div>
    ${addDialogHTML()}`;
}

// ---------- The "Add" popup ----------

function drillOptionsHTML() {
  return Object.entries(POSITION_LABELS).map(([position, label]) => `
    <optgroup label="${label}">
      ${DRILLS.filter((d) => d.position === position).map((d) =>
        `<option value="${d.id}">${escapeHTML(d.name)}${d.plus ? " ★" : ""}</option>`).join("")}
    </optgroup>`).join("");
}

function addDialogHTML() {
  const typeChoices = Object.entries(TYPES).map(([key, type], i) => `
    <label class="type-choice">
      <input type="radio" name="type" value="${key}" ${i === 0 ? "checked" : ""}>
      <span><span aria-hidden="true">${type.icon}</span> ${type.label}</span>
    </label>`).join("");
  return `
    <dialog class="modal planner-dialog" id="add-dialog" aria-labelledby="add-title">
      <form method="dialog" class="planner-form" id="add-form" novalidate>
        <div class="modal__header">
          <h2 id="add-title">Add to <span id="add-day-name"></span></h2>
          <button type="button" class="modal__close" data-close-add aria-label="Close">✕</button>
        </div>
        <div class="modal__body planner-form__body">
        <fieldset class="type-choices">
          <legend>What do you want to add?</legend>
          ${typeChoices}
        </fieldset>
        <div class="field" data-for="drill">
          <label for="add-drill">Drill</label>
          <select id="add-drill">${drillOptionsHTML()}</select>
        </div>
        <div class="field" data-for="fitness" hidden>
          <label for="add-fitness">Fitness</label>
          <select id="add-fitness">${Object.entries(FITNESS).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select>
        </div>
        <div class="field" data-for="text" hidden>
          <label for="add-text">What is it?</label>
          <input type="text" id="add-text" maxlength="40" placeholder="e.g. Juggling practice">
          <p class="hint">Up to 40 letters. No names or personal details.</p>
        </div>
        <div class="field" data-for="minutes">
          <label for="add-minutes">Minutes</label>
          <input type="number" id="add-minutes" min="5" max="120" step="5" value="15" inputmode="numeric">
        </div>
        <p class="field-error" id="add-error" aria-live="polite"></p>
        <div class="btn-row">
          <button type="submit" class="btn btn--gold" value="add">Add it</button>
          <button type="button" class="btn btn--outline" data-close-add>Cancel</button>
        </div>
        </div>
      </form>
    </dialog>`;
}

let addingTo = null;    // which day the popup is adding to
let addOpener = null;   // the button that opened it (focus goes back there)

function chosenType() { return app.querySelector('#add-form input[name="type"]:checked').value; }

// Show only the boxes that matter for the chosen type
function updateAddForm(setMinutes = true) {
  const type = TYPES[chosenType()];
  app.querySelectorAll("#add-form [data-for]").forEach((field) => {
    const need = field.dataset.for;
    field.hidden = need === "minutes" ? type.minutes === 0 : need !== type.ask;
  });
  if (setMinutes) {
    const drill = DRILLS.find((d) => d.id === app.querySelector("#add-drill").value);
    app.querySelector("#add-minutes").value = chosenType() === "drill" && drill ? drill.durationMin : type.minutes;
  }
  app.querySelector("#add-error").textContent = "";
}

function openAdd(dayKey, opener) {
  addingTo = dayKey;
  addOpener = opener;
  const dialog = app.querySelector("#add-dialog");
  dialog.querySelector("#add-day-name").textContent = DAYS.find(([k]) => k === dayKey)[1];
  dialog.querySelector("#add-form").reset();
  updateAddForm();
  dialog.showModal();
  dialog.querySelector('input[name="type"]:checked').focus();
}

function addItem() {
  const typeKey = chosenType();
  const type = TYPES[typeKey];
  const minutesBox = app.querySelector("#add-minutes");
  const minutes = type.minutes === 0 ? 0 : Math.round(Number(minutesBox.value));
  let title = type.label;
  let ref = "";

  if (typeKey === "drill") {
    ref = app.querySelector("#add-drill").value;
    title = DRILLS.find((d) => d.id === ref).name;
  } else if (typeKey === "fitness") {
    ref = app.querySelector("#add-fitness").value;
    title = FITNESS[ref];
  } else if (typeKey === "own") {
    title = app.querySelector("#add-text").value.trim();
    if (!title) return "Type what the activity is.";
  }
  if (type.minutes !== 0 && (!minutes || minutes < 5 || minutes > 120)) return "Pick between 5 and 120 minutes.";

  week.days[addingTo].push({ id: Date.now().toString(36), type: typeKey, title, minutes, ref, done: false });
  saveWeek();
  return "";
}

// ---------- Drawing + events ----------

function redraw(focusSelector) {
  app.querySelector("#planner-summary").innerHTML = summaryHTML();
  app.querySelector(".planner-board").innerHTML = DAYS.map(dayHTML).join("");
  if (focusSelector) app.querySelector(focusSelector)?.focus();
}

function findItem(code) {
  const [dayKey, id] = code.split(":");
  return { dayKey, index: week.days[dayKey].findIndex((item) => item.id === id) };
}

function setUpEvents() {
  app.addEventListener("click", async (event) => {
    const target = event.target;
    const add = target.closest("[data-add]");
    if (add) { openAdd(add.dataset.add, add); return; }

    const tick = target.closest("[data-tick]");
    if (tick) {
      const { dayKey, index } = findItem(tick.dataset.tick);
      week.days[dayKey][index].done = !week.days[dayKey][index].done;
      saveWeek();
      redraw(`[data-tick="${tick.dataset.tick}"]`);
      return;
    }

    const remove = target.closest("[data-remove]");
    if (remove) {
      const { dayKey, index } = findItem(remove.dataset.remove);
      week.days[dayKey].splice(index, 1);
      saveWeek();
      redraw(`[data-add="${dayKey}"]`);
      return;
    }

    const drill = target.closest("[data-open-drill]");
    if (drill) { openDrillModal(drill.dataset.openDrill, drill); return; }

    if (target.closest("[data-close-add]")) { app.querySelector("#add-dialog").close(); return; }
    if (target.closest("[data-print]")) { window.print(); return; }

    if (target.closest("[data-new-week]")) {
      DAYS.forEach(([key]) => week.days[key].forEach((item) => { item.done = false; }));
      saveWeek();
      redraw();
      return;
    }

    if (target.closest("[data-clear-week]")) {
      if (await askToConfirm("Remove everything from your week?", "Yes, clear it")) {
        week = emptyWeek();
        saveWeek();
        redraw();
      }
    }
  });

  const form = app.querySelector("#add-form");
  form.addEventListener("change", (event) => {
    if (event.target.name === "type" || event.target.id === "add-drill") updateAddForm();
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const error = addItem();
    if (error) { app.querySelector("#add-error").textContent = error; return; }
    app.querySelector("#add-dialog").close();
    redraw();
  });
  // When the popup closes, put focus back on the day's "+ Add" button
  app.querySelector("#add-dialog").addEventListener("close", () => {
    const button = app.querySelector(`[data-add="${addingTo}"]`) || addOpener;
    if (button) button.focus();
  });
}

// ---------- Start ----------

if (isPlus()) {
  app.innerHTML = plannerHTML();
  setUpEvents();
} else {
  app.innerHTML = lockedHTML();
}
