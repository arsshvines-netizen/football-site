// =========================================================
// drills.js: the Drills page, built from data/drills.js.
// - Position chips (+ "Saved"), a level switch, focus + search
// - Filters are read from / written to the URL, so links like
//   drills.html?position=winger open already filtered
// - drills.html?drill=wing-01 opens that drill straight away
// - Cards show a small diagram; 12 at a time ("Show more")
// - "Drill of the day" changes every day
// - ♥ saves a drill on this device (favourites.js)
// =========================================================

import { DRILLS, POSITION_LABELS, LEVEL_LABELS, FOCUS_LABELS } from "./data/drills.js";
import { openDrillModal } from "./drill-modal.js";
import { drawDiagram } from "./diagrams.js";
import { getSaved, toggleSaved, saveButtonHTML } from "./favourites.js";
import { escapeHTML } from "./storage.js";

const PAGE_SIZE = 12;
const POSITION_ICONS = { "": "⚽", goalkeeper: "🧤", defender: "🛡️", midfielder: "🧭", winger: "💨", striker: "🎯", saved: "♥" };

const form = document.getElementById("drill-filters");
const chipRow = document.getElementById("position-chips");
const levelSwitch = document.getElementById("level-switch");
const focusSelect = document.getElementById("filter-focus");
const searchInput = document.getElementById("filter-search");
const clearButton = document.getElementById("clear-filters");
const resultsCount = document.getElementById("results-count");
const resultsGrid = document.getElementById("drill-results");
const showMoreButton = document.getElementById("show-more");

// What the filters are set to right now
const filters = { position: "", level: "", focus: "", q: "" };
let shown = PAGE_SIZE; // how many cards are on screen

// ---------- Building the filter controls ----------

function buildChips() {
  const chips = [["", "All"], ...Object.entries(POSITION_LABELS), ["saved", "Saved"]];
  chipRow.innerHTML = chips.map(([value, label]) => `
    <button type="button" class="chip" data-position="${value}" aria-pressed="false">
      <span class="chip__icon" aria-hidden="true">${POSITION_ICONS[value]}</span>${label}
    </button>`).join("");
}

function buildFocusOptions() {
  Object.entries(FOCUS_LABELS).forEach(([value, label]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    focusSelect.appendChild(option);
  });
}

// Make the buttons and boxes match the filters
function showFilterState() {
  chipRow.querySelectorAll(".chip").forEach((chip) => {
    chip.setAttribute("aria-pressed", String(chip.dataset.position === filters.position));
  });
  levelSwitch.querySelectorAll("button").forEach((b) => {
    b.setAttribute("aria-pressed", String(b.dataset.value === filters.level));
  });
  focusSelect.value = filters.focus;
  searchInput.value = filters.q;
  updateClearButton();
}

// "Clear filters" only shows when a filter is switched on
function updateClearButton() {
  const anyFilter = filters.position || filters.level || filters.focus || filters.q.trim();
  clearButton.hidden = !anyFilter;
}

// ---------- URL <-> filters ----------

function readFiltersFromURL() {
  const params = new URLSearchParams(window.location.search);
  const position = params.get("position") || "";
  if (position === "saved" || POSITION_LABELS[position]) filters.position = position;
  if (LEVEL_LABELS[params.get("level")]) filters.level = params.get("level");
  if (FOCUS_LABELS[params.get("focus")]) filters.focus = params.get("focus");
  filters.q = params.get("q") || "";
  return params.get("drill");
}

function writeFiltersToURL() {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); });
  const query = params.toString();
  history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
}

// ---------- Filtering ----------

function matchesSearch(drill, text) {
  if (!text) return true;
  const haystack = [
    drill.name, drill.setup, drill.equipment, POSITION_LABELS[drill.position],
    ...drill.focus.map((f) => FOCUS_LABELS[f]), ...drill.steps, ...drill.coachingPoints,
  ].join(" ").toLowerCase();
  return haystack.includes(text.toLowerCase());
}

function getFilteredDrills() {
  const saved = getSaved();
  return DRILLS.filter((drill) =>
    (!filters.position ||
      (filters.position === "saved" ? saved.includes(drill.id) : drill.position === filters.position)) &&
    (!filters.level || drill.level === filters.level) &&
    (!filters.focus || drill.focus.includes(filters.focus)) &&
    matchesSearch(drill, filters.q.trim()));
}

// ---------- Cards ----------

