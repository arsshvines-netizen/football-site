// =========================================================
// sources-page.js: shows data/sources.js on the Sources page
// as an A-Z list in MLA 9 style.
// =========================================================

import { SOURCES } from "./data/sources.js";
import { escapeHTML } from "./storage.js";

// Builds one MLA 9 citation:
// Author. "Title." Container, Publisher, Date, Location. Accessed Date.
function formatMLA(source) {
  let text = `${escapeHTML(source.author)}. `;
  text += `"${escapeHTML(source.title)}." `;
  const parts = [];
  if (source.container) parts.push(`<em>${escapeHTML(source.container)}</em>`);
  if (source.publisher) parts.push(escapeHTML(source.publisher));
  if (source.date) parts.push(escapeHTML(source.date));
  if (source.location) {
    parts.push(source.url
      ? `<a href="${escapeHTML(source.url)}" rel="noopener">${escapeHTML(source.location)}</a>`
      : escapeHTML(source.location));
  }
  if (parts.length) text += `${parts.join(", ")}.`;
  if (source.accessed) text += ` Accessed ${escapeHTML(source.accessed)}.`;
  return text;
}

function buildSources() {
  const sorted = [...SOURCES].sort((a, b) => a.author.localeCompare(b.author));
  document.getElementById("source-list").innerHTML = sorted.map((source) => {
    const flag = source.checked
      ? ""
      : `<p class="flag">To do: open this source, check it supports the content, add the link if missing, and add your access date.</p>`;
    return `
      <li class="source">
        <p class="source__citation">${formatMLA(source)}</p>
        <p class="muted"><strong>Used for:</strong> ${escapeHTML(source.usedFor)}</p>
        ${flag}
      </li>`;
  }).join("");
  document.getElementById("source-count").textContent = SOURCES.length;
}

buildSources();
