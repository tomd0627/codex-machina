import { goNext, goPrev, goToSpread, getState } from "./state.js";

export function init() {
  const btnNext = document.getElementById("btn-next");
  const btnPrev = document.getElementById("btn-prev");
  const cornerNext = document.querySelector(".corner-btn--next");
  const cornerPrev = document.querySelector(".corner-btn--prev");

  btnNext?.addEventListener("click", () => goNext());
  btnPrev?.addEventListener("click", () => goPrev());
  cornerNext?.addEventListener("click", () => goNext());
  cornerPrev?.addEventListener("click", () => goPrev());

  document.addEventListener("keydown", (e) => {
    if (getState().isAnimating) return;

    switch (e.key) {
      case "ArrowRight":
      case "PageDown":
        e.preventDefault();
        goNext();
        break;
      case "ArrowLeft":
      case "PageUp":
        e.preventDefault();
        goPrev();
        break;
      case "Home":
        e.preventDefault();
        goToSpread(0);
        break;
      case "End":
        e.preventDefault();
        goToSpread(5);
        break;
      default:
        break;
    }
  });
}
