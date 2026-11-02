// =========================================================
// layout.js: builds the SAME header and footer on every page,
// so the navigation can never be different between pages.
// Each page has <div id="site-header"></div> and
// <div id="site-footer"></div>, and this file fills them in.
// =========================================================

import { BRAND, NAV_LINKS, FOOTER_GROUPS, DISCLAIMER } from "./config.js";
import { setUpMobileMenu } from "./nav.js";
import { startEffects } from "./effects.js";

// Work out which page we are on, e.g. "drills.html".
function getCurrentPage() {
  const file = window.location.pathname.split("/").pop();
  return file.endsWith(".html") ? file : "index.html"; // "/" means the Home page
}

// Makes one <li><a></a></li> for the menu.
// The current page gets aria-current="page" so it is highlighted.
function makeNavItem(link, currentPage) {
  const isCurrent = link.href === currentPage;
  const current = isCurrent ? ' aria-current="page"' : "";
  return `<li><a href="${link.href}"${current}>${link.label}</a></li>`;
}

function buildHeader(currentPage) {
  const items = NAV_LINKS.map((link) => makeNavItem(link, currentPage)).join("");
  return `
    <header class="site-header">
      <div class="container site-header__inner">
        <a class="brand" href="index.html" aria-label="${BRAND.name} home">
          <img src="${BRAND.logo}" alt="" width="38" height="38">
          <span>${BRAND.name}</span>
        </a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="main-nav">
          <span class="nav-toggle__bars" aria-hidden="true"></span>
          <span class="nav-toggle__text">Menu</span>
        </button>
        <nav class="main-nav" id="main-nav" aria-label="Main">
          <ul>${items}</ul>
        </nav>
      </div>
    </header>`;
}

// The "next step" card at the top of the footer changes with the page,
// so it never points to the page you are already on.
function footerCallToAction(currentPage) {
  if (currentPage === "programmes.html") {
    return { title: "Want drills for your position?", text: "25 drills for keepers, defenders, midfielders, wingers and strikers.", label: "Browse drills", href: "drills.html" };
  }
  if (currentPage === "tracker.html") {
    return { title: "Time for your next session?", text: "Your plan remembers where you got to.", label: "Open my plan", href: "programmes.html" };
  }
  return { title: "Ready for your next session?", text: "Two quick questions and you'll have a free 4-week plan.", label: "Get my plan", href: "programmes.html" };
}

function buildFooter(currentPage) {
  const year = new Date().getFullYear();
  const cta = footerCallToAction(currentPage);
  const groups = FOOTER_GROUPS.map((group) => `
    <nav class="footer-col" aria-label="Footer: ${group.title}">
      <h2>${group.title}</h2>
      <ul>${group.links.map((link) => makeNavItem(link, currentPage)).join("")}</ul>
    </nav>`).join("");

  return `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-cta">
          <div>
            <p class="footer-cta__title">${cta.title}</p>
            <p class="footer-cta__text">${cta.text}</p>
          </div>
          <a class="btn btn--primary btn--arrow" href="${cta.href}">${cta.label}</a>
        </div>

        <div class="footer-main">
          <div class="footer-about">
            <a class="footer-brand" href="index.html" aria-label="${BRAND.name} home">
              <img src="${BRAND.logo}" alt="" width="44" height="44">
              <span>${BRAND.name}</span>
            </a>
            <p>${BRAND.tagline} Structured football training for ${BRAND.audience}, founded in Mumbai by ${BRAND.founder}.</p>
            <ul class="footer-chips">
              <li>Free to start</li>
              <li>No sign-up</li>
              <li>Data stays on your device</li>
            </ul>
          </div>
          <div class="footer-links">${groups}</div>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="footer-touchline" aria-hidden="true"><span class="footer-ball"></span></div>
        <div class="container footer-bottom__inner">
          <p class="footer-safety">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#FFC857"/><rect x="10.8" y="5.5" width="2.4" height="8.5" rx="1" fill="#0D1B2A"/><rect x="10.8" y="16" width="2.4" height="2.4" rx="1" fill="#0D1B2A"/></svg>
            <span><strong>Safety:</strong> ${DISCLAIMER}</span>
          </p>
          <p class="footer-copy">© ${year} ${BRAND.name} · Founded by ${BRAND.founder}</p>
        </div>
      </div>
    </footer>`;
}

// Fill in any element with class "brand-name" with the brand name,
// so the name can be changed in config.js only.
function fillBrandName() {
  document.querySelectorAll(".brand-name").forEach((el) => {
    el.textContent = BRAND.name;
  });
  document.querySelectorAll(".founder-name").forEach((el) => {
    el.textContent = BRAND.founder;
  });
  document.querySelectorAll(".brand-tagline").forEach((el) => {
    el.textContent = BRAND.tagline;
  });
  document.querySelectorAll(".brand-disclaimer").forEach((el) => {
    el.textContent = DISCLAIMER;
  });
}

// Set the browser tab title, e.g. "Drills | PITCHPATH".
function setTitle() {
  const pageTitle = document.body.dataset.title;
  document.title = pageTitle ? `${pageTitle} | ${BRAND.name}` : `${BRAND.name}: ${BRAND.tagline}`;
}

function buildLayout() {
  const currentPage = getCurrentPage();
  const headerSlot = document.getElementById("site-header");
  const footerSlot = document.getElementById("site-footer");
  if (headerSlot) headerSlot.outerHTML = buildHeader(currentPage);
  if (footerSlot) footerSlot.outerHTML = buildFooter(currentPage);
  fillBrandName();
  setTitle();
  setUpMobileMenu();
  startEffects(); // animations (see effects.js)
}

buildLayout();
