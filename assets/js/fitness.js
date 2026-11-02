// =========================================================
// fitness.js: builds the lists and tables on the Fitness page
// from data/fitness.js, and runs the "Start warm-up" timer.
// =========================================================

import { WARM_UP, STRENGTH, SPEED, ENDURANCE, MOBILITY, WEEKLY_SCHEDULES } from "./data/fitness.js";
import { escapeHTML } from "./storage.js";

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

// ---------- Build the content ----------

function buildWarmUpList() {
  const list = document.getElementById("warmup-list");
  list.innerHTML = WARM_UP.map((step) =>
    `<li><strong>${escapeHTML(step.name)}</strong> (${formatTime(step.seconds)}): ${escapeHTML(step.how)}</li>`).join("");
  const total = WARM_UP.reduce((sum, s) => sum + s.seconds, 0);
  document.getElementById("warmup-total").textContent = formatTime(total);
}

function buildStrengthTable() {
  const body = document.getElementById("strength-body");
  body.innerHTML = STRENGTH.map((ex) => `
    <tr>
      <th scope="row">${escapeHTML(ex.name)}<br><span class="table-how">${escapeHTML(ex.how)}</span></th>
      <td data-label="Beginner">${escapeHTML(ex.beginner)}</td>
      <td data-label="Intermediate">${escapeHTML(ex.intermediate)}</td>
      <td data-label="Advanced">${escapeHTML(ex.advanced)}</td>
    </tr>`).join("");
}

function buildSimpleList(id, items, extraKey) {
  document.getElementById(id).innerHTML = items.map((item) => {
    const extra = extraKey && item[extraKey] ? ` <em>Rest: ${escapeHTML(item[extraKey])}</em>` : "";
    return `<li><strong>${escapeHTML(item.name)}:</strong> ${escapeHTML(item.how)}${extra}</li>`;
  }).join("");
}

function buildEndurance() {
  document.getElementById("endurance-cards").innerHTML = ENDURANCE.map((e, i) => `
    <div class="card ${["", "card--orange", "card--navy"][i]}">
      <h4>${escapeHTML(e.level)}</h4>
      <p>${escapeHTML(e.plan)}</p>
    </div>`).join("");
}

function buildSchedules() {
  const wrap = document.getElementById("schedules");
  wrap.innerHTML = Object.entries(WEEKLY_SCHEDULES).map(([level, schedule]) => `
    <div class="schedule">
      <h3>${escapeHTML(level)} week</h3>
      <p class="muted">${escapeHTML(schedule.note)}</p>
      <div class="table-wrap">
        <table>
          <caption class="visually-hidden">${escapeHTML(level)} example week</caption>
          <thead><tr><th scope="col">Day</th><th scope="col">What to do</th></tr></thead>
          <tbody>${schedule.days.map(([day, plan]) =>
            `<tr><th scope="row">${day}</th><td>${escapeHTML(plan)}</td></tr>`).join("")}</tbody>
        </table>
      </div>
    </div>`).join("");
}

// ---------- Warm-up timer ----------

function setUpWarmUpTimer() {
  const startBtn = document.getElementById("timer-start");
  const pauseBtn = document.getElementById("timer-pause");
  const resetBtn = document.getElementById("timer-reset");
  const nameEl = document.getElementById("timer-name");
  const howEl = document.getElementById("timer-how");
  const clockEl = document.getElementById("timer-clock");
  const stepEl = document.getElementById("timer-step");
  const nextEl = document.getElementById("timer-next");
  const barEl = document.getElementById("timer-bar");
  const announceEl = document.getElementById("timer-announce");

  let stepIndex = 0;
  let secondsLeft = WARM_UP[0].seconds;
  let intervalId = null;

  function showStep() {
    const step = WARM_UP[stepIndex];
    nameEl.textContent = step.name;
    howEl.textContent = step.how;
    clockEl.textContent = formatTime(secondsLeft);
    stepEl.textContent = `Step ${stepIndex + 1} of ${WARM_UP.length}`;
    const next = WARM_UP[stepIndex + 1];
    nextEl.textContent = next ? `Next: ${next.name}` : "Last one!";
    const percent = ((step.seconds - secondsLeft) / step.seconds) * 100;
    barEl.style.width = `${percent}%`;
  }

  // Screen readers hear the step name only when it changes (not every second).
  function announce(text) {
    announceEl.textContent = text;
  }

  function tick() {
    secondsLeft -= 1;
    if (secondsLeft <= 0) {
      stepIndex += 1;
      if (stepIndex >= WARM_UP.length) {
        finish();
        return;
      }
      secondsLeft = WARM_UP[stepIndex].seconds;
      announce(`Now: ${WARM_UP[stepIndex].name}`);
    }
    showStep();
  }

  function start() {
    if (intervalId) return;
    intervalId = setInterval(tick, 1000);
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    announce(`Warm-up started. ${WARM_UP[stepIndex].name}`);
  }

  function pause() {
    clearInterval(intervalId);
    intervalId = null;
    startBtn.disabled = false;
    startBtn.textContent = "Resume";
    pauseBtn.disabled = true;
    announce("Paused");
  }

  function reset() {
    clearInterval(intervalId);
    intervalId = null;
    stepIndex = 0;
    secondsLeft = WARM_UP[0].seconds;
    startBtn.disabled = false;
    startBtn.textContent = "Start warm-up";
    pauseBtn.disabled = true;
    showStep();
  }

  function finish() {
    clearInterval(intervalId);
    intervalId = null;
    nameEl.textContent = "Warm-up done! 🎉";
    howEl.textContent = "Great work. Have a drink of water and start your session.";
    clockEl.textContent = "0:00";
    stepEl.textContent = "Finished";
    nextEl.textContent = "";
    barEl.style.width = "100%";
    startBtn.disabled = false;
    startBtn.textContent = "Start again";
    pauseBtn.disabled = true;
    stepIndex = 0;
    secondsLeft = WARM_UP[0].seconds;
    announce("Warm-up finished");
  }

  startBtn.addEventListener("click", start);
  pauseBtn.addEventListener("click", pause);
  resetBtn.addEventListener("click", reset);
  pauseBtn.disabled = true;
  showStep();
}

buildWarmUpList();
buildStrengthTable();
buildSimpleList("speed-list", SPEED, "rest");
buildEndurance();
buildSimpleList("mobility-list", MOBILITY);
buildSchedules();
setUpWarmUpTimer();
