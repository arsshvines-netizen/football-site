// =========================================================
// feedback.js: the tester Feedback form.
// Saves responses in localStorage (this device only).
// The results (summary, JSON/CSV download) are on the
// creator-only page studio.html.
// Nothing is ever sent online.
// =========================================================

import { isStorageAvailable, loadData, saveData } from "./storage.js";
import {
  FEEDBACK_KEY as STORAGE_KEY, FEEDBACK_VERSION as DATA_VERSION, RATING_QUESTIONS, TASKS, FREE_TEXT,
} from "./data/feedback.js";

const storageWorks = isStorageAvailable();

function loadResponses() {
  const saved = loadData(STORAGE_KEY, null);
  if (saved && saved.version === DATA_VERSION && Array.isArray(saved.responses)) return saved.responses;
  return [];
}

let responses = loadResponses();

function persist() {
  return saveData(STORAGE_KEY, { version: DATA_VERSION, responses });
}

// ---------- Build the form ----------

function ratingFieldHTML(q) {
  const radios = [1, 2, 3, 4, 5].map((n) => `
    <label><input type="radio" name="${q.key}" value="${n}"> ${n}</label>`).join("");
  return `
    <fieldset class="field rating-field">
      <legend>${q.text} <span class="hint">(1 = not at all, 5 = very)</span></legend>
      <div class="radio-row">${radios}</div>
      <span class="field-error" data-error-for="${q.key}"></span>
    </fieldset>`;
}

function taskFieldHTML(task, i) {
  return `
    <fieldset class="task card">
      <legend><strong>Task ${i + 1}:</strong> ${task.text}</legend>
      <div class="form-grid form-grid--3">
        <div class="field">
          <span id="${task.key}-done-label" class="field-label">Completed without help?</span>
          <div class="radio-row" role="radiogroup" aria-labelledby="${task.key}-done-label">
            <label><input type="radio" name="${task.key}Done" value="yes"> Yes</label>
            <label><input type="radio" name="${task.key}Done" value="no"> No</label>
          </div>
          <span class="field-error" data-error-for="${task.key}Done"></span>
        </div>
        <div class="field">
          <label for="${task.key}Clicks">Number of clicks</label>
          <input id="${task.key}Clicks" name="${task.key}Clicks" type="number" min="0" max="50" inputmode="numeric">
          <span class="field-error" data-error-for="${task.key}Clicks"></span>
        </div>
        <div class="field">
          <label for="${task.key}Time">Time (seconds)</label>
          <input id="${task.key}Time" name="${task.key}Time" type="number" min="0" max="600" inputmode="numeric">
          <span class="field-error" data-error-for="${task.key}Time"></span>
        </div>
      </div>
    </fieldset>`;
}

function freeTextHTML(f) {
  return `
    <div class="field">
      <label for="fb-${f.key}">${f.text}</label>
      <textarea id="fb-${f.key}" name="${f.key}" maxlength="500"></textarea>
    </div>`;
}

function buildForm() {
  document.getElementById("rating-questions").innerHTML = RATING_QUESTIONS.map(ratingFieldHTML).join("");
  document.getElementById("task-questions").innerHTML = TASKS.map(taskFieldHTML).join("");
  document.getElementById("free-text").innerHTML = FREE_TEXT.map(freeTextHTML).join("");
}

// ---------- Validation ----------

function validate(form) {
  const values = Object.fromEntries(new FormData(form).entries());
  const errors = {};

  const code = String(values.testerCode || "").trim().toUpperCase();
  if (!/^T\d{1,3}$/.test(code)) errors.testerCode = "Use a tester code like T1 or T12 (no real names).";
  if (!values.ageGroup) errors.ageGroup = "Please choose an age group.";
  if (!values.position) errors.position = "Please choose a position.";

  RATING_QUESTIONS.forEach((q) => {
    const n = Number(values[q.key]);
    if (!(n >= 1 && n <= 5)) errors[q.key] = "Please choose a rating from 1 to 5.";
  });

  TASKS.forEach((t) => {
    if (!values[`${t.key}Done`]) errors[`${t.key}Done`] = "Choose yes or no.";
    const clicks = values[`${t.key}Clicks`];
    if (clicks === "" || !Number.isInteger(Number(clicks)) || Number(clicks) < 0) errors[`${t.key}Clicks`] = "Enter a whole number, 0 or more.";
    const time = values[`${t.key}Time`];
    if (time === "" || Number.isNaN(Number(time)) || Number(time) < 0) errors[`${t.key}Time`] = "Enter the time in seconds, 0 or more.";
  });

  const response = {
    id: `${Date.now()}`,
    savedAt: new Date().toISOString(),
    testerCode: code,
    ageGroup: values.ageGroup,
    position: values.position,
  };
  RATING_QUESTIONS.forEach((q) => { response[q.key] = Number(values[q.key]); });
  TASKS.forEach((t) => {
    response[`${t.key}Done`] = values[`${t.key}Done`];
    response[`${t.key}Clicks`] = Number(values[`${t.key}Clicks`]);
    response[`${t.key}Time`] = Number(values[`${t.key}Time`]);
  });
  // Market research answers (optional)
  ["wouldPay", "fairPrice", "bestFeature", "channel"].forEach((key) => { response[key] = values[key] || ""; });
  FREE_TEXT.forEach((f) => { response[f.key] = String(values[f.key] || "").trim(); });

  return { ok: Object.keys(errors).length === 0, errors, response };
}

