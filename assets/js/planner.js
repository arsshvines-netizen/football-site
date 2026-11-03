// =========================================================
// planner.js: the Weekly Planner (a PLUS feature).
//
// Layout (one thing at a time, so it stays easy to use):
//   1. Week summary: a ring showing how much is done + 3 numbers
//   2. Week strip: 7 day buttons (dots show what's planned)
//   3. The chosen day: its plan on the left, "Add" buttons on the right
//
// One tap adds a Programme session, a Match or a Rest day.
// Drill, Fitness and "My own" open a small popup to choose.
// Each item can be ticked, given more or fewer minutes, or removed.
// Everyone without Plus sees a locked preview and "Get Plus".
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

// The kinds of things you can add.
// quick: added straight away with one tap (no popup)
const TYPES = {
  programme: { label: "Programme", icon: "📋", hint: "45 min session",   minutes: 45, quick: true },
  drill:     { label: "Drill",     icon: "⚽", hint: "Pick a drill",     minutes: 15 },
  fitness:   { label: "Fitness",   icon: "⚡", hint: "Speed, strength…", minutes: 20 },
  match:     { label: "Match",     icon: "🏟️", hint: "Game day",         minutes: 60, quick: true },
  own:       { label: "My own",    icon: "✏️", hint: "Type anything",    minutes: 30 },
  rest:      { label: "Rest day",  icon: "😴", hint: "Recover",          minutes: 0,  quick: true },
};

// Fitness choices link to the matching tab on the Fitness page
const FITNESS = {
  "warm-up":   "Warm-up",
  speed:       "Speed and agility",
  strength:    "Bodyweight strength",
  endurance:   "Stamina",
  recovery:    "Recovery and mobility",
};

// A ready-made balanced week: 3 programme sessions with a rest day
// in between, a match, and 3 rest days (Programmes page advice:
// "3 sessions a week with a rest day in between").
const STARTER_WEEK = {
  mon: ["programme"], tue: ["rest"], wed: ["programme"], thu: ["rest"],
  fri: ["programme"], sat: ["match"], sun: ["rest"],
};
const QUICK_TITLES = { programme: "Programme session", match: "Match", rest: "Rest day" };

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

let idCounter = 0;
function newItem(type, title, minutes, ref = "") {
  idCounter += 1;
  return { id: `${Date.now().toString(36)}${idCounter}`, type, title, minutes, ref, done: false };
}

// ---------- Dates (labels for this week) ----------

// Monday = 0 ... Sunday = 6 (JavaScript's getDay() starts on Sunday)
const todayIndex = (new Date().getDay() + 6) % 7;
const monday = new Date();
monday.setDate(monday.getDate() - todayIndex);
function dateOf(index) {
  const d = new Date(monday);
  d.setDate(monday.getDate() + index);
  return d;
}
const fmt = (d, opts) => d.toLocaleDateString("en-GB", opts);

let selected = DAYS[todayIndex][0]; // which day is open

// ---------- Small helpers ----------

const dayName = (key) => DAYS.find(([k]) => k === key)[1];
const dayIndex = (key) => DAYS.findIndex(([k]) => k === key);
const isTraining = (item) => item.type !== "rest";
const minutesOf = (items) => items.filter(isTraining).reduce((sum, item) => sum + (item.minutes || 0), 0);
const isRestDay = (items) => items.length === 0 || items.some((item) => item.type === "rest");

// Screen readers hear what just changed
function announce(text) {
  const live = document.getElementById("pl-announce");
  if (live) live.textContent = text;
}

// ---------- Locked view (not Plus) ----------