function cardHTML(drill) {
  return `
    <li class="drill-card">
      <div class="drill-card__thumb" aria-hidden="true">${drawDiagram(drill.diagram, drill.name)}</div>
      ${saveButtonHTML(drill.id, drill.name)}
      <div class="drill-card__body">
        <p class="drill-card__meta">
          <span class="badge badge--dark">${POSITION_LABELS[drill.position]}</span>
          <span class="badge badge--${drill.level}">${LEVEL_LABELS[drill.level]}</span>
        </p>
        <h3><button type="button" class="drill-card__button" data-drill="${drill.id}">${escapeHTML(drill.name)}</button></h3>
        <p class="drill-card__facts">⏱ ${drill.durationMin} min · 👥 ${escapeHTML(drill.players)}</p>
      </div>
    </li>`;
}

function render() {
  const drills = getFilteredDrills();
  const word = drills.length === 1 ? "drill" : "drills";
  resultsCount.textContent = `${drills.length} ${word}`;

  if (drills.length === 0) {
    const savedEmpty = filters.position === "saved" && getSaved().length === 0;
    resultsGrid.innerHTML = `
      <li class="no-results card card--yellow">
        <h3>${savedEmpty ? "No saved drills yet" : "No drills match those filters"}</h3>
        <p>${savedEmpty ? "Tap the ♥ on any drill to save it here." : 'Try removing a filter or searching for a simpler word like "pass" or "shoot".'}</p>
        <button type="button" class="btn btn--green" data-clear>Show all drills</button>
      </li>`;
    showMoreButton.hidden = true;
    return;
  }
  resultsGrid.innerHTML = drills.slice(0, shown).map(cardHTML).join("");
  const left = drills.length - shown;
  showMoreButton.hidden = left <= 0;
  showMoreButton.textContent = `Show more drills (${left} more)`;
}

// ---------- Drill of the day ----------

function buildDrillOfTheDay() {
  const dayNumber = Math.floor(Date.now() / 86400000); // changes every day
  const drill = DRILLS[dayNumber % DRILLS.length];
  document.getElementById("drill-of-the-day").innerHTML = `
    <div class="daily__thumb" aria-hidden="true">${drawDiagram(drill.diagram, drill.name)}</div>
    <div class="daily__text">
      <p class="daily__label">⭐ Drill of the day</p>
      <h2 class="daily__name">${escapeHTML(drill.name)}</h2>
      <p class="daily__meta">${POSITION_LABELS[drill.position]} · ${LEVEL_LABELS[drill.level]} · ${drill.durationMin} min</p>
    </div>
    <button type="button" class="btn btn--primary btn--arrow" data-drill="${drill.id}">Try it</button>`;
}

// ---------- Events ----------

function onFiltersChanged() {
  shown = PAGE_SIZE;
  writeFiltersToURL();
  showFilterState();
  render();
}

function clearFilters() {
  Object.assign(filters, { position: "", level: "", focus: "", q: "" });
  onFiltersChanged();
}

function setUpEvents() {
  form.addEventListener("submit", (event) => event.preventDefault());
  chipRow.addEventListener("click", (event) => {
    const chip = event.target.closest(".chip");
    if (!chip) return;
    filters.position = chip.dataset.position;
    onFiltersChanged();
  });
  levelSwitch.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    filters.level = button.dataset.value;
    onFiltersChanged();
  });
  focusSelect.addEventListener("change", () => { filters.focus = focusSelect.value; onFiltersChanged(); });
  searchInput.addEventListener("input", () => {
    filters.q = searchInput.value;
    shown = PAGE_SIZE;
    writeFiltersToURL();
    updateClearButton();
    render();
  });
  clearButton.addEventListener("click", clearFilters);
  showMoreButton.addEventListener("click", () => {
    const firstNew = shown;
    shown += PAGE_SIZE;
    render();
    // Move keyboard focus to the first new drill
    const newCard = resultsGrid.querySelectorAll(".drill-card__button")[firstNew];
    if (newCard) newCard.focus();
  });

  // Clicks on the cards (and the drill of the day)
  document.getElementById("main").addEventListener("click", (event) => {
    const saveBtn = event.target.closest("[data-save]");
    if (saveBtn) { toggleSaved(saveBtn.dataset.save); return; }
    if (event.target.closest("[data-clear]")) { clearFilters(); return; }
    const opener = event.target.closest("[data-drill]") ||
      event.target.closest(".drill-card")?.querySelector("[data-drill]");
    if (opener) openDrillModal(opener.dataset.drill, opener);
  });

  // When a drill is saved or unsaved (here or in the popup), update every ♥
  document.addEventListener("saved-drills-changed", (event) => {
    document.querySelectorAll(`[data-save="${event.detail.id}"]`).forEach((b) => b.setAttribute("aria-pressed", String(event.detail.saved)));
    if (filters.position === "saved") render();
  });
}

// ---------- Start ----------

buildChips();
buildFocusOptions();
const drillFromURL = readFiltersFromURL();
buildDrillOfTheDay();
setUpEvents();
showFilterState();
render();
if (drillFromURL) openDrillModal(drillFromURL);
