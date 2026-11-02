// =========================================================
// drills.js: builds the Drills page from data/drills.js.
// - Filters: position, level, focus + text search
// - Filters are read from / written to the URL, so links like
//   drills.html?position=winger open already filtered
// - drills.html?drill=wing-01 opens that drill's detail view
// - Clicking a card opens the drill popup from drill-modal.js
// =========================================================

import { DRILLS, POSITION_LABELS, LEVEL_LABELS, FOCUS_LABELS } from "./data/drills.js";
import { openDrillModal } from "./drill-modal.js";
import { escapeHTML } from "./storage.js";

const form = document.getElementById("drill-filters");
const positionSelect = document.getElementById("filter-position");
const levelSelect = document.getElementById("filter-level");
const focusSelect = document.getElementById("filter-focus");
const searchInput = document.getElementById("filter-search");
const clearButton = document.getElementById("clear-filters");
const resultsCount = document.getElementById("results-count");
const resultsGrid = document.getElementById("drill-results");

// ---------- Fill the dropdowns from the data ----------

function fillSelect(select, labels) {
  Object.entries(labels).forEach(([value, label]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    select.appendChild(option);
  });
}

// ---------- URL <-> filters ----------

function readFiltersFromURL() {
  const params = new URLSearchParams(window.location.search);
  const setIfValid = (select, value) => {
    if (value && [...select.options].some((o) => o.value === value)) select.value = value;
  };
  setIfValid(positionSelect, params.get("position"));
  setIfValid(levelSelect, params.get("level"));
  setIfValid(focusSelect, params.get("focus"));
  searchInput.value = params.get("q") || "";
  return params.get("drill");
}

function writeFiltersToURL() {
  const params = new URLSearchParams();
  if (positionSelect.value) params.set("position", positionSelect.value);
  if (levelSelect.value) params.set("level", levelSelect.value);
  if (focusSelect.value) params.set("focus", focusSelect.value);
  if (searchInput.value.trim()) params.set("q", searchInput.value.trim());
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
  const text = searchInput.value.trim();
  return DRILLS.filter((drill) =>
    (!positionSelect.value || drill.position === positionSelect.value) &&
    (!levelSelect.value || drill.level === levelSelect.value) &&
    (!focusSelect.value || drill.focus.includes(focusSelect.value)) &&
    matchesSearch(drill, text));
}

// ---------- Cards ----------

function cardHTML(drill) {
  const focusBadges = drill.focus.map((f) => `<span class="badge">${FOCUS_LABELS[f]}</span>`).join("");
  return `
    <li class="card card--link drill-card">
      <p class="drill-card__meta">
        <span class="badge badge--dark">${POSITION_LABELS[drill.position]}</span>
        <span class="badge badge--${drill.level}">${LEVEL_LABELS[drill.level]}</span>
      </p>
      <h3><button type="button" class="drill-card__button" data-drill="${drill.id}">${escapeHTML(drill.name)}</button></h3>
      <p class="muted">${drill.durationMin} min · ${escapeHTML(drill.players)}</p>
      <p>${focusBadges}</p>
    </li>`;
}

function render() {
  const drills = getFilteredDrills();
  const word = drills.length === 1 ? "drill" : "drills";
  resultsCount.textContent = `Showing ${drills.length} ${word} of ${DRILLS.length}.`;

  if (drills.length === 0) {
    resultsGrid.innerHTML = `
      <li class="no-results card card--yellow">
        <h3>No drills match those filters</h3>
        <p>Try removing a filter or searching for a simpler word like "pass" or "shoot".</p>
        <button type="button" class="btn btn--green" data-clear>Clear filters</button>
      </li>`;
    return;
  }
  resultsGrid.innerHTML = drills.map(cardHTML).join("");
}

// ---------- Events ----------

function onFiltersChanged() {
  writeFiltersToURL();
  render();
}

function clearFilters() {
  form.reset();
  onFiltersChanged();
  positionSelect.focus();
}

function setUpEvents() {
  form.addEventListener("submit", (event) => event.preventDefault());
  [positionSelect, levelSelect, focusSelect].forEach((s) => s.addEventListener("change", onFiltersChanged));
  searchInput.addEventListener("input", onFiltersChanged);
  clearButton.addEventListener("click", clearFilters);

  resultsGrid.addEventListener("click", (event) => {
    if (event.target.closest("[data-clear]")) { clearFilters(); return; }
    const card = event.target.closest(".drill-card");
    if (!card) return;
    const button = card.querySelector("[data-drill]");
    openDrillModal(button.dataset.drill, button); // shared popup (drill-modal.js)
  });
}

// ---------- Start ----------

fillSelect(positionSelect, POSITION_LABELS);
fillSelect(levelSelect, LEVEL_LABELS);
fillSelect(focusSelect, FOCUS_LABELS);
const drillFromURL = readFiltersFromURL();
setUpEvents();
render();
if (drillFromURL) openDrillModal(drillFromURL);
