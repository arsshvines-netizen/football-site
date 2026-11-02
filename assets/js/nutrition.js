// =========================================================
// nutrition.js: the Nutrition page.
// - Turns the page into tabs (one topic at a time, see tabs.js)
// - Draws the football plate (slices pop in one by one)
// - Builds the match-day timeline
// - Meal ideas with two switches: which day, and veg / non-veg
// - Myth cards that flip over to show the fact
// =========================================================

import { PLATE, TIMELINE, SAMPLE_DAYS, MYTHS } from "./data/nutrition.js";
import { setUpTabs, setUpSwitch } from "./tabs.js";
import { escapeHTML } from "./storage.js";

// Draws the plate as a pie chart in SVG. Each slice is numbered,
// and the key next to it explains the numbers, so colour is not
// the only clue.
function buildPlate() {
  const size = 240, centre = 120, radius = 100;
  let angle = -Math.PI / 2; // start at the top
  const slices = PLATE.map((part, i) => {
    const sliceAngle = (part.percent / 100) * Math.PI * 2;
    const x1 = centre + radius * Math.cos(angle);
    const y1 = centre + radius * Math.sin(angle);
    const midAngle = angle + sliceAngle / 2;
    angle += sliceAngle;
    const x2 = centre + radius * Math.cos(angle);
    const y2 = centre + radius * Math.sin(angle);
    const largeArc = sliceAngle > Math.PI ? 1 : 0;
    const labelX = centre + radius * 0.62 * Math.cos(midAngle);
    const labelY = centre + radius * 0.62 * Math.sin(midAngle);
    const darkText = ["#FFC857", "#F26B21", "#4A90C2"].includes(part.color);
    return `
      <g class="plate-slice" style="animation-delay:${i * 150}ms">
        <path d="M${centre},${centre} L${x1.toFixed(1)},${y1.toFixed(1)} A${radius},${radius} 0 ${largeArc} 1 ${x2.toFixed(1)},${y2.toFixed(1)} Z"
          fill="${part.color}" stroke="#FFFFFF" stroke-width="3"/>
        <text x="${labelX.toFixed(1)}" y="${(labelY + 6).toFixed(1)}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="16" fill="${darkText ? "#0D1B2A" : "#FFFFFF"}">${i + 1}</text>
      </g>`;
  }).join("");

  const description = PLATE.map((p) => `${p.label} about ${p.percent}%`).join(", ");
  document.getElementById("plate-svg").innerHTML = `
    <svg viewBox="0 0 ${size} ${size}" role="img" aria-label="The football plate: ${description}">
      <circle cx="${centre}" cy="${centre}" r="${radius + 14}" fill="#FFFFFF" stroke="#D5DDE3" stroke-width="3"/>
      ${slices}
    </svg>`;

  document.getElementById("plate-key").innerHTML = PLATE.map((p, i) => `
    <li>
      <span class="plate-swatch" style="background:${p.color}" aria-hidden="true">${i + 1}</span>
      <span><strong>${escapeHTML(p.label)}</strong> · about ${p.percent >= 30 ? "a third" : p.percent >= 20 ? "a fifth" : "a small part"} of the plate<br>
      <span class="muted">${escapeHTML(p.examples)}</span></span>
    </li>`).join("");
}

function buildTimeline() {
  document.getElementById("timeline").innerHTML = TIMELINE.map((t) => `
    <li class="timeline__item">
      <span class="timeline__when">${escapeHTML(t.when)}</span>
      <div class="timeline__card">
        <h3>${escapeHTML(t.what)}</h3>
        <p>${escapeHTML(t.examples)}</p>
      </div>
    </li>`).join("");
}

// ---------- Meal ideas: two switches ----------

const mealChoice = { day: "Training day", diet: "veg" };

// A small picture for each meal, chosen from its name
function mealIcon(name) {
  const n = name.toLowerCase();
  if (n.includes("breakfast")) return "🌅";
  if (n.includes("before")) return "⚽";
  if (n.includes("dinner")) return "🍛";
  if (n.includes("lunch")) return "🥪";
  if (n.includes("drink")) return "💧";
  return "🍎"; // snacks
}

function showMeals() {
  const meals = SAMPLE_DAYS[mealChoice.day];
  document.getElementById("sample-days").innerHTML = meals.map((m, i) => {
    const icon = mealIcon(m.meal);
    return `
      <li class="meal" style="animation-delay:${i * 60}ms">
        <span class="meal__icon" aria-hidden="true">${icon}</span>
        <span class="meal__when">${escapeHTML(m.meal)}</span>
        <span class="meal__what">${escapeHTML(m[mealChoice.diet])}</span>
      </li>`;
  }).join("");
}

// ---------- Myth cards that flip ----------

function buildMyths() {
  const list = document.getElementById("myth-list");
  list.innerHTML = MYTHS.map((m, i) => `
    <button type="button" class="flip" aria-expanded="false" aria-controls="fact-${i}">
      <span class="flip__inner">
        <span class="flip__face flip__front">
          <span class="flip__label flip__label--myth">Myth?</span>
          <span class="flip__text">"${escapeHTML(m.myth)}"</span>
          <span class="flip__hint">Tap to see the fact ↻</span>
        </span>
        <span class="flip__face flip__back" id="fact-${i}" aria-hidden="true">
          <span class="flip__label flip__label--fact">✓ Fact</span>
          <span class="flip__text">${escapeHTML(m.fact)}</span>
        </span>
      </span>
    </button>`).join("");

  list.addEventListener("click", (event) => {
    const card = event.target.closest(".flip");
    if (!card) return;
    const flipped = card.getAttribute("aria-expanded") === "true";
    card.setAttribute("aria-expanded", String(!flipped));
    card.querySelector(".flip__back").setAttribute("aria-hidden", String(flipped));
  });
}

// ---------- Start ----------

buildPlate();
buildTimeline();
buildMyths();
setUpSwitch(document.getElementById("day-switch"), (day) => { mealChoice.day = day; showMeals(); });
setUpSwitch(document.getElementById("diet-switch"), (diet) => { mealChoice.diet = diet; showMeals(); });
setUpTabs(document.querySelector("[data-tabs]"));
