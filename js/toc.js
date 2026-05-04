import { goToSpread } from "./state.js";

const mobile = () => window.matchMedia("(width < 768px)").matches;

export function init() {
  document.querySelectorAll(".toc__link[data-spread]").forEach((link) => {
    link.addEventListener("click", (e) => {
      if (mobile()) return; // let browser scroll to anchor on mobile
      e.preventDefault();
      const spread = Number(link.dataset.spread);
      goToSpread(spread);
    });
  });
}