function lockedHTML() {
  const sample = [["Mon", "📋"], ["Tue", "😴"], ["Wed", "📋 ⚽"], ["Thu", "😴"], ["Fri", "📋"], ["Sat", "🏟️"], ["Sun", "😴"]];
  return `
    <div class="planner-locked">
      <div class="planner-locked__preview" aria-hidden="true">
        ${sample.map(([day, icons]) => `<div class="planner-locked__day"><strong>${day}</strong><span>${icons}</span></div>`).join("")}
      </div>
      <div class="planner-locked__card">
        <p class="plus-popup__badge">★ PITCHPATH PLUS</p>
        <h2>Unlock the Weekly Planner</h2>
        <p>Build your whole training week in one place, and tick things off as you go.</p>
        <ul class="plus-perks">
          <li><span aria-hidden="true">🗓️</span> Weekly Planner</li>
          <li><span aria-hidden="true">⚽</span> All 35 drills, with diagrams</li>
          <li><span aria-hidden="true">💬</span> Food Helper chat</li>
          <li><span aria-hidden="true">★</span> Plus member badge</li>
        </ul>
        <a class="btn btn--gold btn--big btn--arrow" href="${GET_PLUS_HREF}">Get Plus · ${plusPriceText()}</a>
      </div>
    </div>`;
}

// ---------- 1. Summary ----------

function ringHTML(done, total) {
  const r = 34, c = 2 * Math.PI * r;
  const part = total ? done / total : 0;
  return `
    <svg class="pl-ring" viewBox="0 0 84 84" aria-hidden="true">
      <circle cx="42" cy="42" r="${r}" fill="none" stroke="#1B2D40" stroke-width="10"/>
      <circle class="pl-ring__bar" cx="42" cy="42" r="${r}" fill="none" stroke="#FFC857" stroke-width="10" stroke-linecap="round"
        stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (1 - part)).toFixed(1)}" transform="rotate(-90 42 42)"/>
    </svg>`;
}

function summaryHTML() {
  const all = DAYS.flatMap(([key]) => week.days[key]);
  const training = all.filter(isTraining);
  const done = training.filter((item) => item.done).length;
  const restDays = DAYS.filter(([key]) => isRestDay(week.days[key])).length;
  const message = training.length === 0
    ? { cls: "", text: "Your week is empty. Pick a day below, or tap “Ready-made week”." }
    : restDays === 0
      ? { cls: "is-warning", text: "⚠ No rest day yet. Keep 1-2 rest days a week so your body can recover." }
      : { cls: "is-good", text: `✓ Good balance: ${restDays} rest day${restDays === 1 ? "" : "s"} this week.` };
  return `
    <div class="pl-summary">
      <div class="pl-summary__ring">
        ${ringHTML(done, training.length)}
        <span class="pl-summary__ringtext"><strong>${done}/${training.length}</strong><span>done</span></span>
      </div>
      <dl class="pl-stats">
        <div><dt>Sessions</dt><dd>${training.length}</dd></div>
        <div><dt>Minutes</dt><dd>${minutesOf(all)}</dd></div>
        <div><dt>Rest days</dt><dd>${restDays}</dd></div>
      </dl>
      <p class="pl-summary__msg ${message.cls}">${message.text}</p>
    </div>`;
}

// ---------- 2. Week strip ----------

function weekStripHTML() {
  return DAYS.map(([key, name], i) => {
    const items = week.days[key];
    const training = items.filter(isTraining);
    const date = dateOf(i);
    const rest = training.length === 0 && items.some((item) => item.type === "rest");
    const dots = training.slice(0, 4).map((item) => `<span class="pl-dot pl-dot--${item.type} ${item.done ? "is-done" : ""}"></span>`).join("");
    const status = rest ? "rest day" : training.length ? `${training.length} planned` : "nothing planned";
    return `
      <button type="button" class="pl-daybtn ${i === todayIndex ? "is-today" : ""}" data-day="${key}" aria-pressed="${key === selected}"
        aria-label="${name} ${fmt(date, { day: "numeric", month: "long" })}${i === todayIndex ? ", today" : ""}: ${status}">
        <span class="pl-daybtn__name">${name.slice(0, 3)}</span>
        <span class="pl-daybtn__date">${date.getDate()}</span>
        <span class="pl-daybtn__dots">${rest ? '<span class="pl-daybtn__rest">😴</span>' : dots || '<span class="pl-dot pl-dot--empty"></span>'}</span>
        <span class="pl-daybtn__min">${minutesOf(items) ? `${minutesOf(items)} min` : "&nbsp;"}</span>
      </button>`;
  }).join("");
}

// ---------- 3. The chosen day ----------

