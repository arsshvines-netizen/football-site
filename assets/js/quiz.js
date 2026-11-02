// =========================================================
// quiz.js: the "Which position suits you?" quiz popup.
// Any button with data-open-quiz opens it. One question at a
// time; the result links to the drills for that position.
// Questions live in data/quiz.js.
// =========================================================

import { QUIZ, QUIZ_RESULTS } from "./data/quiz.js";
import { POSITION_LABELS } from "./data/drills.js";
import { escapeHTML } from "./storage.js";

let dialog = null;
let answers = [];       // the position picked for each question so far
let opener = null;      // the button that opened the quiz

function questionHTML(index) {
  const q = QUIZ[index];
  const percent = (index / QUIZ.length) * 100;
  return `
    <p class="quiz__count">Question ${index + 1} of ${QUIZ.length}</p>
    <div class="quiz__track" aria-hidden="true"><div class="quiz__bar" style="width:${percent}%"></div></div>
    <h3 class="quiz__question" tabindex="-1">${escapeHTML(q.question)}</h3>
    <div class="quiz__answers">
      ${q.answers.map((a) => `<button type="button" class="quiz__answer" data-answer="${a.position}">${escapeHTML(a.text)}</button>`).join("")}
    </div>
    ${index > 0 ? '<button type="button" class="link-button" data-quiz-back>← Back</button>' : ""}`;
}

function resultHTML() {
  // Count the points and pick the position with the most
  const scores = {};
  answers.forEach((position) => { scores[position] = (scores[position] || 0) + 1; });
  const best = Object.keys(scores).sort((a, b) => scores[b] - scores[a])[0];
  const result = QUIZ_RESULTS[best];
  return `
    <div class="quiz__result">
      <p class="quiz__emoji" aria-hidden="true">${result.emoji}</p>
      <p class="quiz__count">Your result</p>
      <h3 class="quiz__question" tabindex="-1">You could be a ${POSITION_LABELS[best]}!</h3>
      <p>${escapeHTML(result.text)}</p>
      <div class="btn-row" style="justify-content:center">
        <a class="btn btn--primary btn--arrow" href="drills.html?position=${best}">See ${POSITION_LABELS[best].toLowerCase()} drills</a>
        <button type="button" class="btn btn--outline" data-quiz-restart>Try again</button>
      </div>
      <p class="muted">Just for fun! Most young players try a few positions. Ask your coach what suits you.</p>
    </div>`;
}

function show() {
  const body = dialog.querySelector(".quiz__body");
  body.innerHTML = answers.length < QUIZ.length ? questionHTML(answers.length) : resultHTML();
  body.querySelector(".quiz__question").focus();
}

function createDialog() {
  dialog = document.createElement("dialog");
  dialog.className = "modal quiz";
  dialog.setAttribute("aria-labelledby", "quiz-title");
  dialog.innerHTML = `
    <div class="modal__header">
      <h2 id="quiz-title">Which position suits you?</h2>
      <button type="button" class="modal__close" aria-label="Close the quiz">×</button>
    </div>
    <div class="modal__body quiz__body" aria-live="polite"></div>`;
  document.body.appendChild(dialog);

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog || event.target.closest(".modal__close")) { dialog.close(); return; }
    const answer = event.target.closest("[data-answer]");
    if (answer) { answers.push(answer.dataset.answer); show(); return; }
    if (event.target.closest("[data-quiz-back]")) { answers.pop(); show(); return; }
    if (event.target.closest("[data-quiz-restart]")) { answers = []; show(); }
  });
  dialog.addEventListener("close", () => { if (opener) opener.focus(); });
}

function openQuiz(button) {
  if (!dialog) createDialog();
  opener = button;
  answers = [];
  dialog.showModal();
  show();
}

document.querySelectorAll("[data-open-quiz]").forEach((button) => {
  button.addEventListener("click", () => openQuiz(button));
});
