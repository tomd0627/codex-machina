import { finishTurn, getSpreadLabel, getState, subscribe } from "./state.js";

const TOTAL_PAGES = 6;
const TOTAL_SPREADS = 6;
const TURN_MIDPOINT = 325;
const TURN_DURATION = 650;
const FADE_DURATION = 200;

const isMobile = () => window.matchMedia("(width < 768px)").matches;

let prevSpread = 0;

function getPage(index) {
  return document.getElementById(`page-${index}`);
}

// Used during animation to temporarily hide pages in transitional states.
// applyStaticSpread restores the definitive state when animation completes.
function setAriaHidden(index, hidden) {
  const page = getPage(index);
  if (!page) return;
  const shouldHide = hidden && !isMobile();
  page.setAttribute("aria-hidden", shouldHide ? "true" : "false");
  if (shouldHide) {
    page.setAttribute("inert", "");
  } else {
    page.removeAttribute("inert");
  }
}

function updateFolio(spread) {
  const el = document.getElementById("folio-label");
  if (el) el.textContent = getSpreadLabel(spread);
}

function updateButtons(spread) {
  const prev = document.getElementById("btn-prev");
  const next = document.getElementById("btn-next");
  const cornerPrev = document.querySelector(".corner-btn--prev");
  const cornerNext = document.querySelector(".corner-btn--next");

  if (prev) prev.disabled = spread <= 0;
  if (next) next.disabled = spread >= TOTAL_SPREADS - 1;

  if (cornerPrev) {
    spread <= 0 ? cornerPrev.setAttribute("hidden", "") : cornerPrev.removeAttribute("hidden");
  }
  if (cornerNext) {
    spread >= TOTAL_SPREADS - 1
      ? cornerNext.setAttribute("hidden", "")
      : cornerNext.removeAttribute("hidden");
  }
}

/**
 * Set pages to their final resting state for a given spread.
 * Used after animations complete and for instant jumps (goToSpread).
 */
function applyStaticSpread(spread) {
  const mobile = isMobile();

  for (let i = 0; i < TOTAL_PAGES; i++) {
    const page = getPage(i);
    if (!page) continue;

    page.classList.remove("page--foreground");

    const front = page.querySelector(".page__front");
    const back = page.querySelector(".page__back");

    if (i === spread) {
      page.dataset.state = "recto";
      page.removeAttribute("inert");
      page.setAttribute("aria-hidden", "false");
      front?.removeAttribute("aria-hidden");
      if (!mobile) back?.setAttribute("aria-hidden", "true");
      else back?.removeAttribute("aria-hidden");
    } else if (i === spread - 1) {
      page.dataset.state = "verso";
      page.removeAttribute("inert");
      page.setAttribute("aria-hidden", "false");
      if (!mobile) front?.setAttribute("aria-hidden", "true");
      else front?.removeAttribute("aria-hidden");
      back?.removeAttribute("aria-hidden");
    } else {
      delete page.dataset.state;
      if (mobile) {
        page.removeAttribute("inert");
        page.setAttribute("aria-hidden", "false");
        front?.removeAttribute("aria-hidden");
        back?.removeAttribute("aria-hidden");
      } else {
        // inert prevents focus on descendants (e.g. TOC links) — fixes aria-hidden-focus
        page.setAttribute("inert", "");
        page.setAttribute("aria-hidden", "true");
      }
    }
  }
}

/**
 * Animate a forward page turn: current recto (page N) swings left,
 * revealing the new recto (page N+1) on the right.
 *
 * Page N starts at rotateY(0deg) and animates to rotateY(-180deg).
 * The @keyframes start at 0deg, matching the current recto state — no jump.
 */