function itemHTML(item) {
  const type = TYPES[item.type] || TYPES.own;
  const title = escapeHTML(item.title);
  // Drills open their popup; fitness and programme link to their pages
  let titleHTML = `<span class="pl-item__title">${title}</span>`;
  if (item.type === "drill" && item.ref) titleHTML = `<button type="button" class="pl-item__title pl-item__link" data-open-drill="${escapeHTML(item.ref)}">${title}</button>`;
  if (item.type === "fitness" && item.ref) titleHTML = `<a class="pl-item__title pl-item__link" href="fitness.html#${escapeHTML(item.ref)}">${title}</a>`;
  if (item.type === "programme") titleHTML = `<a class="pl-item__title pl-item__link" href="programmes.html">${title}</a>`;
  const minutes = item.type === "rest" ? "" : `
    <div class="pl-mins" role="group" aria-label="Minutes for ${title}">
      <button type="button" class="pl-mins__btn" data-less="${item.id}" aria-label="5 minutes less" ${item.minutes <= 5 ? "disabled" : ""}>−</button>
      <span class="pl-mins__value">${item.minutes} min</span>
      <button type="button" class="pl-mins__btn" data-more="${item.id}" aria-label="5 minutes more" ${item.minutes >= 120 ? "disabled" : ""}>+</button>
    </div>`;
  const tick = item.type === "rest"
    ? `<span class="pl-check pl-check--rest" aria-hidden="true">😴</span>`
    : `<button type="button" class="pl-check" data-tick="${item.id}" aria-pressed="${item.done}" aria-label="Done: ${title}">${item.done ? "✓" : ""}</button>`;
  return `
    <li class="pl-item pl-item--${item.type} ${item.done ? "is-done" : ""}">
      ${tick}
      <div class="pl-item__body">
        ${item.type === "rest"
          ? `${titleHTML}<span class="pl-item__type">Recover and recharge</span>`
          : `<span class="pl-item__type"><span aria-hidden="true">${type.icon}</span> ${type.label}</span>${titleHTML}`}
      </div>
      ${minutes}
      <button type="button" class="pl-remove" data-remove="${item.id}" aria-label="Remove ${title}">✕</button>
    </li>`;
}

function dayPanelHTML() {
  const i = dayIndex(selected);
  const name = dayName(selected);
  const items = week.days[selected];
  const training = items.filter(isTraining);
  const sub = items.length === 0 ? "Nothing planned yet"
    : training.length === 0 ? "Rest day"
    : `${training.length} thing${training.length === 1 ? "" : "s"} · ${minutesOf(items)} min`;
  const list = items.length
    ? `<ul class="pl-items">${items.map(itemHTML).join("")}</ul>`
    : `<div class="pl-empty"><span aria-hidden="true">🗓️</span><p>Nothing on ${name} yet.<br>Add something, or keep it as a rest day.</p></div>`;
  const tiles = Object.entries(TYPES).map(([key, type]) => `
    <button type="button" class="pl-tile pl-tile--${key}" data-add-type="${key}">
      <span class="pl-tile__icon" aria-hidden="true">${type.icon}</span>
      <span class="pl-tile__label">${type.label}</span>
      <span class="pl-tile__hint">${type.hint}</span>
    </button>`).join("");
  return `
    <section class="pl-day" aria-labelledby="pl-day-title">
      <div class="pl-day__main">
        <header class="pl-day__head">
          <button type="button" class="pl-arrow" data-step-day="-1" aria-label="Previous day" ${i === 0 ? "disabled" : ""}>‹</button>
          <div class="pl-day__name">
            <h3 id="pl-day-title" class="pl-day__title" tabindex="-1">${name}${i === todayIndex ? ' <span class="pl-today">Today</span>' : ""}</h3>
            <p class="pl-day__sub">${fmt(dateOf(i), { day: "numeric", month: "long" })} · ${sub}</p>
          </div>
          <button type="button" class="pl-arrow" data-step-day="1" aria-label="Next day" ${i === 6 ? "disabled" : ""}>›</button>
        </header>
        ${list}
      </div>
      <div class="pl-add">
        <h4 class="pl-add__title">Add to ${name}</h4>
        <div class="pl-add__grid">${tiles}</div>
      </div>
    </section>`;
}

