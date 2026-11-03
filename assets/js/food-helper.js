// =========================================================
// food-helper.js: the "Food Helper" chat on the Nutrition page.
// A PLUS feature.
//
// How it works (no AI, no internet): it looks for key words in
// the question and picks the topic with the best match from
// data/food-helper.js. Longer key words count more, so
// "energy drink" beats just "drink". Safety questions (weight,
// dieting, health worries) are checked first and always get a
// "talk to a parent or doctor" reply.
//
// Questions are NOT saved and NOT sent anywhere.
// =========================================================

import { SUGGESTED, GREETING, NOT_SURE, SAFETY_REPLIES, TOPICS } from "./data/food-helper.js";
import { isPlus, GET_PLUS_HREF, plusPriceText } from "./plus.js";
import { escapeHTML } from "./storage.js";

const box = document.getElementById("food-helper");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Make the question easy to search: lower case, no punctuation,
// with spaces at both ends (so " hi " doesn't match "high").
function tidy(text) {
  return ` ${text.toLowerCase().replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim()} `;
}

// Does the question contain this key word (at the start of a word)?
function has(question, word) {
  return question.includes(` ${word}`);
}

// Pick the reply for a question
export function findReply(rawQuestion) {
  const question = tidy(rawQuestion);
  for (const safety of SAFETY_REPLIES) {
    if (safety.words.some((word) => has(question, word))) return { text: safety.reply, tab: null };
  }
  let best = null;
  let bestScore = 0;
  TOPICS.forEach((topic) => {
    const score = topic.words.filter((word) => has(question, word)).reduce((sum, word) => sum + word.trim().length, 0);
    if (score > bestScore) { best = topic; bestScore = score; }
  });
  return best ? { text: best.reply, tab: best.tab } : { text: NOT_SURE, tab: null };
}

// ---------- Drawing the chat ----------

function bubbleHTML(who, text, tab) {
  const more = tab ? `<a class="chat__more" href="#${tab[0]}">More in the ${escapeHTML(tab[1])} tab ↓</a>` : "";
  return `
    <li class="chat__msg chat__msg--${who}">
      ${who === "bot" ? '<span class="chat__avatar" aria-hidden="true">🍌</span>' : ""}
      <p class="chat__bubble"><span class="visually-hidden">${who === "bot" ? "Food Helper:" : "You:"}</span> ${escapeHTML(text)}${more ? `<br>${more}` : ""}</p>
    </li>`;
}

function chipsHTML() {
  return SUGGESTED.map((q) => `<button type="button" class="chat__chip" data-ask="${escapeHTML(q)}">${escapeHTML(q)}</button>`).join("");
}

function headHTML(locked) {
  return `
    <div class="chat__head">
      <span class="chat__head-icon" aria-hidden="true">💬</span>
      <div>
        <h2 id="food-helper-title" class="chat__title">Ask the Food Helper</h2>
        <p class="chat__sub">Quick answers about food and drinks for football${locked ? "" : ", any time"}.</p>
      </div>
      <span class="plus-tag">★ PLUS</span>
    </div>`;
}

function openChatHTML() {
  return `
    ${headHTML(false)}
    <ol class="chat__log" id="chat-log" role="log" aria-live="polite" aria-label="Chat with the Food Helper">
      ${bubbleHTML("bot", GREETING)}
    </ol>
    <div class="chat__chips" aria-label="Questions you can ask">${chipsHTML()}</div>
    <form class="chat__form" id="chat-form">
      <label for="chat-input" class="visually-hidden">Type your question</label>
      <input id="chat-input" type="text" maxlength="120" autocomplete="off" placeholder="Type a question, e.g. what's a good snack?">
      <button type="submit" class="btn btn--gold">Ask</button>
    </form>
    <p class="chat__note">The Food Helper answers from PITCHPATH's checked nutrition tips. It isn't a person, a doctor or a real AI. Your questions aren't saved or sent anywhere.</p>`;
}

function lockedChatHTML() {
  // A real example of what it says, then the "Get Plus" button
  const example = "What should I eat before training?";
  return `
    ${headHTML(true)}
    <ol class="chat__log chat__log--demo" aria-label="Example chat">
      ${bubbleHTML("user", example)}
      ${bubbleHTML("bot", findReply(example).text)}
    </ol>
    <div class="chat__locked">
      <p><strong>🔒 The Food Helper is part of Plus.</strong> Ask about breakfasts, match days, water, snacks and more.</p>
      <a class="btn btn--gold btn--arrow" href="${GET_PLUS_HREF}">Get Plus · ${plusPriceText()}</a>
    </div>`;
}

// Add the question, show "typing...", then the answer
function ask(question) {
  const text = question.trim();
  if (!text) return;
  const log = document.getElementById("chat-log");
  log.insertAdjacentHTML("beforeend", bubbleHTML("user", text));
  const reply = findReply(text);
  const typing = document.createElement("li");
  typing.className = "chat__msg chat__msg--bot chat__typing";
  typing.innerHTML = '<span class="chat__avatar" aria-hidden="true">🍌</span><p class="chat__bubble" aria-hidden="true"><span></span><span></span><span></span></p>';
  log.appendChild(typing);
  log.scrollTop = log.scrollHeight;
  setTimeout(() => {
    typing.remove();
    log.insertAdjacentHTML("beforeend", bubbleHTML("bot", reply.text, reply.tab));
    log.scrollTop = log.scrollHeight;
  }, reduceMotion ? 0 : 650);
}

function start() {
  if (!box) return;
  if (!isPlus()) { box.innerHTML = lockedChatHTML(); box.classList.add("is-locked"); return; }
  box.innerHTML = openChatHTML();
  const input = document.getElementById("chat-input");
  document.getElementById("chat-form").addEventListener("submit", (event) => {
    event.preventDefault();
    ask(input.value);
    input.value = "";
  });
  box.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-ask]");
    if (chip) ask(chip.dataset.ask);
  });
}

start();
