// =========================================================
// video.js: shows training videos (files listed in
// data/videos.js). Two helpers:
//   videoHTML(file, label)   a video player to put in a page
//   openVideo(file, title)   the same player in a popup
// If there's no file yet, videoHTML returns "" (nothing shown).
// Videos never play on their own: the player presses play.
// =========================================================

import { videoPath } from "./data/videos.js";
import { escapeHTML } from "./storage.js";

export function videoHTML(file, label) {
  const src = videoPath(file);
  if (!src) return "";
  return `
    <figure class="video-box">
      <video controls playsinline preload="metadata" aria-label="${escapeHTML(label)}">
        <source src="${escapeHTML(src)}" type="video/mp4">
        Your browser can't play this video.
      </video>
      <figcaption>▶ ${escapeHTML(label)}</figcaption>
    </figure>`;
}

// Stops any video playing inside an element (used when a popup closes)
export function pauseVideos(container) {
  container.querySelectorAll("video").forEach((v) => v.pause());
}

let dialog = null;
let opener = null;

export function openVideo(file, title, button) {
  if (!dialog) {
    dialog = document.createElement("dialog");
    dialog.className = "modal video-modal";
    dialog.setAttribute("aria-labelledby", "video-modal-title");
    dialog.innerHTML = `
      <div class="modal__header">
        <h2 id="video-modal-title">Video</h2>
        <button type="button" class="modal__close" aria-label="Close the video">×</button>
      </div>
      <div class="modal__body" id="video-modal-body"></div>`;
    document.body.appendChild(dialog);
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog || event.target.closest(".modal__close")) dialog.close();
    });
    dialog.addEventListener("close", () => {
      pauseVideos(dialog);
      if (opener) opener.focus();
    });
  }
  opener = button || document.activeElement;
  dialog.querySelector("#video-modal-title").textContent = title;
  dialog.querySelector("#video-modal-body").innerHTML = videoHTML(file, title);
  dialog.showModal();
  dialog.querySelector(".modal__close").focus();
}
