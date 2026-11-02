// =========================================================
// layout.js: builds the SAME header and footer on every page,
// so the navigation can never be different between pages.
// Each page has <div id="site-header"></div> and
// <div id="site-footer"></div>, and this file fills them in.
// =========================================================

import { BRAND, NAV_LINKS, FOOTER_EXTRA_LINKS, DISCLAIMER } from "./config.js";
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

function buildFooter(currentPage) {
  const mainLinks = NAV_LINKS.map((link) => makeNavItem(link, currentPage)).join("");
  const extraLinks = FOOTER_EXTRA_LINKS.map((link) => makeNavItem(link, currentPage)).join("");
  const year = new Date().getFullYear();
  return `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <p class="footer-brand"><img src="${BRAND.logo}" alt="" width="40" height="40">${BRAND.name}</p>
            <p>${BRAND.tagline} Free, structured football training for ${BRAND.audience}.</p>
          </div>
          <nav aria-label="Footer: main pages">
            <h2>Train</h2>
            <ul>${mainLinks}</ul>
          </nav>
          <nav aria-label="Footer: more">
            <h2>More</h2>
            <ul>${extraLinks}</ul>
          </nav>
        </div>
        <p class="footer-disclaimer"><strong>Disclaimer:</strong> ${DISCLAIMER}</p>
        <p class="footer-disclaimer">© ${year} ${BRAND.name}. Founded by ${BRAND.founder}. Your data stays on your device.</p>
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
