// =========================================================
// plans.js: shows the business model from data/plans.js.
// Used on the Plans page AND the Home page. It only fills in
// the boxes that exist on the current page:
//   #plans-grid  -> the pricing cards
//   #challenge   -> this month's challenge
//   #faq-list    -> frequently asked questions
// =========================================================

import { PLANS, CHALLENGE, FAQS, CURRENCY, PLUS_BUY_LINK } from "./data/plans.js";
import { DRILLS } from "./data/drills.js";
import { isPlus } from "./plus.js";
import { escapeHTML } from "./storage.js";

function formatPrice(price) {
  if (price === 0) return "Free";
  return `${CURRENCY}${price.toLocaleString("en-IN")}`;
}

function planCardHTML(plan) {
  const soon = plan.status === "soon";
  // Plus is new, so it says "New" (we don't claim "most popular" without real sales)
  const badge = plan.highlight ? `<span class="plan__flag">${plan.id === "plus" ? "★ New" : "Recommended"}</span>` : "";
  const paymentsSoon = plan.id === "plus" && !PLUS_BUY_LINK;
  const status = soon ? `<span class="badge badge--intermediate">Launching soon</span>`
    : paymentsSoon ? `<span class="badge badge--intermediate">Payments open soon</span>`
    : `<span class="badge badge--beginner">Available now</span>`;
  let button = soon
    ? `<a class="btn btn--outline" href="${plan.cta.href}">Tell us what you'd pay</a>`
    : `<a class="btn btn--primary" href="${plan.cta.href}">${escapeHTML(plan.cta.label)}</a>`;
  if (plan.id === "plus") button = plusButtonHTML(plan);
  return `
    <article class="plan ${plan.highlight ? "plan--highlight" : ""} ${plan.id === "plus" ? "plan--plus" : ""}" id="${plan.id}" aria-labelledby="plan-${plan.id}">
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

// The Plus card's button:
// - Plus members see that they already have it
// - with a payment link (data/plans.js) it opens the payment page
// - without one yet, it says payments open soon
function plusButtonHTML(plan) {
  if (isPlus()) return `<p class="plus-owned">★ You're a Plus member</p><a class="btn btn--gold" href="planner.html">Open my Planner</a>`;
  if (PLUS_BUY_LINK) return `<a class="btn btn--gold btn--arrow" href="${PLUS_BUY_LINK}">${escapeHTML(plan.cta.label)}</a>`;
  return `<span class="btn btn--gold is-disabled" aria-disabled="true">Payments opening soon</span>
    <a class="plus-interest" href="feedback.html">Want Plus? Tell us</a>`;
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
