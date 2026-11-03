// =========================================================
// drill-modal.js: the drill detail popup.
// Shared by the Drills page AND the Programmes page, so a
// player can open a drill without leaving the page they're on.
//
// Use it like this:   openDrillModal("wing-01");
// The popup (<dialog>) is created the first time it's needed.
// =========================================================

import { DRILLS, POSITION_LABELS, LEVEL_LABELS, FOCUS_LABELS } from "./data/drills.js";
import { isPlus, openPlusPopup } from "./plus.js";
import { drawDiagram, diagramLegend } from "./diagrams.js";
import { escapeHTML } from "./storage.js";
import { saveButtonHTML, toggleSaved } from "./favourites.js";
import { DRILL_VIDEOS } from "./data/videos.js";
import { videoHTML, pauseVideos } from "./video.js";

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
    ${videoHTML(DRILL_VIDEOS[drill.id], `Watch: ${drill.name}`)}
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
      <span class="modal__actions">
        <button type="button" class="modal__copy" id="drill-copy" aria-label="Copy a link to this drill">🔗<span class="modal__copy-text">Copy link</span></button>
        <span id="drill-modal-save"></span>
        <button type="button" class="modal__close" aria-label="Close drill details">×</button>
      </span>
    </div>
    <div class="modal__body" id="drill-modal-body"></div>`;
  document.body.appendChild(modal);

  modal.querySelector(".modal__close").addEventListener("click", () => modal.close());
  // The ♥ button saves the drill on this device
  modal.addEventListener("click", (event) => {
    const saveBtn = event.target.closest("[data-save]");
    if (saveBtn) saveBtn.setAttribute("aria-pressed", String(toggleSaved(saveBtn.dataset.save)));
  });
  // "Copy link": copies a link that opens this drill straight away
  modal.querySelector("#drill-copy").addEventListener("click", async (event) => {
    const button = event.currentTarget;
    const label = button.querySelector(".modal__copy-text");
    const link = new URL(`drills.html?drill=${button.dataset.id}`, window.location.href).href;
    try {
      await navigator.clipboard.writeText(link);
      label.textContent = "Copied!";
    } catch (error) {
      label.textContent = link; // can't copy here: show the link so it can be copied by hand
    }
    setTimeout(() => { label.textContent = "Copy link"; }, 2500);
  });
  // Clicking the dark background closes it too
  modal.addEventListener("click", (event) => { if (event.target === modal) modal.close(); });
  // Escape closes <dialog> automatically. Afterwards, put focus back.
  modal.addEventListener("close", () => {
    pauseVideos(modal); // stop a drill video when the popup closes
    if (returnFocusTo) returnFocusTo.focus();
  });
}

export function openDrillModal(id, opener) {
  const drill = findDrill(id);
  if (!drill) return;
  // Plus drills only open for Plus members. Everyone else sees the
  // "Unlock with Plus" popup instead (see plus.js).
  if (drill.plus && !isPlus()) {
    openPlusPopup(drill.name, "This is a Plus drill. Get Plus to unlock it and 9 more.", opener);
    return;
  }
  if (!modal) createModal();
  returnFocusTo = opener || document.activeElement;
  modal.querySelector("#drill-modal-title").textContent = drill.name;
  modal.querySelector("#drill-modal-save").innerHTML = saveButtonHTML(drill.id, drill.name);
  modal.querySelector("#drill-copy").dataset.id = drill.id;
  const body = modal.querySelector("#drill-modal-body");
  body.innerHTML = drillDetailHTML(drill);
  body.scrollTop = 0;
  modal.showModal();
  modal.querySelector(".modal__close").focus();
}
