// =========================================================
// nav.js: the mobile menu (hamburger button).
// Opens and closes by tap/click, Enter or Space (buttons do
// this automatically) and closes with the Escape key.
// =========================================================

export function setUpMobileMenu() {
  const button = document.querySelector(".nav-toggle");
  const menu = document.getElementById("main-nav");
  if (!button || !menu) return;

  const label = button.querySelector(".nav-toggle__text");

  function openMenu() {
    menu.classList.add("is-open");
    button.setAttribute("aria-expanded", "true");
    label.textContent = "Close";
  }

  function closeMenu() {
    menu.classList.remove("is-open");
    button.setAttribute("aria-expanded", "false");
    label.textContent = "Menu";
  }

  button.addEventListener("click", () => {
    const isOpen = button.getAttribute("aria-expanded") === "true";
    if (isOpen) closeMenu();
    else openMenu();
  });

  // Escape closes the menu and puts focus back on the button.
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && button.getAttribute("aria-expanded") === "true") {
      closeMenu();
      button.focus();
    }
  });

  // If the screen gets wide (e.g. tablet rotated), reset the menu.
  window.matchMedia("(min-width: 1025px)").addEventListener("change", closeMenu);
}
