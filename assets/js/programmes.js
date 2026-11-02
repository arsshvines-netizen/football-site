// =========================================================
// programmes.js: builds the Training Programmes page from
// data/programmes.js. Handles the level tabs (remembered in
// the URL, e.g. ?level=beginner), the session accordions,
// the level-up checklist and the print button.
// =========================================================

import {
  LEVELS, WARM_UP_MIN, COOL_DOWN_MIN, WEEK_BONUS_MIN, WARM_UP_TEXT, COOL_DOWN_TEXT,
} from "./data/programmes.js";
import { DRILLS, POSITION_LABELS } from "./data/drills.js";
import { loadData, saveData, escapeHTML } from "./storage.js";

const CHECKLIST_KEY = "pitchpath-levelup-v1";
const levelKeys = Object.keys(LEVELS);

// ---------- Helpers ----------

function getLevelFromURL() {
  const level = new URLSearchParams(window.location.search).get("level");
  return levelKeys.includes(level) ? level : "beginner";
}

function findDrill(id) {
  return DRILLS.find((drill) => drill.id === id);
}

// Total minutes for one session in a given week (weekIndex 0-3).
function sessionMinutes(session, weekBonus) {
  const activityTotal = session.activities.reduce((sum, a) => sum + a.minutes, 0);
  return WARM_UP_MIN + activityTotal + weekBonus + COOL_DOWN_MIN;
}

// ---------- Building the HTML ----------

function activityHTML(activity, bonus) {
  const minutes = activity.minutes + bonus;
  let title = escapeHTML(activity.name);
  if (activity.drill && findDrill(activity.drill)) {
    title = `<a href="drills.html?drill=${activity.drill}">${title}</a> <span class="muted">(drill)</span>`;
  } else if (activity.link) {
    title = `<a href="${activity.link}">${title}</a>`;
  }
  const how = activity.how ? `<br><span class="muted">${escapeHTML(activity.how)}</span>` : "";
  return `<li><strong>${title}</strong> · ${minutes} min${how}</li>`;
}

function sessionHTML(session, letter, weekIndex, programme) {
  const bonusList = programme.weekBonus || WEEK_BONUS_MIN;
  const bonus = bonusList[weekIndex];
  const total = sessionMinutes(session, bonus);
  const panelId = `${programme.id}-w${weekIndex + 1}-${letter}`;
  const activities = session.activities
    .map((activity, i) => activityHTML(activity, i === 0 ? bonus : 0))
    .join("");
  return `
    <div class="accordion">
      <h5 class="accordion__heading">
        <button class="accordion__button" type="button" aria-expanded="false" aria-controls="${panelId}">
          <span>Session ${letter}: ${escapeHTML(session.aim)} <span class="badge">${total} min</span></span>
        </button>
      </h5>
      <div class="accordion__panel" id="${panelId}" hidden>
        <p><strong>Aim:</strong> ${escapeHTML(session.aim)}</p>
        <p><strong>Total time:</strong> about ${total} minutes</p>
        <h6>1. Warm-up</h6>
        <p>${WARM_UP_TEXT} <a href="fitness.html#warm-up">See the warm-up</a></p>
        <h6>2. Main activities</h6>
        <ol>${activities}</ol>
        <h6>3. Cool-down</h6>
        <p>${COOL_DOWN_TEXT}</p>
      </div>
    </div>`;
}

function programmeHTML(programme) {
  const weeks = programme.weeks.map((weekText, weekIndex) => {
    const sessions = programme.sessions
      .map((session, i) => sessionHTML(session, ["A", "B", "C"][i], weekIndex, programme))
      .join("");
    return `
      <div class="week">
        <h4>${escapeHTML(weekText.split(":")[0])}</h4>
        <p class="week__change"><strong>What changes:</strong> ${escapeHTML(weekText.split(":").slice(1).join(":").trim())}</p>
        ${sessions}
      </div>`;
  }).join("");

  return `
    <article class="programme" id="${programme.id}">
      <div class="programme__header">
        <span class="eyebrow">${escapeHTML(programme.focus)}</span>
        <h3>${escapeHTML(programme.title)}</h3>
        <p>${escapeHTML(programme.summary)}</p>
        <p class="muted">4 weeks · 3 sessions per week · Rest at least one day between sessions.</p>
      </div>
      <details class="progression">
        <summary>How this programme gets harder week by week</summary>
        <ol>${programme.weeks.map((w) => `<li>${escapeHTML(w)}</li>`).join("")}</ol>
      </details>
      ${weeks}
    </article>`;
}

function positionAddOnsHTML(levelKey) {
  const cards = Object.entries(POSITION_LABELS).map(([posKey, posLabel]) => {
    const drills = DRILLS.filter((d) => d.position === posKey && d.level === levelKey);
    const list = drills
      .map((d) => `<li><a href="drills.html?drill=${d.id}">${escapeHTML(d.name)}</a></li>`)
      .join("");
    return `
      <div class="card card--orange" id="addon-${posKey}">
        <h4>${posLabel} add-on</h4>
        <p class="muted">Swap one main activity per session for one of these ${posLabel.toLowerCase()} drills:</p>
        <ul>${list}</ul>
        <a class="btn btn--outline btn--small" href="drills.html?position=${posKey}&level=${levelKey}">All ${posLabel.toLowerCase()} drills</a>
      </div>`;
  }).join("");
  return `
    <section class="section--tight" aria-labelledby="addons-${levelKey}">
      <h3 id="addons-${levelKey}">Position add-ons: train for your position</h3>
      <p>Pick your position. Use these drills to make any programme above fit your role.</p>
      <div class="grid grid--3">${cards}</div>
    </section>`;
}

