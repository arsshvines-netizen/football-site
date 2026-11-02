// =========================================================
// storage.js: safe helpers for localStorage.
// localStorage keeps data in THIS browser on THIS device only.
// Every read and write is wrapped in try/catch, because
// storage can be turned off (e.g. some private modes).
// =========================================================

// Check once whether storage works at all.
export function isStorageAvailable() {
  try {
    const testKey = "__storage_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}

// Read and parse JSON. Returns `fallback` if nothing is saved or it breaks.
export function loadData(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Could not read saved data:", error);
    return fallback;
  }
}

// Save any value as JSON. Returns true if it worked.
export function saveData(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn("Could not save data:", error);
    return false;
  }
}

export function removeData(key) {
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    return false;
  }
}

// Make the browser download some text as a file (used for exports).
export function downloadFile(filename, text, type = "application/json") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

// Turn text into safe HTML text (stops notes from breaking the page).
export function escapeHTML(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// Shows a "Are you sure?" box inside the page (instead of the browser's
// confirm(), which some viewers block). Returns a Promise:
// true if the player clicks the confirm button, false if they cancel.
export function askToConfirm(message, confirmLabel = "Yes, continue") {
  return new Promise((resolve) => {
    const dialog = document.createElement("dialog");
    dialog.className = "modal confirm-dialog";
    dialog.setAttribute("aria-labelledby", "confirm-title");
    dialog.innerHTML = `
      <div class="modal__header"><h2 id="confirm-title">Are you sure?</h2></div>
      <div class="modal__body">
        <p>${escapeHTML(message)}</p>
        <div class="btn-row">
          <button type="button" class="btn btn--danger" data-answer="yes">${escapeHTML(confirmLabel)}</button>
          <button type="button" class="btn btn--outline" data-answer="no">Cancel</button>
        </div>
      </div>`;
    document.body.appendChild(dialog);
    const returnFocus = document.activeElement;
    let answer = false;
    dialog.addEventListener("click", (event) => {
      const button = event.target.closest("[data-answer]");
      if (!button) return;
      answer = button.dataset.answer === "yes";
      dialog.close();
    });
    // Escape key or Cancel both count as "no"
    dialog.addEventListener("close", () => {
      dialog.remove();
      if (returnFocus) returnFocus.focus();
      resolve(answer);
    });
    dialog.showModal();
    dialog.querySelector('[data-answer="no"]').focus();
  });
}
