// =========================================================
// favourites.js: "saved" drills (the ♥ button).
// The list of saved drill ids is kept in localStorage, so it
// stays on this device only. Used by the Drills page and the
// drill popup.
// =========================================================

import { loadData, saveData } from "./storage.js";

const SAVED_KEY = "pitchpath-saved-drills";

export function getSaved() {
  const saved = loadData(SAVED_KEY, []);
  return Array.isArray(saved) ? saved : [];
}

export function isSaved(id) {
  return getSaved().includes(id);
}

// Adds or removes a drill. Returns true if it is now saved.
export function toggleSaved(id) {
  const saved = getSaved();
  const nowSaved = !saved.includes(id);
  const updated = nowSaved ? [...saved, id] : saved.filter((x) => x !== id);
  saveData(SAVED_KEY, updated);
  // Tell the rest of the page, so every ♥ button for this drill updates
  document.dispatchEvent(new CustomEvent("saved-drills-changed", { detail: { id, saved: nowSaved } }));
  return nowSaved;
}

// The HTML for a ♥ button
export function saveButtonHTML(id, name) {
  const saved = isSaved(id);
  return `<button type="button" class="save-btn" data-save="${id}" aria-pressed="${saved}" aria-label="Save ${name}">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20C5 15 2 11.5 2 8c0-2.8 2.2-5 5-5 2 0 3.8 1.2 5 3 1.2-1.8 3-3 5-3 2.8 0 5 2.2 5 5 0 3.5-3 7-10 12z"/></svg>
  </button>`;
}
