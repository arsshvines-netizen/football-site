// =========================================================
// feedback.js: the tester Feedback form.
// Saves responses in localStorage (this device only) and
// exports them as JSON or CSV for your evidence.
// Nothing is ever sent online.
// =========================================================

import { isStorageAvailable, loadData, saveData, removeData, downloadFile, escapeHTML, askToConfirm } from "./storage.js";
import { BRAND } from "./config.js";

const STORAGE_KEY = "pitchpath-feedback";
const DATA_VERSION = 1;

export const RATING_QUESTIONS = [
  { key: "usefulness", text: "How useful is the content?" },
  { key: "understandable", text: "How easy is the content to understand?" },
  { key: "navigation", text: "How easy is it to find your way around?" },
  { key: "visual", text: "How good does the website look?" },
  { key: "professional", text: "How professional does it feel?" },
  { key: "useAgain", text: "How likely are you to use it again?" },
];

export const TASKS = [
  { key: "task1", text: "Find a winger programme" },
  { key: "task2", text: "Find nutrition guidance" },
  { key: "task3", text: "Open the progress tracker" },
  { key: "task4", text: "Find a defender drill" },
  { key: "task5", text: "Find the warm-up" },
];

const FREE_TEXT = [
  { key: "liked", text: "What did you like?" },
  { key: "confusing", text: "What was confusing?" },
  { key: "change", text: "What would you change?" },
];

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

// ---------- Summary of saved responses ----------

function average(key) {
  if (!responses.length) return "–";
  return (responses.reduce((sum, r) => sum + Number(r[key]), 0) / responses.length).toFixed(1);
}

function renderSummary() {
  const wrap = document.getElementById("feedback-summary");
  document.getElementById("response-count").textContent = responses.length;
  if (!responses.length) {
    wrap.innerHTML = `<p class="empty-state">No responses saved on this device yet. When a tester fills in the form, a summary will appear here.</p>`;
    return;
  }
  const ratingRows = RATING_QUESTIONS.map((q) => `<tr><th scope="row">${q.text}</th><td>${average(q.key)} / 5</td></tr>`).join("");
  const taskRows = TASKS.map((t) => {
    const done = responses.filter((r) => r[`${t.key}Done`] === "yes").length;
    return `<tr><th scope="row">${t.text}</th><td>${done}/${responses.length} unaided</td><td>${average(`${t.key}Clicks`)}</td><td>${average(`${t.key}Time`)} s</td></tr>`;
  }).join("");
  const codes = responses.map((r) => escapeHTML(r.testerCode)).join(", ");
  const count = (key, value) => responses.filter((r) => r[key] === value).length;
  const marketRows = `
    <tr><th scope="row">Would pay for Plus</th><td>Yes ${count("wouldPay", "yes")} · Maybe ${count("wouldPay", "maybe")} · No ${count("wouldPay", "no")}</td></tr>
    <tr><th scope="row">Most wanted feature</th><td>Personal plan ${count("bestFeature", "personal-plan")} · Video feedback ${count("bestFeature", "video-feedback")} · Team tools ${count("bestFeature", "team-tools")}</td></tr>
    <tr><th scope="row">Top channel</th><td>Instagram ${count("channel", "instagram")} · YouTube ${count("channel", "youtube")} · Club ${count("channel", "club")} · School ${count("channel", "school")} · Friends ${count("channel", "friends")}</td></tr>`;
  wrap.innerHTML = `
    <p><strong>Testers:</strong> ${codes}</p>
    <div class="grid grid--2">
      <div class="table-wrap"><table>
        <caption>Average ratings</caption>
        <thead><tr><th scope="col">Question</th><th scope="col">Average</th></tr></thead>
        <tbody>${ratingRows}</tbody></table></div>
      <div class="table-wrap"><table>
        <caption>Navigation tasks</caption>
        <thead><tr><th scope="col">Task</th><th scope="col">Completed</th><th scope="col">Avg clicks</th><th scope="col">Avg time</th></tr></thead>
        <tbody>${taskRows}</tbody></table></div>
    </div>
    <div class="table-wrap" style="margin-top:var(--space-4)"><table>
      <caption>Market research</caption>
      <tbody>${marketRows}</tbody></table></div>`;
}

// ---------- Export ----------

function toCSV() {
  if (!responses.length) return "";
  const headers = Object.keys(responses[0]);
  const escapeCell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const lines = [headers.map(escapeCell).join(",")];
  responses.forEach((r) => lines.push(headers.map((h) => escapeCell(r[h])).join(",")));
  return lines.join("\r\n");
}

function onDownload() {
  if (!responses.length) {
    showMessage("There are no responses to download yet.", "error");
    return;
  }
  const base = `${BRAND.name.toLowerCase()}-feedback-${new Date().toISOString().slice(0, 10)}`;
  downloadFile(`${base}.json`, JSON.stringify({ version: DATA_VERSION, responses }, null, 2));
  // Small delay so browsers allow the second download
  setTimeout(() => downloadFile(`${base}.csv`, toCSV(), "text/csv"), 400);
  showMessage(`Downloaded ${base}.json and ${base}.csv.`);
}

async function onDeleteAll() {
  if (!responses.length) return;
  if (!(await askToConfirm(`Delete all ${responses.length} saved responses from this device? Download them first if you need them.`, "Delete all"))) return;
  responses = [];
  removeData(STORAGE_KEY);
  renderSummary();
  showMessage("All responses deleted.");
}

function onSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const result = validate(form);
  showErrors(form, result.errors);
  if (!result.ok) {
    showMessage("Some answers are missing. Please check the highlighted questions.", "error");
    return;
  }
  responses.push(result.response);
  if (!persist()) {
    showMessage("Sorry, this browser couldn't save the response.", "error");
    return;
  }
  form.reset();
  renderSummary();
  showMessage(`Thank you, ${result.response.testerCode}! Your response is saved on this device.`);
  document.getElementById("feedback-message").scrollIntoView({ block: "center" });
}

// ---------- Start ----------

buildForm();
renderSummary();
if (!storageWorks) showMessage("This browser can't save data (storage is off). Responses won't be kept.", "error");
document.getElementById("feedback-form").addEventListener("submit", onSubmit);
document.getElementById("download-feedback").addEventListener("click", onDownload);
document.getElementById("delete-feedback").addEventListener("click", onDeleteAll);