// ---------- The whole planner ----------

function plannerHTML() {
  const range = `${fmt(dateOf(0), { day: "numeric", month: "short" })} – ${fmt(dateOf(6), { day: "numeric", month: "short" })}`;
  return `
    <div class="pl">
      <div class="pl-top">
        <div>
          <p class="pl-top__kicker"><span class="plus-tag">★ PLUS</span> ${range}</p>
          <h2 class="pl-top__title">Your week</h2>
        </div>
        <div class="pl-actions">
          <button type="button" class="pl-action pl-action--main" data-starter><span aria-hidden="true">✨</span> Ready-made week</button>
          <button type="button" class="pl-action" data-new-week><span aria-hidden="true">↺</span> Untick all</button>
          <button type="button" class="pl-action" data-print><span aria-hidden="true">🖨️</span> Print</button>
          <button type="button" class="pl-action" data-clear-week><span aria-hidden="true">🗑️</span> Clear</button>
        </div>
      </div>
      <div id="pl-summary">${summaryHTML()}</div>
      <div class="pl-week" id="pl-week" role="group" aria-label="Choose a day">${weekStripHTML()}</div>
      <div id="pl-day">${dayPanelHTML()}</div>
      <div class="pl-print" id="pl-print">${printHTML()}</div>
      <p class="visually-hidden" id="pl-announce" aria-live="polite"></p>
      <p class="pl-note">Saved on this device only. Don't type your name or other personal details. If you also train with a club, plan fewer sessions.</p>
    </div>`;
}

// A plain list of the whole week, only shown when printing
function printHTML() {
  return DAYS.map(([key, name], i) => {
    const items = week.days[key];
    const lines = items.length
      ? items.map((item) => `<li>${item.done ? "☑" : "☐"} ${escapeHTML(item.title)}${item.minutes ? ` (${item.minutes} min)` : ""}</li>`).join("")
      : "<li>Rest day</li>";
    return `<h3>${name} ${fmt(dateOf(i), { day: "numeric", month: "short" })}</h3><ul>${lines}</ul>`;
  }).join("");
}

// Redraw the parts that change (the popup is separate and stays).
// focusSelector: where keyboard focus should go afterwards.
function redraw(focusSelector) {
  document.getElementById("pl-summary").innerHTML = summaryHTML();
  document.getElementById("pl-week").innerHTML = weekStripHTML();
  document.getElementById("pl-day").innerHTML = dayPanelHTML();
  document.getElementById("pl-print").innerHTML = printHTML();
  if (!focusSelector) return;
  const target = app.querySelector(focusSelector);
  if (target && !target.disabled) target.focus();
  else app.querySelector("#pl-day-title").focus();
}

// ---------- The small "choose" popup (drill, fitness, my own) ----------

let dialog = null;
let dialogType = null;

