// =========================================================
// plans.js: shows the business model from data/plans.js.
// Used on the Plans page AND the Home page. It only fills in
// the boxes that exist on the current page:
//   #plans-grid  -> the pricing cards
//   #challenge   -> this month's challenge
//   #faq-list    -> frequently asked questions
// =========================================================

import { PLANS, CHALLENGE, FAQS, CURRENCY } from "./data/plans.js";
import { DRILLS } from "./data/drills.js";
import { escapeHTML } from "./storage.js";

function formatPrice(price) {
  if (price === 0) return "Free";
  return `${CURRENCY}${price.toLocaleString("en-IN")}`;
}

function planCardHTML(plan) {
  const soon = plan.status === "soon";
  const badge = plan.highlight ? `<span class="plan__flag">Most popular</span>` : "";
  const status = soon ? `<span class="badge badge--intermediate">Launching soon</span>` : `<span class="badge badge--beginner">Available now</span>`;
  const button = soon
    ? `<a class="btn btn--outline" href="${plan.cta.href}">Tell us what you'd pay</a>`
    : `<a class="btn btn--primary" href="${plan.cta.href}">${escapeHTML(plan.cta.label)}</a>`;
  return `
    <article class="plan ${plan.highlight ? "plan--highlight" : ""}" aria-labelledby="plan-${plan.id}">
      ${badge}
      <p class="plan__status">${status}</p>
      <h3 id="plan-${plan.id}">${escapeHTML(plan.name)}</h3>
      <p class="plan__price"><span class="plan__amount">${formatPrice(plan.price)}</span> <span class="plan__period">${escapeHTML(plan.period)}</span></p>
      ${plan.yearly ? `<p class="plan__note">${escapeHTML(plan.yearly)}</p>` : ""}
      <p>${escapeHTML(plan.tagline)}</p>
      <ul class="check-list">${plan.features.map((f) => `<li>${escapeHTML(f)}</li>`).join("")}</ul>
      <div class="plan__cta">${button}</div>
    </article>`;
}

function buildPlans() {
  const grid = document.getElementById("plans-grid");
  if (!grid) return;
  grid.innerHTML = PLANS.map(planCardHTML).join("");
}

function buildChallenge() {
  const box = document.getElementById("challenge");
  if (!box) return;
  const month = new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const drill = DRILLS.find((d) => d.id === CHALLENGE.drill);
  const drillLink = drill ? `<a class="btn btn--outline btn--small" href="drills.html?drill=${drill.id}">See the drill: ${escapeHTML(drill.name)}</a>` : "";
  box.innerHTML = `
    <span class="eyebrow">Challenge of the month · ${month}</span>
    <h2 id="challenge-title">${escapeHTML(CHALLENGE.title)}</h2>
    <p class="lead">${escapeHTML(CHALLENGE.goal)}</p>
    <!-- The rules are tucked away so the card stays short -->
    <details class="challenge__more">
      <summary>How it works and the reward</summary>
      <ul class="challenge__steps">
        <li><strong>How:</strong> ${escapeHTML(CHALLENGE.how)}</li>
        <li><strong>Reward:</strong> ${escapeHTML(CHALLENGE.reward)}</li>
      </ul>
    </details>
    <div class="btn-row">
      <a class="btn btn--primary" href="tracker.html#log-session">Log today's session</a>
      ${drillLink}
    </div>`;
}

function buildFAQ() {
  const list = document.getElementById("faq-list");
  if (!list) return;
  list.innerHTML = FAQS.map((item) => `
    <details class="faq">
      <summary>${escapeHTML(item.q)}</summary>
      <p>${escapeHTML(item.a)}</p>
    </details>`).join("");
}

buildPlans();
buildChallenge();
buildFAQ();
