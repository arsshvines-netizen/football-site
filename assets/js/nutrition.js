// =========================================================
// nutrition.js: builds the football plate picture, the
// timeline, the sample days (with a veg / non-veg switch)
// and the myths vs facts on the Nutrition page.
// =========================================================

import { PLATE, TIMELINE, SAMPLE_DAYS, MYTHS } from "./data/nutrition.js";
import { escapeHTML } from "./storage.js";

// Draws the plate as a pie chart in SVG. Each slice is labelled
// in the key next to it, so colour is not the only clue.
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
    const textColor = part.color === "#FFC857" || part.color === "#F26B21" || part.color === "#4A90C2" ? "#0D1B2A" : "#FFFFFF";
    return `
      <path d="M${centre},${centre} L${x1.toFixed(1)},${y1.toFixed(1)} A${radius},${radius} 0 ${largeArc} 1 ${x2.toFixed(1)},${y2.toFixed(1)} Z"
        fill="${part.color}" stroke="#FFFFFF" stroke-width="3"/>
      <text x="${labelX.toFixed(1)}" y="${(labelY + 6).toFixed(1)}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="16" fill="${textColor}">${i + 1}</text>`;
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
      <span><strong>${i + 1}. ${escapeHTML(p.label)}</strong> (about ${p.percent >= 30 ? "a third" : p.percent >= 20 ? "a fifth" : "a small part"} of the plate)<br>
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

function buildSampleDays(choice) {
  const key = choice === "nonVeg" ? "nonVeg" : "veg";
  document.getElementById("sample-days").innerHTML = Object.entries(SAMPLE_DAYS).map(([dayName, meals]) => `
    <div class="card ${dayName === "Rest day" ? "card--navy" : ""}">
      <h3>${escapeHTML(dayName)}</h3>
      <dl class="meal-list">
        ${meals.map((m) => `<div><dt>${escapeHTML(m.meal)}</dt><dd>${escapeHTML(m[key])}</dd></div>`).join("")}
      </dl>
    </div>`).join("");
}

function setUpMealSwitch() {
  const radios = document.querySelectorAll("input[name=meal-type]");
  radios.forEach((radio) => radio.addEventListener("change", () => buildSampleDays(radio.value)));
  buildSampleDays("veg");
}

function buildMyths() {
  document.getElementById("myth-list").innerHTML = MYTHS.map((m) => `
    <div class="myth card">
      <p class="myth__label myth__label--myth"><span aria-hidden="true">✗</span> Myth</p>
      <p class="myth__text">${escapeHTML(m.myth)}</p>
      <p class="myth__label myth__label--fact"><span aria-hidden="true">✓</span> Fact</p>
      <p>${escapeHTML(m.fact)}</p>
    </div>`).join("");
}

buildPlate();
buildTimeline();
setUpMealSwitch();
buildMyths();