function createDialog() {
  dialog = document.createElement("dialog");
  dialog.className = "modal pl-dialog";
  dialog.setAttribute("aria-labelledby", "pl-dialog-title");
  const drillOptions = Object.entries(POSITION_LABELS).map(([position, label]) => `
    <optgroup label="${label}">
      ${DRILLS.filter((d) => d.position === position).map((d) => `<option value="${d.id}">${escapeHTML(d.name)}${d.plus ? " ★" : ""}</option>`).join("")}
    </optgroup>`).join("");
  const fitnessOptions = Object.entries(FITNESS).map(([key, label], i) => `
    <label class="pl-choice"><input type="radio" name="pl-fitness" value="${key}" ${i === 0 ? "checked" : ""}><span>${label}</span></label>`).join("");
  dialog.innerHTML = `
    <form class="pl-form" id="pl-form" novalidate>
      <div class="modal__header">
        <h2 id="pl-dialog-title"></h2>
        <button type="button" class="modal__close" data-close aria-label="Close">✕</button>
      </div>
      <div class="modal__body pl-form__body">
        <div class="field" data-for="drill">
          <label for="pl-drill">Which drill?</label>
          <select id="pl-drill">${drillOptions}</select>
        </div>
        <fieldset class="pl-choices" data-for="fitness">
          <legend>Which kind of fitness?</legend>
          ${fitnessOptions}
        </fieldset>
        <div class="field" data-for="own">
          <label for="pl-text">What is it?</label>
          <input type="text" id="pl-text" maxlength="40" placeholder="e.g. Juggling practice">
          <p class="hint">Up to 40 letters. No names or personal details.</p>
        </div>
        <div class="field">
          <label for="pl-minutes">How many minutes?</label>
          <input type="number" id="pl-minutes" min="5" max="120" step="5" inputmode="numeric">
        </div>
        <p class="field-error" id="pl-error" aria-live="polite"></p>
        <div class="btn-row">
          <button type="submit" class="btn btn--gold">Add it</button>
          <button type="button" class="btn btn--outline" data-close>Cancel</button>
        </div>
      </div>
    </form>`;
  document.body.appendChild(dialog);

  dialog.addEventListener("click", (event) => {
    if (event.target.closest("[data-close]") || event.target === dialog) dialog.close();
  });
  dialog.querySelector("#pl-drill").addEventListener("change", (event) => {
    const drill = DRILLS.find((d) => d.id === event.target.value);
    dialog.querySelector("#pl-minutes").value = drill.durationMin;
  });
  dialog.querySelector("#pl-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const error = addFromDialog();
    if (error) { dialog.querySelector("#pl-error").textContent = error; return; }
    dialog.close();
  });
  // Put focus back on the tile that opened the popup
  dialog.addEventListener("close", () => app.querySelector(`[data-add-type="${dialogType}"]`)?.focus());
}

function openDialog(type) {
  if (!dialog) createDialog();
  dialogType = type;
  dialog.querySelector("#pl-form").reset();
  dialog.querySelectorAll("[data-for]").forEach((el) => { el.hidden = el.dataset.for !== type; });
  const what = type === "own" ? "your own activity" : `a ${TYPES[type].label.toLowerCase()}`;
  dialog.querySelector("#pl-dialog-title").textContent = `Add ${what} to ${dayName(selected)}`;
  const drill = DRILLS.find((d) => d.id === dialog.querySelector("#pl-drill").value);
  dialog.querySelector("#pl-minutes").value = type === "drill" && drill ? drill.durationMin : TYPES[type].minutes;
  dialog.querySelector("#pl-error").textContent = "";
  dialog.showModal();
  const first = { drill: "#pl-drill", fitness: 'input[name="pl-fitness"]:checked', own: "#pl-text" }[type];
  dialog.querySelector(first).focus();
}

function addFromDialog() {
  const minutes = Math.round(Number(dialog.querySelector("#pl-minutes").value));
  let title = "";
  let ref = "";
  if (dialogType === "drill") {
    ref = dialog.querySelector("#pl-drill").value;
    title = DRILLS.find((d) => d.id === ref).name;
  } else if (dialogType === "fitness") {
    ref = dialog.querySelector('input[name="pl-fitness"]:checked').value;
    title = FITNESS[ref];
  } else {
    title = dialog.querySelector("#pl-text").value.trim();
    if (!title) return "Type what the activity is.";
  }
  if (!minutes || minutes < 5 || minutes > 120) return "Choose between 5 and 120 minutes.";
  addItem(newItem(dialogType, title, minutes, ref));
  return "";
}

// ---------- Changing the week ----------

function addItem(item) {
  // Adding training to a rest day turns it into a training day
  week.days[selected] = week.days[selected].filter((i) => i.type !== "rest");
  week.days[selected].push(item);
  saveWeek();
  redraw();
  announce(`Added ${item.title} to ${dayName(selected)}.`);
}

async function quickAdd(type, tile) {
  if (type !== "rest") {
    addItem(newItem(type, QUICK_TITLES[type], TYPES[type].minutes));
    tile.focus();
    return;
  }
  const items = week.days[selected];
  if (items.some((i) => i.type === "rest")) { announce(`${dayName(selected)} is already a rest day.`); return; }
  // A rest day replaces what was planned that day, so ask first
  if (items.length && !(await askToConfirm(`Make ${dayName(selected)} a rest day? This removes what's planned that day.`, "Yes, rest day"))) return;
  week.days[selected] = [newItem("rest", "Rest day", 0)];
  saveWeek();
  redraw('[data-add-type="rest"]');
  announce(`${dayName(selected)} is now a rest day.`);
}

