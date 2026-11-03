// =========================================================
// studio.js: the CREATOR-ONLY page (studio.html).
// It is not linked anywhere on the site and asks for a code.
//
// IMPORTANT: this is a "hidden door", not real security.
// The site has no server, so anyone who reads this file could
// find the code. Never put private information on this page.
//
// It shows:
//   - the tester feedback results (from this device's browser)
//   - buttons to download them as JSON and CSV for evidence
// The brand kit and business plan are plain HTML in studio.html.
// =========================================================

import { loadData, removeData, downloadFile, escapeHTML, askToConfirm } from "./storage.js";
import { BRAND } from "./config.js";
import { SOURCES } from "./data/sources.js";
import { DRILL_VIDEOS, WARM_UP_VIDEOS, WARM_UP_FULL_VIDEO } from "./data/videos.js";
import { DRILLS } from "./data/drills.js";
import { isPlus, setPlus } from "./plus.js";
import {
  FEEDBACK_KEY as STORAGE_KEY, FEEDBACK_VERSION as DATA_VERSION, RATING_QUESTIONS, TASKS,
} from "./data/feedback.js";

// Change this to your own code.
const CREATOR_CODE = "arssh9";
const UNLOCK_KEY = "pitchpath-studio-unlocked"; // remembered until the tab closes

function loadResponses() {
  const saved = loadData(STORAGE_KEY, null);
  if (saved && saved.version === DATA_VERSION && Array.isArray(saved.responses)) return saved.responses;
  return [];
}

let responses = loadResponses();

function showMessage(text, type = "success") {
  const el = document.getElementById("studio-message");
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

// ---------- The code screen ----------

function unlock() {
  document.getElementById("gate").hidden = true;
  document.getElementById("studio").hidden = false;
  renderSummary();
}

function isUnlocked() {
  try { return window.sessionStorage.getItem(UNLOCK_KEY) === "yes"; } catch (error) { return false; }
}

function setUpGate() {
  const form = document.getElementById("gate-form");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.getElementById("gate-code");
    if (input.value.trim() === CREATOR_CODE) {
      try { window.sessionStorage.setItem(UNLOCK_KEY, "yes"); } catch (error) { /* still unlock */ }
      unlock();
      document.getElementById("studio-title").focus();
    } else {
      document.getElementById("gate-error").textContent = "That code isn't right.";
      input.setAttribute("aria-invalid", "true");
      input.select();
    }
  });
  document.getElementById("lock-btn").addEventListener("click", () => {
    try { window.sessionStorage.removeItem(UNLOCK_KEY); } catch (error) { /* ignore */ }
    window.location.reload();
  });
}

// ---------- Sources still to check ----------
function renderSourceChecks() {
  const list = document.getElementById("source-checks");
  const todo = SOURCES.filter((source) => !source.checked);
  list.innerHTML = todo.length
    ? todo.map((source) => `<li><strong>${escapeHTML(source.author)}</strong>: "${escapeHTML(source.title)}"${source.url ? "" : " <em>(link missing)</em>"}</li>`).join("")
    : "<li>All sources are checked.</li>";
  document.getElementById("source-check-count").textContent = todo.length;
}

// ---------- Videos still to add ----------
function renderVideoChecks() {
  const missing = [];
  if (!WARM_UP_FULL_VIDEO) missing.push("<strong>Full warm-up</strong>: suggested file <code>warm-up/full.mp4</code>");
  DRILLS.forEach((drill) => {
    if (!DRILL_VIDEOS[drill.id]) missing.push(`<strong>${escapeHTML(drill.name)}</strong> (${drill.id}): suggested file <code>drills/${drill.id}.mp4</code>`);
  });
  const movesMissing = Object.keys(WARM_UP_VIDEOS).filter((name) => !WARM_UP_VIDEOS[name]).length;
  if (movesMissing) missing.push(`Optional: ${movesMissing} short clips, one per warm-up move`);
  document.getElementById("video-checks").innerHTML = missing.length
    ? missing.map((item) => `<li>${item}</li>`).join("")
    : "<li>All videos are added. 🎉</li>";
  document.getElementById("video-count").textContent = DRILLS.filter((d) => !DRILL_VIDEOS[d.id]).length + (WARM_UP_FULL_VIDEO ? 0 : 1);
}

// ---------- Plus on this device (founder only) ----------
function renderPlusSwitch() {
  const on = isPlus();
  document.getElementById("plus-state").textContent = on
    ? "Plus is ON for this device. You'll see the ★ PLUS badge at the top of every page."
    : "Plus is OFF for this device.";
  document.getElementById("plus-toggle").textContent = on ? "Turn Plus off" : "Turn Plus on for me";
}
document.getElementById("plus-toggle").addEventListener("click", () => {
  setPlus(!isPlus());
  // Reload so the header badge and the Plus look update everywhere
  window.location.reload();
});

setUpGate();
renderPlusSwitch();
renderSourceChecks();
renderVideoChecks();
document.getElementById("download-feedback").addEventListener("click", onDownload);
document.getElementById("delete-feedback").addEventListener("click", onDeleteAll);
if (isUnlocked()) unlock();
