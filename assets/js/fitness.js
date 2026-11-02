// =========================================================
// fitness.js: the Fitness page.
// - Turns the page into tabs (one topic at a time, see tabs.js)
// - Fills each tab from data/fitness.js
// - Runs the warm-up timer (with a progress ring, and the
//   current move highlighted in the list)
// - Level switchers for Strength and the example week
// =========================================================

import { WARM_UP_VIDEOS, WARM_UP_FULL_VIDEO } from "./data/videos.js";
import { videoHTML, openVideo } from "./video.js";
import { WARM_UP, STRENGTH, SPEED, ENDURANCE, MOBILITY, WEEKLY_SCHEDULES } from "./data/fitness.js";
import { setUpTabs, setUpSwitch } from "./tabs.js";
import { escapeHTML } from "./storage.js";

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

// ---------- Warm-up list ----------

function buildWarmUpList() {
  document.getElementById("warmup-list").innerHTML = WARM_UP.map((step, i) => `
    <li class="move" data-move="${i}">
      <span class="move__num" aria-hidden="true">${i + 1}</span>
      <span class="move__text"><strong>${escapeHTML(step.name)}</strong><span>${escapeHTML(step.how)}</span>
        ${WARM_UP_VIDEOS[step.name] ? `<button type="button" class="move__watch" data-watch="${i}" aria-label="Watch: ${escapeHTML(step.name)}">▶ Watch</button>` : ""}</span>
      <span class="move__time">${formatTime(step.seconds)}</span>
    </li>`).join("");
  // The whole warm-up as one video (only shown once a video is added)
  document.getElementById("warmup-video").innerHTML = videoHTML(WARM_UP_FULL_VIDEO, "Watch the full warm-up");
  // "▶ Watch" opens that move's clip in a popup
  document.getElementById("warmup-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-watch]");
    if (!button) return;
    const step = WARM_UP[Number(button.dataset.watch)];
    openVideo(WARM_UP_VIDEOS[step.name], step.name, button);
  });
  const total = WARM_UP.reduce((sum, s) => sum + s.seconds, 0);
  document.getElementById("warmup-total").textContent = `${Math.round(total / 60)} minutes`;
}

// ---------- Speed, stamina and cool-down ----------

function buildSpeed() {
  const styles = ["", "tile--orange", "tile--navy", "tile--yellow"];
  document.getElementById("speed-list").innerHTML = SPEED.map((s, i) => `
    <div class="tile ${styles[i % 4]}">
      <h3>${escapeHTML(s.name)}</h3>
      <p>${escapeHTML(s.how)}</p>
      <p class="tile__rest"><strong>Rest:</strong> ${escapeHTML(s.rest)}</p>
    </div>`).join("");
}

function buildEndurance() {
  const styles = ["", "tile--orange", "tile--navy"];
  document.getElementById("endurance-cards").innerHTML = ENDURANCE.map((e, i) => `
    <div class="tile ${styles[i]}">
      <span class="badge badge--${e.level.toLowerCase()}">${escapeHTML(e.level)}</span>
      <p style="margin-top:var(--space-2)">${escapeHTML(e.plan)}</p>
    </div>`).join("");
}

function buildMobility() {
  document.getElementById("mobility-list").innerHTML = MOBILITY.map((m) => `
    <li class="move"><span class="move__text"><strong>${escapeHTML(m.name)}</strong><span>${escapeHTML(m.how)}</span></span></li>`).join("");
}

// ---------- Strength (changes with the level switcher) ----------

function showStrength(level) {
  const styles = ["", "tile--orange", "tile--navy", "tile--yellow"];
  document.getElementById("strength-list").innerHTML = STRENGTH.map((ex, i) => `
    <div class="tile ${styles[i % 4]}">
      <h3>${escapeHTML(ex.name)}</h3>
      <span class="tile__big">${escapeHTML(ex[level])}</span>
      <p>${escapeHTML(ex.how)}</p>
    </div>`).join("");
}

// ---------- Example week (changes with the level switcher) ----------