function showErrors(form, errors) {
  form.querySelectorAll("[data-error-for]").forEach((el) => { el.textContent = ""; });
  form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
  let first = null;
  Object.entries(errors).forEach(([field, message]) => {
    const errorEl = form.querySelector(`[data-error-for="${field}"]`);
    if (errorEl) errorEl.textContent = message;
    const input = form.querySelector(`[name="${field}"]`);
    if (input) {
      input.setAttribute("aria-invalid", "true");
      if (!first) first = input;
    }
  });
  if (first) first.focus();
}

function showMessage(text, type = "success") {
  const el = document.getElementById("feedback-message");
  el.className = `notice ${type === "error" ? "notice--error" : ""}`;
  el.textContent = text;
}

function onSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const result = validate(form);
  if (!result.ok) {
    // Go back to the first step that has a missing answer
    const badStep = steps.findIndex((step) => Object.keys(errorsInStep(result.errors, step)).length > 0);
    showStep(badStep === -1 ? 0 : badStep);
    showErrors(form, errorsInStep(result.errors, steps[stepIndex]));
    showMessage("Some answers are missing. Please check the highlighted questions.", "error");
    return;
  }
  showErrors(form, {});
  responses.push(result.response);
  if (!persist()) {
    showMessage("Sorry, this browser couldn't save the response.", "error");
    return;
  }
  form.reset();
  showStep(0);
  showMessage(`Thank you, ${result.response.testerCode}! Your response is saved on this device. The form is ready for the next tester.`);
  document.getElementById("feedback-message").scrollIntoView({ block: "center" });
}

// ---------- Start ----------

// ---------- Step-by-step form ----------
// Only one part of the form shows at a time. "Next" checks the
// answers on the current step before moving on.

const form = document.getElementById("feedback-form");
const steps = [...form.querySelectorAll(".form-section")];
const backButton = document.getElementById("step-back");
const nextButton = document.getElementById("step-next");
const saveButton = document.getElementById("step-save");
let stepIndex = 0;

// Keep only the errors for fields that are inside one step
function errorsInStep(errors, step) {
  return Object.fromEntries(Object.entries(errors).filter(([field]) => step.querySelector(`[name="${field}"]`)));
}

function showStep(index, moveFocus = false) {
  stepIndex = index;
  steps.forEach((step, i) => { step.hidden = i !== index; });
  const title = steps[index].querySelector("h2");
  document.getElementById("step-count").textContent = `Step ${index + 1} of ${steps.length}: ${title.textContent}`;
  document.querySelectorAll("#step-dots li").forEach((dot, i) => {
    dot.classList.toggle("is-done", i < index);
    dot.classList.toggle("is-current", i === index);
  });
  backButton.hidden = index === 0;
  nextButton.hidden = index === steps.length - 1;
  saveButton.hidden = index !== steps.length - 1;
  if (moveFocus) title.focus();
}

function setUpStepper() {
  document.getElementById("step-dots").innerHTML = steps
    .map((step) => `<li><span></span>${step.querySelector("h2").textContent.replace(/\(optional\)/i, "").trim()}</li>`)
    .join("");
  steps.forEach((step) => { step.querySelector("h2").tabIndex = -1; });

  nextButton.addEventListener("click", () => {
    const stepErrors = errorsInStep(validate(form).errors, steps[stepIndex]);
    showErrors(form, stepErrors);
    if (Object.keys(stepErrors).length > 0) {
      showMessage("Please answer the highlighted questions first.", "error");
      return;
    }
    showMessage("");
    showStep(stepIndex + 1, true);
    form.scrollIntoView({ block: "start" });
  });
  backButton.addEventListener("click", () => {
    showMessage("");
    showStep(stepIndex - 1, true);
    form.scrollIntoView({ block: "start" });
  });
  showStep(0);
}

buildForm();
setUpStepper();
if (!storageWorks) showMessage("This browser can't save data (storage is off). Responses won't be kept.", "error");
document.getElementById("feedback-form").addEventListener("submit", onSubmit);
