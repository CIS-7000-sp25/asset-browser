import { showViewer, closeViewer } from "./gltf_viewer";

window.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("showViewerButton")
    .addEventListener("click", showViewer);
  document
    .getElementById("closeViewerButton")
    .addEventListener("click", closeViewer);
});
