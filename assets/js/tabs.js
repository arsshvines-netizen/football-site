// =========================================================
// tabs.js: reusable tabs ("one topic at a time").
// Used on the Fitness, Nutrition and Tracker pages so they
// stay short and tidy.
//
// HTML needed:
//   <div class="tabset" data-tabs>
//     <div class="tabset__list" role="tablist" aria-label="...">
//       <button role="tab" aria-controls="warm-up">Warm-up</button> ...
//     </div>
//     <section role="tabpanel" id="warm-up"> ... </section> ...
//   </div>
//
// - The first tab opens by default, OR the one named in the
//   link, e.g. fitness.html#strength opens the Strength tab.
// - A coloured "pill" slides behind the selected tab.
// - Arrow keys, Home and End move between tabs.
// =========================================================

export function setUpTabs(tabset, onChange) {
  const list = tabset.querySelector('[role="tablist"]');
  const tabs = [...list.querySelectorAll('[role="tab"]')];
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute("aria-controls")));

  // The sliding pill behind the selected tab
  const pill = document.createElement("span");
  pill.className = "tabset__pill";
  pill.setAttribute("aria-hidden", "true");
  list.appendChild(pill);

  // Give every tab an id so its panel can point back to it
  tabs.forEach((tab, i) => {
    if (!tab.id) tab.id = `tab-${panels[i].id}`;
    panels[i].setAttribute("aria-labelledby", tab.id);
    panels[i].setAttribute("role", "tabpanel");
    panels[i].tabIndex = 0;
  });

  function movePill(tab) {
    pill.style.width = `${tab.offsetWidth}px`;
    pill.style.transform = `translateX(${tab.offsetLeft}px)`;
  }

  function select(index, { updateHash = true, focus = false } = {}) {
    tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[i].hidden = !selected;
    });
    const tab = tabs[index];
    movePill(tab);
    // Keep the selected tab visible in the scrolling row on phones
    list.scrollTo({ left: tab.offsetLeft - 24, behavior: "smooth" });
    if (focus) tab.focus();
    if (updateHash) history.replaceState(null, "", `#${panels[index].id}`);
    if (onChange) onChange(panels[index].id);
  }

  list.addEventListener("click", (event) => {
    const tab = event.target.closest('[role="tab"]');
    if (!tab) return;
    select(tabs.indexOf(tab));
    // If the tabs are scrolled off the top of the screen, bring them back
    const top = tabset.getBoundingClientRect().top;
    if (top < 0) tabset.scrollIntoView({ block: "start" });
  });

  list.addEventListener("keydown", (event) => {
    const current = tabs.indexOf(document.activeElement);
    if (current === -1) return;
    let next = null;
    if (event.key === "ArrowRight") next = (current + 1) % tabs.length;
    if (event.key === "ArrowLeft") next = (current - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    if (next === null) return;
    event.preventDefault();
    select(next, { focus: true });
  });

  // Open the tab named in the link (e.g. #safety), if there is one
  function fromHash() {
    const id = window.location.hash.slice(1);
    const index = panels.findIndex((panel) => panel.id === id);
    return index;
  }

  window.addEventListener("hashchange", () => {
    const index = fromHash();
    if (index !== -1) {
      select(index, { updateHash: false });
      panels[index].scrollIntoView({ block: "start" });
    }
  });
  window.addEventListener("resize", () => {
    const selected = tabs.find((t) => t.getAttribute("aria-selected") === "true");
    if (selected) movePill(selected);
  });

  // The browser scrolls to the named panel by itself (CSS scroll-margin
  // leaves room for the header and the tabs). It may also focus the
  // panel, which would draw an outline, so we remove that focus.
  const start = fromHash();
  select(start === -1 ? 0 : start, { updateHash: false });
  if (start !== -1) {
    window.addEventListener("load", () => {
      if (document.activeElement === panels[start]) panels[start].blur();
    });
  }
}

// Small helper for "level switchers" (Beginner / Intermediate / Advanced
// buttons). Calls onPick(value) when one is pressed.
export function setUpSwitch(group, onPick) {
  const buttons = [...group.querySelectorAll("button[data-value]")];
  function pick(button) {
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
    onPick(button.dataset.value);
  }
  group.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-value]");
    if (button) pick(button);
  });
  pick(buttons.find((b) => b.getAttribute("aria-pressed") === "true") || buttons[0]);
}