function animateForward(fromSpread, reducedMotion) {
  const turningPage = getPage(fromSpread);
  const arrivingPage = getPage(fromSpread + 1);

  if (!turningPage) {
    applyStaticSpread(fromSpread + 1);
    finishTurn();
    return;
  }

  if (arrivingPage) {
    arrivingPage.dataset.state = "staged";
    setAriaHidden(fromSpread + 1, true);
  }

  turningPage.dataset.state = "turning-forward";
  turningPage.classList.add("page--foreground");

  if (reducedMotion) {
    setTimeout(() => {
      applyStaticSpread(fromSpread + 1);
      finishTurn();
    }, FADE_DURATION);
    return;
  }

  const midTimer = setTimeout(() => {
    turningPage.classList.remove("page--foreground");
    if (arrivingPage) arrivingPage.classList.add("page--foreground");
  }, TURN_MIDPOINT);

  const cleanup = () => {
    turningPage.classList.remove("page--foreground");
    if (arrivingPage) arrivingPage.classList.remove("page--foreground");
    applyStaticSpread(fromSpread + 1);
    finishTurn();
  };

  const safetyTimer = setTimeout(() => {
    clearTimeout(midTimer);
    cleanup();
  }, TURN_DURATION + 50);

  turningPage.addEventListener(
    "animationend",
    () => {
      clearTimeout(midTimer);
      clearTimeout(safetyTimer);
      cleanup();
    },
    { once: true }
  );
}

/**
 * Animate a backward page turn: current verso (page N-1) swings right,
 * back to recto. Page N-1 starts at rotateY(-180deg) → 0deg.
 *
 * The @keyframes start at -180deg, matching the current verso state — no jump.
 */
function animateBackward(fromSpread, reducedMotion) {
  const turningPage = getPage(fromSpread - 1);
  const leavingPage = getPage(fromSpread);
  const arrivingVerso = getPage(fromSpread - 2);

  if (!turningPage) {
    applyStaticSpread(fromSpread - 1);
    finishTurn();
    return;
  }

  if (leavingPage) {
    leavingPage.dataset.state = "staged";
  }

  if (arrivingVerso) {
    arrivingVerso.dataset.state = "verso";
    setAriaHidden(fromSpread - 2, true);
  }

  turningPage.dataset.state = "turning-backward";
  turningPage.classList.add("page--foreground");

  if (reducedMotion) {
    setTimeout(() => {
      applyStaticSpread(fromSpread - 1);
      finishTurn();
    }, FADE_DURATION);
    return;
  }

  const midTimer = setTimeout(() => {
    turningPage.classList.remove("page--foreground");
    if (leavingPage) leavingPage.classList.add("page--foreground");
  }, TURN_MIDPOINT);

  const cleanup = () => {
    turningPage.classList.remove("page--foreground");
    if (leavingPage) leavingPage.classList.remove("page--foreground");
    applyStaticSpread(fromSpread - 1);
    finishTurn();
  };

  const safetyTimer = setTimeout(() => {
    clearTimeout(midTimer);
    cleanup();
  }, TURN_DURATION + 50);

  turningPage.addEventListener(
    "animationend",
    () => {
      clearTimeout(midTimer);
      clearTimeout(safetyTimer);
      cleanup();
    },
    { once: true }
  );
}

export function init() {
  const { currentSpread } = getState();
  applyStaticSpread(currentSpread);
  updateFolio(currentSpread);
  updateButtons(currentSpread);
  prevSpread = currentSpread;

  subscribe((s) => {
    const to = s.currentSpread;
    const from = prevSpread;

    updateFolio(to);
    updateButtons(to);

    if (!s.isAnimating) {
      prevSpread = to;
      return;
    }

    if (to > from) {
      if (to - from === 1) {
        animateForward(from, s.reducedMotion);
      } else {
        applyStaticSpread(to);
        finishTurn();
      }
    } else if (to < from) {
      if (from - to === 1) {
        animateBackward(from, s.reducedMotion);
      } else {
        applyStaticSpread(to);
        finishTurn();
      }
    } else {
      applyStaticSpread(to);
      finishTurn();
    }

    prevSpread = to;
  });
}
