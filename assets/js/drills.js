// =========================================================
// drills.js: builds the Drills page from data/drills.js.
// - Filters: position, level, focus + text search
// - Filters are read from / written to the URL, so links like
//   drills.html?position=winger open already filtered
// - drills.html?drill=wing-01 opens that drill's detail view
// - Clicking a card opens a detail popup (<dialog>)
// =========================================================

import { DRILLS, POSITION_LABELS, LEVEL_LABELS, FOCUS_LABELS } from "./data/drills.js";
import { drawDiagram, diagramLegend } from "./diagrams.js";
import { escapeHTML } from "./storage.js";

const form = document.getElementById("drill-filters");
const positionSelect = document.getElementById("filter-position");
const levelSelect = document.getElementById("filter-level");
const focusSelect = document.getElementById("filter-focus");
const searchInput = document.getElementById("filter-search");
const clearButton = document.getElementById("clear-filters");
const resultsCount = document.getElementById("results-count");
const resultsGrid = document.getElementById("drill-results");
const modal = document.getElementById("drill-modal");
const modalTitle = document.getElementById("drill-modal-title");
const modalBody = document.getElementById("drill-modal-body");

let lastFocusedCard = null; // so focus can go back after closing the popup

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

// ---------- Detail popup ----------

function listHTML(items, ordered) {
  const tag = ordered ? "ol" : "ul";
  return `<${tag}>${items.map((i) => `<li>${escapeHTML(i)}</li>`).join("")}</${tag}>`;
}

function detailHTML(drill) {
  const description = `Diagram for ${drill.name}. ${drill.setup}`;
  return `
    <p>
      <span class="badge badge--dark">${POSITION_LABELS[drill.position]}</span>
      <span class="badge badge--${drill.level}">${LEVEL_LABELS[drill.level]}</span>
      ${drill.focus.map((f) => `<span class="badge">${FOCUS_LABELS[f]}</span>`).join("")}
    </p>
    <dl class="drill-facts">
      <div><dt>Duration</dt><dd>${drill.durationMin} min</dd></div>
      <div><dt>Players</dt><dd>${escapeHTML(drill.players)}</dd></div>
      <div><dt>Equipment</dt><dd>${escapeHTML(drill.equipment)}</dd></div>
      <div><dt>Space</dt><dd>${escapeHTML(drill.space)}</dd></div>
    </dl>
    <figure class="drill-diagram">
      ${drawDiagram(drill.diagram, description)}
      <figcaption>${diagramLegend()}</figcaption>
    </figure>
    <h3>Setup</h3>
    <p>${escapeHTML(drill.setup)}</p>
    <h3>Step by step</h3>
    ${listHTML(drill.steps, true)}
    <h3>Coaching points</h3>
    ${listHTML(drill.coachingPoints, false)}
    <div class="grid grid--2 easier-harder">
      <div class="card"><h3>Make it easier</h3><p>${escapeHTML(drill.easier)}</p></div>
      <div class="card card--orange"><h3>Make it harder</h3><p>${escapeHTML(drill.harder)}</p></div>
    </div>
    <p class="notice notice--warning">Always warm up first. Stop if anything hurts and tell your coach or a parent.</p>`;
}

function openDrill(id) {
  const drill = DRILLS.find((d) => d.id === id);
  if (!drill) return;
  modalTitle.textContent = drill.name;
  modalBody.innerHTML = detailHTML(drill);
  if (typeof modal.showModal === "function") modal.showModal();
  else modal.setAttribute("open", ""); // very old browsers
  modal.querySelector(".modal__close").focus();
}

function closeDrill() {
  if (typeof modal.close === "function") modal.close();
  else modal.removeAttribute("open");
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
    lastFocusedCard = button;
    openDrill(button.dataset.drill);
  });

  modal.querySelector(".modal__close").addEventListener("click", closeDrill);
  // Click on the dark background closes the popup
  modal.addEventListener("click", (event) => { if (event.target === modal) closeDrill(); });
  // Escape closes <dialog> automatically. When it closes, put focus back.
  modal.addEventListener("close", () => { if (lastFocusedCard) lastFocusedCard.focus(); });
}

// ---------- Start ----------

fillSelect(positionSelect, POSITION_LABELS);
fillSelect(levelSelect, LEVEL_LABELS);
fillSelect(focusSelect, FOCUS_LABELS);
const drillFromURL = readFiltersFromURL();
setUpEvents();
render();
if (drillFromURL) openDrill(drillFromURL);