function checklistHTML(levelKey, level, savedTicks) {
  const items = level.levelUp.map((item, i) => {
    const id = `check-${levelKey}-${i}`;
    const checked = savedTicks[id] ? "checked" : "";
    return `<li><label><input type="checkbox" id="${id}" data-check ${checked}> ${escapeHTML(item)}</label></li>`;
  }).join("");
  const nextLevel = levelKeys[levelKeys.indexOf(levelKey) + 1];
  const nextBtn = nextLevel
    ? `<a class="btn btn--primary" href="programmes.html?level=${nextLevel}" data-level-link="${nextLevel}">Go to ${LEVELS[nextLevel].label}</a>`
    : `<a class="btn btn--primary" href="tracker.html">Track your progress</a>`;
  return `
    <section class="levelup" aria-labelledby="levelup-${levelKey}">
      <h3 id="levelup-${levelKey}">Ready to level up?</h3>
      <p>Tick each one you can honestly do. When you can tick them all, move up a level. Your ticks are saved on this device.</p>
      <ul class="levelup__list">${items}</ul>
      <p class="levelup__count" aria-live="polite"></p>
      ${nextBtn}
    </section>`;
}

function levelPanelHTML(levelKey) {
  const level = LEVELS[levelKey];
  const savedTicks = loadData(CHECKLIST_KEY, {});
  return `
    <div class="level-intro grid grid--2">
      <div class="card card--navy">
        <h3>Who is ${level.label} for?</h3>
        <p>${escapeHTML(level.who)}</p>
      </div>
      <div class="card card--yellow">
        <h3>Before you start</h3>
        <ul class="check-list">${level.startHere.map((s) => `<li>${escapeHTML(s)}</li>`).join("")}</ul>
      </div>
    </div>
    <p class="notice">Pick <strong>one</strong> programme to follow for 4 weeks, or mix sessions from all three (no more than 3 sessions per week on top of club training). Always keep at least 1-2 full rest days a week.</p>
    <nav class="programme-jump" aria-label="Jump to a programme">
      ${level.programmes.map((p) => `<a class="btn btn--outline btn--small" href="#${p.id}">${escapeHTML(p.focus)}</a>`).join("")}
      <a class="btn btn--outline btn--small" href="#addons-${levelKey}">Position add-ons</a>
    </nav>
    ${level.programmes.map(programmeHTML).join("")}
    ${positionAddOnsHTML(levelKey)}
    ${checklistHTML(levelKey, level, savedTicks)}`;
}

// ---------- Behaviour ----------

function setUpAccordions(container) {
  container.querySelectorAll(".accordion__button").forEach((button) => {
    button.addEventListener("click", () => {
      const panel = document.getElementById(button.getAttribute("aria-controls"));
      const isOpen = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!isOpen));
      panel.hidden = isOpen;
    });
  });
}

function updateChecklistCount(container) {
  const boxes = container.querySelectorAll("[data-check]");
  const ticked = [...boxes].filter((b) => b.checked).length;
  const countEl = container.querySelector(".levelup__count");
  if (!countEl) return;
  countEl.textContent = ticked === boxes.length
    ? `All ${boxes.length} ticked! You're ready for the next level.`
    : `${ticked} of ${boxes.length} ticked.`;
}

function setUpChecklist(container) {
  container.querySelectorAll("[data-check]").forEach((box) => {
    box.addEventListener("change", () => {
      const saved = loadData(CHECKLIST_KEY, {});
      saved[box.id] = box.checked;
      saveData(CHECKLIST_KEY, saved);
      updateChecklistCount(container);
    });
  });
  updateChecklistCount(container);
}

function showLevel(levelKey, updateURL) {
  const panel = document.getElementById("level-panel");
  panel.innerHTML = levelPanelHTML(levelKey);
  panel.setAttribute("aria-labelledby", `tab-${levelKey}`);

  document.querySelectorAll("[role=tab]").forEach((tab) => {
    const selected = tab.dataset.level === levelKey;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });

  if (updateURL) {
    const url = new URL(window.location);
    url.searchParams.set("level", levelKey);
    url.hash = "";
    history.replaceState(null, "", url);
  }

  setUpAccordions(panel);
  setUpChecklist(panel);

  // The "Go to next level" button switches tab without reloading.
  panel.querySelectorAll("[data-level-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      showLevel(link.dataset.levelLink, true);
      document.getElementById("levels").scrollIntoView();
    });
  });
}

function buildTabs() {
  const tabList = document.getElementById("level-tabs");
  tabList.innerHTML = levelKeys.map((key) => `
    <button class="tab" role="tab" type="button" id="tab-${key}" data-level="${key}"
      aria-controls="level-panel" aria-selected="false">${LEVELS[key].label}</button>`).join("");

  tabList.addEventListener("click", (event) => {
    const tab = event.target.closest("[role=tab]");
    if (tab) showLevel(tab.dataset.level, true);
  });

  // Arrow keys move between tabs (standard tab keyboard pattern).
  tabList.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const tabs = [...tabList.querySelectorAll("[role=tab]")];
    const current = tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
    const step = event.key === "ArrowRight" ? 1 : -1;
    const next = tabs[(current + step + tabs.length) % tabs.length];
    showLevel(next.dataset.level, true);
    next.focus();
  });
}

function setUpPrintButton() {
  const button = document.getElementById("print-plan");
  if (button) button.addEventListener("click", () => window.print());
}

buildTabs();
showLevel(getLevelFromURL(), false);
setUpPrintButton();

// If the page was opened with a #programme link, scroll to it.
if (window.location.hash) {
  const target = document.querySelector(window.location.hash);
  if (target) target.scrollIntoView();
}
