// =========================================================
// effects.js: animations and moving parts for every page.
// Loaded once by layout.js. It adds:
//   1. Fade-up "reveal" when things scroll into view
//   2. Numbers that count up (elements with data-count)
//   3. A thin progress bar showing how far down the page you are
//   4. A header that gets a shadow once you scroll
//   5. A gentle 3D tilt on cards when the mouse moves over them
//   6. A "back to top" button
//
// If someone has "reduce motion" turned on in their device
// settings, ONLY the helpful parts (progress bar, back-to-top)
// run, and nothing moves or hides.
// =========================================================

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Things that fade up automatically on every page
const AUTO_REVEAL = [
  "main .card", "main .plan", "main .timeline__item", "main .content-section > h2",
  "main .section h2", "main .programme-choice", "main .chart-card", "main .badge-tile",
  "main .faq", "main .schedule", "main .source", "main .stat", "main .career__item",
  "main .tile", "main .photo-card", "main .flip", "main .fit-card",
  ".site-footer .footer-cta", ".site-footer .footer-about", ".site-footer .footer-col",
].join(",");

// ---------- 1. Reveal on scroll ----------

function setUpReveal() {
  if (reduceMotion || !("IntersectionObserver" in window)) return;
  // Only hide things once we know JavaScript can show them again
  document.documentElement.classList.add("js-motion");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

  function watch(root) {
    root.querySelectorAll(`[data-reveal], ${AUTO_REVEAL}`).forEach((el) => {
      if (el.dataset.revealWatched || el.closest("dialog")) return;
      el.dataset.revealWatched = "yes";
      el.setAttribute("data-reveal", "");
      // Small delay for items in a row, so they appear one after another
      const siblings = [...el.parentElement.children];
      const index = Math.min(siblings.indexOf(el), 5);
      el.style.setProperty("--reveal-delay", `${index * 70}ms`);
      observer.observe(el);
    });
  }

  watch(document);
  // Pages that build content with JavaScript (drills, tracker...) add
  // new elements later, so watch for those too.
  const main = document.getElementById("main");
  if (main) {
    new MutationObserver(() => watch(main)).observe(main, { childList: true, subtree: true });
  }
}

// ---------- 1b. "In view" hook (nothing is hidden) ----------
// Elements with data-in-view get the class "in-view" the first time
// they appear on screen. CSS uses it to start an animation then
// (for example, a line that draws itself).

function setUpInView() {
  const items = document.querySelectorAll("[data-in-view]");
  if (!items.length) return;
  if (reduceMotion || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in-view"));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });
  items.forEach((el) => observer.observe(el));
}

// ---------- 2. Count-up numbers ----------

function countUp(el) {
  const target = Number(el.dataset.count);
  const duration = 1200;
  const start = performance.now();
  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // fast then slow
    el.textContent = Math.round(target * eased);
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function setUpCounters() {
  const counters = document.querySelectorAll("[data-count]");
  if (!counters.length || reduceMotion || !("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        countUp(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });
  counters.forEach((el) => observer.observe(el));
}

// ---------- 3 + 4. Scroll progress bar and header shadow ----------

function setUpScrollEffects() {
  const bar = document.createElement("div");
  bar.className = "scroll-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.prepend(bar);

  let ticking = false;
  function update() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? window.scrollY / max : 0;
    bar.style.transform = `scaleX(${progress})`;
    const header = document.querySelector(".site-header");
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 12);
    const topButton = document.querySelector(".back-to-top");
    if (topButton) topButton.classList.toggle("is-shown", window.scrollY > 700);
    ticking = false;
  }
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
}

// ---------- 5. Card tilt (mouse only) ----------

function setUpTilt() {
  if (reduceMotion || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  document.addEventListener("pointermove", (event) => {
    const card = event.target.closest(".card--link, .plan, .position-picker a, .programme-choice");
    if (!card) return;
    const box = card.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;  // -0.5 to 0.5
    const y = (event.clientY - box.top) / box.height - 0.5;
    card.style.setProperty("--tilt-x", `${(-y * 6).toFixed(2)}deg`);
    card.style.setProperty("--tilt-y", `${(x * 6).toFixed(2)}deg`);
    card.classList.add("is-tilting");
  });
  document.addEventListener("pointerout", (event) => {
    const card = event.target.closest(".is-tilting");
    if (card && !card.contains(event.relatedTarget)) {
      card.classList.remove("is-tilting");
      card.style.removeProperty("--tilt-x");
      card.style.removeProperty("--tilt-y");
    }
  });
}

// ---------- 6. Back to top ----------

function setUpBackToTop() {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "back-to-top";
  button.setAttribute("aria-label", "Back to top");
  button.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V6M6 11l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    const skip = document.querySelector(".skip-link");
    if (skip) skip.focus({ preventScroll: true });
  });
  document.body.appendChild(button);
}

export function startEffects() {
  // SVG animations (like the rolling ball) aren't stopped by CSS, so pause them here
  if (reduceMotion) document.querySelectorAll("svg").forEach((svg) => svg.pauseAnimations && svg.pauseAnimations());
  setUpReveal();
  setUpInView();
  setUpCounters();
  setUpBackToTop();
  setUpScrollEffects();
  setUpTilt();
}
