// =========================================================
// plus.js: everything about the PLUS membership.
//
// - isPlus()       true if Plus is switched on for THIS device
// - setPlus(on)    switch Plus on or off (used by studio.html)
// - plusLockHTML() / openPlusPopup()  the "Unlock with Plus" message
//
// HOW PLUS IS SWITCHED ON (for now):
// There are no payments or accounts yet, so Plus is a simple
// switch saved in this browser's localStorage. The founder turns
// it on for their own device in the Creator Studio.
//
// IMPORTANT: this is a DEMO LOCK, not real security. Someone who
// knows how to use the browser's developer tools could switch it
// on, and the Plus drills are in the public website files. Real
// paid access needs payments plus a server that checks who has
// paid (a later step, with a parent's permission for under-16s).
// =========================================================

import { loadData, saveData, removeData } from "./storage.js";
import { PLANS, CURRENCY, PLUS_BUY_LINK } from "./data/plans.js";

const PLUS_KEY = "pitchpath-plus";

export function isPlus() {
  return loadData(PLUS_KEY, null)?.active === true;
}

export function setPlus(on) {
  if (on) saveData(PLUS_KEY, { active: true, since: new Date().toISOString().slice(0, 10) });
  else removeData(PLUS_KEY);
}

// The Plus plan details (price, features) come from data/plans.js
export const PLUS_PLAN = PLANS.find((plan) => plan.id === "plus");

// Where "Get Plus" buttons go. Until a payment link is added in
// data/plans.js, they go to the price cards on the Plans page.
export const GET_PLUS_HREF = PLUS_BUY_LINK || "plans.html#plans-title";

// A short price line, e.g. "₹199 per month"
export function plusPriceText() {
  return `${CURRENCY}${PLUS_PLAN.price} ${PLUS_PLAN.period}`;
}

// The gold "PLUS" tag used on cards and in the menu
export const PLUS_TAG = '<span class="plus-tag">★ PLUS</span>';

// ---------- The "Unlock with Plus" popup ----------

let popup = null;
let returnFocusTo = null;

function createPopup() {
  popup = document.createElement("dialog");
  popup.className = "modal plus-popup";
  popup.setAttribute("aria-labelledby", "plus-popup-title");
  popup.innerHTML = `
    <div class="plus-popup__inner">
      <button type="button" class="modal__close plus-popup__close" aria-label="Close">✕</button>
      <p class="plus-popup__badge">★ PITCHPATH PLUS</p>
      <h2 id="plus-popup-title" class="plus-popup__title"></h2>
      <p class="plus-popup__text"></p>
      <ul class="plus-perks">
        <li><span aria-hidden="true">⚽</span> 10 extra Plus drills</li>
        <li><span aria-hidden="true">🗓️</span> Weekly Planner</li>
        <li><span aria-hidden="true">★</span> Plus member badge</li>
      </ul>
      <a class="btn btn--gold btn--big btn--arrow" href="${GET_PLUS_HREF}">Get Plus · ${plusPriceText()}</a>
      <p class="plus-popup__small">Ask a parent before buying anything online.</p>
    </div>`;
  document.body.appendChild(popup);
  popup.querySelector(".plus-popup__close").addEventListener("click", () => popup.close());
  popup.addEventListener("click", (event) => { if (event.target === popup) popup.close(); });
  popup.addEventListener("close", () => { if (returnFocusTo) returnFocusTo.focus(); });
}

// title: what they tried to open, e.g. a drill name
export function openPlusPopup(title, text, opener) {
  if (!popup) createPopup();
  returnFocusTo = opener || document.activeElement;
  popup.querySelector(".plus-popup__title").textContent = title;
  popup.querySelector(".plus-popup__text").textContent = text;
  popup.showModal();
  popup.querySelector(".plus-popup__close").focus();
}