function dayIcon(plan) {
  if (/rest/i.test(plan) && !/programme/i.test(plan)) return { icon: "😴", type: "rest" };
  if (/match/i.test(plan)) return { icon: "⚽", type: "match" };
  if (/club/i.test(plan)) return { icon: "👥", type: "club" };
  return { icon: "📋", type: "plan" };
}

function showSchedule(level) {
  const schedule = WEEKLY_SCHEDULES[level];
  document.getElementById("schedule-note").textContent = schedule.note;
  document.getElementById("schedule-days").innerHTML = schedule.days.map(([day, plan]) => {
    const { icon, type } = dayIcon(plan);
    return `
      <li class="day day--${type}">
        <span class="day__name">${day.slice(0, 3)}</span>
        <span class="day__icon" aria-hidden="true">${icon}</span>
        <span class="day__plan">${escapeHTML(plan)}</span>
      </li>`;
  }).join("");
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
  const ringEl = document.getElementById("timer-ring");
  const announceEl = document.getElementById("timer-announce");
  const RING_LENGTH = 326.7; // the circle's outline length (2 x pi x 52)
  const totalSeconds = WARM_UP.reduce((sum, s) => sum + s.seconds, 0);

  let stepIndex = 0;
  let secondsLeft = WARM_UP[0].seconds;
  let intervalId = null;

  function secondsDone() {
    const before = WARM_UP.slice(0, stepIndex).reduce((sum, s) => sum + s.seconds, 0);
    return before + (WARM_UP[stepIndex].seconds - secondsLeft);
  }

  // Highlight the current move in the list next to the timer
  function highlightMove() {
    document.querySelectorAll("#warmup-list .move").forEach((li) => {
      const i = Number(li.dataset.move);
      li.classList.toggle("is-current", i === stepIndex && intervalId !== null);
      li.classList.toggle("is-done", i < stepIndex);
    });
  }

  function showStep() {
    const step = WARM_UP[stepIndex];
    nameEl.textContent = step.name;
    howEl.textContent = step.how;
    clockEl.textContent = formatTime(secondsLeft);
    stepEl.textContent = `Move ${stepIndex + 1} of ${WARM_UP.length}`;
    const next = WARM_UP[stepIndex + 1];
    nextEl.textContent = next ? `Next: ${next.name}` : "Last one!";
    barEl.style.width = `${((step.seconds - secondsLeft) / step.seconds) * 100}%`;
    ringEl.style.strokeDashoffset = RING_LENGTH * (1 - secondsDone() / totalSeconds);
    highlightMove();
  }

  // Screen readers hear the move name only when it changes (not every second)
  function announce(text) { announceEl.textContent = text; }

  function tick() {
    secondsLeft -= 1;
    if (secondsLeft <= 0) {
      stepIndex += 1;
      if (stepIndex >= WARM_UP.length) { finish(); return; }
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
    highlightMove();
  }

  function pause() {
    clearInterval(intervalId);
    intervalId = null;
    startBtn.disabled = false;
    startBtn.textContent = "Resume";
    pauseBtn.disabled = true;
    announce("Paused");
    highlightMove();
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
    ringEl.style.strokeDashoffset = 0;
    startBtn.disabled = false;
    startBtn.textContent = "Start again";
    pauseBtn.disabled = true;
    stepIndex = 0;
    secondsLeft = WARM_UP[0].seconds;
    document.querySelectorAll("#warmup-list .move").forEach((li) => { li.classList.remove("is-current"); li.classList.add("is-done"); });
    announce("Warm-up finished");
  }

  startBtn.addEventListener("click", start);
  pauseBtn.addEventListener("click", pause);
  resetBtn.addEventListener("click", reset);
  pauseBtn.disabled = true;
  showStep();
}

// ---------- Start ----------

buildWarmUpList();
buildSpeed();
buildEndurance();
buildMobility();
setUpSwitch(document.getElementById("strength-level"), showStrength);
setUpSwitch(document.getElementById("schedule-level"), showSchedule);
setUpWarmUpTimer();
setUpTabs(document.querySelector("[data-tabs]"));
