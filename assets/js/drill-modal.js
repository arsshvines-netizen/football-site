// =========================================================
// drill-modal.js: the drill detail popup.
// Shared by the Drills page AND the Programmes page, so a
// player can open a drill without leaving the page they're on.
//
// Use it like this:   openDrillModal("wing-01");
// The popup (<dialog>) is created the first time it's needed.
// =========================================================

import { DRILLS, POSITION_LABELS, LEVEL_LABELS, FOCUS_LABELS } from "./data/drills.js";
import { drawDiagram, diagramLegend } from "./diagrams.js";
import { escapeHTML } from "./storage.js";

let modal = null;
let returnFocusTo = null; // the button that opened the popup

function listHTML(items, ordered) {
  const tag = ordered ? "ol" : "ul";
  return `<${tag}>${items.map((i) => `<li>${escapeHTML(i)}</li>`).join("")}</${tag}>`;
}

export function findDrill(id) {
  return DRILLS.find((d) => d.id === id);
}

// The full drill details as HTML.
export function drillDetailHTML(drill) {
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

// Creates the popup once and adds it to the page.
function createModal() {
  modal = document.createElement("dialog");
  modal.className = "modal";
  modal.id = "drill-modal";
  modal.setAttribute("aria-labelledby", "drill-modal-title");
  modal.innerHTML = `
    <div class="modal__header">
      <h2 id="drill-modal-title">Drill</h2>
      <button type="button" class="modal__close" aria-label="Close drill details">×</button>
    </div>
    <div class="modal__body" id="drill-modal-body"></div>`;
  document.body.appendChild(modal);

  modal.querySelector(".modal__close").addEventListener("click", () => modal.close());
  // Clicking the dark background closes it too
  modal.addEventListener("click", (event) => { if (event.target === modal) modal.close(); });
  // Escape closes <dialog> automatically. Afterwards, put focus back.
  modal.addEventListener("close", () => { if (returnFocusTo) returnFocusTo.focus(); });
}

export function openDrillModal(id, opener) {
  const drill = findDrill(id);
  if (!drill) return;
  if (!modal) createModal();
  returnFocusTo = opener || document.activeElement;
  modal.querySelector("#drill-modal-title").textContent = drill.name;
  const body = modal.querySelector("#drill-modal-body");
  body.innerHTML = drillDetailHTML(drill);
  body.scrollTop = 0;
  modal.showModal();
  modal.querySelector(".modal__close").focus();
}
