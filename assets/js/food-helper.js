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
// ("~drink" means the common word "drink")
function has(question, word) {
  return question.includes(` ${word.replace(/^[~!]/, "")}`);
}

// How much a matching key word counts: longer = more exact.
// Common words (starting with "~") only count 1, very specific
// words (starting with "!") count 20.
function weight(word) {
  if (word.startsWith("~")) return 1;
  if (word.startsWith("!")) return 20;
  return word.trim().length;
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
    const score = topic.words.filter((word) => has(question, word)).reduce((sum, word) => sum + weight(word), 0);
    if (score > bestScore) { best = topic; bestScore = score; }
  });
  return best ? { text: best.reply, tab: best.tab } : { text: NOT_SURE, tab: null };
}

// ---------- Drawing the chat ----------

const AVATAR = '<span class="fh-avatar" aria-hidden="true">🍌</span>';

function bubbleHTML(who, text, tab) {
  const more = tab ? `<a class="fh-more" href="#${tab[0]}">📖 More in ${escapeHTML(tab[1])}</a>` : "";
  return `
    <li class="fh-msg fh-msg--${who}">
      ${who === "bot" ? AVATAR : ""}
      <div class="fh-bubble">
        <span class="visually-hidden">${who === "bot" ? "Food Helper says:" : "You asked:"}</span>
        <p>${escapeHTML(text)}</p>
        ${more}
      </div>
    </li>`;
}

// Big topic cards (before the first question)
function topicsHTML(disabled) {
  return SUGGESTED.map((t) => `
    <button type="button" class="fh-topic" data-ask="${escapeHTML(t.q)}" ${disabled ? 'disabled tabindex="-1"' : ""}>
      <span class="fh-topic__icon" aria-hidden="true">${t.icon}</span>
      <span class="fh-topic__text">${escapeHTML(t.short)}</span>
    </button>`).join("");
}

// Small chips (after the first question)
function chipsHTML() {
  return SUGGESTED.map((t) => `<button type="button" class="fh-chip" data-ask="${escapeHTML(t.q)}"><span aria-hidden="true">${t.icon}</span> ${escapeHTML(t.short)}</button>`).join("");
}

function headHTML() {
  return `
    <header class="fh-head">
      <span class="fh-head__avatar" aria-hidden="true">🍌</span>
      <div class="fh-head__text">
        <h2 id="food-helper-title" class="fh-head__title">Food Helper</h2>
        <p class="fh-head__sub">Ask anything about food and drinks for football</p>
      </div>
      <span class="plus-tag">★ PLUS</span>
    </header>`;
}

function welcomeHTML(disabled) {
  return `
    <div class="fh-welcome">
      <span class="fh-welcome__avatar" aria-hidden="true">🍌</span>
      <p class="fh-welcome__title">Hi! What do you want to know?</p>
      <p class="fh-welcome__sub">Tap a topic or type your own question.</p>
      <div class="fh-topics" aria-label="Topics you can ask about">${topicsHTML(disabled)}</div>
    </div>`;
}

function inputHTML(disabled) {
  return `
    <form class="fh-input" id="chat-form">
      <label for="chat-input" class="visually-hidden">Type your question</label>
      <input id="chat-input" type="text" maxlength="120" autocomplete="off" placeholder="Ask about food, drinks, match day…" ${disabled ? "disabled" : ""}>
      <button type="submit" class="fh-send" aria-label="Send question" ${disabled ? "disabled" : ""}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12l16-8-6 16-2.5-6.5L4 12z" fill="currentColor"/></svg>
      </button>
    </form>`;
}

function openChatHTML() {
  return `
    ${headHTML()}
    <div class="fh-screen" id="chat-screen">
      ${welcomeHTML(false)}
      <ol class="fh-log" id="chat-log" role="log" aria-live="polite" aria-label="Chat with the Food Helper" hidden></ol>
    </div>
    <div class="fh-chips" id="chat-chips" aria-label="More questions" hidden>${chipsHTML()}</div>
    ${inputHTML(false)}
    <p class="fh-note">🔒 Answers come from PITCHPATH's checked nutrition tips. Not a person, a doctor or a real AI. Nothing you type is saved or sent.</p>`;
}

function lockedChatHTML() {
  return `
    ${headHTML()}
    <div class="fh-screen fh-screen--locked">
      <div class="fh-locked-preview" aria-hidden="true">${welcomeHTML(true)}</div>
      <div class="fh-lock">
        <span class="fh-lock__icon" aria-hidden="true">🔒</span>
        <p class="fh-lock__title">Unlock the Food Helper</p>
        <p class="fh-lock__text">Quick answers about breakfasts, match days, water, snacks and more.</p>
        <a class="btn btn--gold btn--arrow" href="${GET_PLUS_HREF}">Get Plus · ${plusPriceText()}</a>
      </div>
    </div>`;
}

// Add the question, show "typing...", then the answer
function ask(question) {
  const text = question.trim();
  if (!text) return;
  const log = document.getElementById("chat-log");
  const screen = document.getElementById("chat-screen");
  // First question: swap the welcome screen for the conversation
  if (log.hidden) {
    screen.querySelector(".fh-welcome").remove();
    log.hidden = false;
    document.getElementById("chat-chips").hidden = false;
    log.insertAdjacentHTML("beforeend", bubbleHTML("bot", GREETING));
  }
  log.insertAdjacentHTML("beforeend", bubbleHTML("user", text));
  const reply = findReply(text);
  const typing = document.createElement("li");
  typing.className = "fh-msg fh-msg--bot fh-typing";
  typing.innerHTML = `${AVATAR}<div class="fh-bubble" aria-hidden="true"><span></span><span></span><span></span></div>`;
  log.appendChild(typing);
  screen.scrollTop = screen.scrollHeight;
  setTimeout(() => {
    typing.remove();
    log.insertAdjacentHTML("beforeend", bubbleHTML("bot", reply.text, reply.tab));
    screen.scrollTop = screen.scrollHeight;
  }, reduceMotion ? 0 : 700);
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
    input.focus();
  });
  box.addEventListener("click", (event) => {
    const topic = event.target.closest("[data-ask]");
    if (topic) { ask(topic.dataset.ask); input.focus(); }
  });
}

start();