function findItem(id) {
  return week.days[selected].find((item) => item.id === id);
}

async function useStarterWeek() {
  const hasPlans = DAYS.some(([key]) => week.days[key].length);
  if (hasPlans && !(await askToConfirm("Replace your week with the ready-made week?", "Yes, replace it"))) return;
  week = emptyWeek();
  Object.entries(STARTER_WEEK).forEach(([day, types]) => {
    week.days[day] = types.map((type) => newItem(type, QUICK_TITLES[type], TYPES[type].minutes));
  });
  saveWeek();
  redraw("[data-starter]");
  announce("Ready-made week added: 3 programme sessions, a match and 3 rest days.");
}

// ---------- Events ----------

function setUpEvents() {
  app.addEventListener("click", async (event) => {
    const t = event.target;

    const day = t.closest("[data-day]");
    if (day) { selected = day.dataset.day; redraw(`[data-day="${selected}"]`); return; }

    const step = t.closest("[data-step-day]");
    if (step) {
      const next = DAYS[dayIndex(selected) + Number(step.dataset.stepDay)];
      if (next) { selected = next[0]; redraw(`[data-step-day="${step.dataset.stepDay}"]`); }
      return;
    }

    const add = t.closest("[data-add-type]");
    if (add) {
      const type = add.dataset.addType;
      if (TYPES[type].quick) quickAdd(type, add); else openDialog(type);
      return;
    }

    const tick = t.closest("[data-tick]");
    if (tick) {
      const item = findItem(tick.dataset.tick);
      item.done = !item.done;
      saveWeek();
      redraw(`[data-tick="${item.id}"]`);
      announce(item.done ? `${item.title}: done. Nice work!` : `${item.title}: not done.`);
      return;
    }

    const less = t.closest("[data-less]");
    const more = t.closest("[data-more]");
    if (less || more) {
      const item = findItem((less || more).dataset[less ? "less" : "more"]);
      item.minutes = Math.min(120, Math.max(5, item.minutes + (less ? -5 : 5)));
      saveWeek();
      redraw(less ? `[data-less="${item.id}"]` : `[data-more="${item.id}"]`);
      announce(`${item.title}: ${item.minutes} minutes.`);
      return;
    }

    const remove = t.closest("[data-remove]");
    if (remove) {
      const item = findItem(remove.dataset.remove);
      week.days[selected] = week.days[selected].filter((i) => i.id !== item.id);
      saveWeek();
      redraw("#pl-day-title");
      announce(`Removed ${item.title}.`);
      return;
    }

    const drill = t.closest("[data-open-drill]");
    if (drill) { openDrillModal(drill.dataset.openDrill, drill); return; }

    if (t.closest("[data-starter]")) { useStarterWeek(); return; }
    if (t.closest("[data-print]")) { window.print(); return; }
    if (t.closest("[data-new-week]")) {
      DAYS.forEach(([key]) => week.days[key].forEach((item) => { item.done = false; }));
      saveWeek();
      redraw("[data-new-week]");
      announce("Everything unticked for a new week.");
      return;
    }
    if (t.closest("[data-clear-week]")) {
      if (await askToConfirm("Remove everything from your week?", "Yes, clear it")) {
        week = emptyWeek();
        saveWeek();
        redraw("[data-clear-week]");
        announce("Your week is cleared.");
      }
    }
  });

  // Left and right arrow keys move between days in the week strip
  app.addEventListener("keydown", (event) => {
    const day = event.target.closest("[data-day]");
    if (!day || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let i = dayIndex(day.dataset.day);
    if (event.key === "ArrowLeft") i = Math.max(0, i - 1);
    if (event.key === "ArrowRight") i = Math.min(6, i + 1);
    if (event.key === "Home") i = 0;
    if (event.key === "End") i = 6;
    selected = DAYS[i][0];
    redraw(`[data-day="${selected}"]`);
  });
}

// ---------- Start ----------

if (isPlus()) {
  app.innerHTML = plannerHTML();
  setUpEvents();
} else {
  app.innerHTML = lockedHTML();
}
