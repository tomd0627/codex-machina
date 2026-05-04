// Page state machine
// Full implementation: Phase 3

const SPREAD_LABELS = ["Cover", "Contents", "I – II", "III – IV", "V – VI", "Colophon"];

const TOTAL_SPREADS = 6;

const state = {
  currentSpread: 0,
  isAnimating: false,
  reducedMotion: false,
  totalSpreads: TOTAL_SPREADS,
};

const subscribers = new Set();

function notify() {
  for (const fn of subscribers) {
    fn(Object.freeze({ ...state }));
  }
}

export function getState() {
  return Object.freeze({ ...state });
}

export function subscribe(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

export function getSpreadLabel(index) {
  return SPREAD_LABELS[index] ?? "";
}

export function finishTurn() {
  state.isAnimating = false;
  notify();
}

export function goNext() {
  if (state.isAnimating || state.currentSpread >= state.totalSpreads - 1) return;
  state.isAnimating = true;
  state.currentSpread += 1;
  notify();
}

export function goPrev() {
  if (state.isAnimating || state.currentSpread <= 0) return;
  state.isAnimating = true;
  state.currentSpread -= 1;
  notify();
}

export function goToSpread(index) {
  const n = Number(index);
  if (state.isAnimating || n === state.currentSpread) return;
  if (n < 0 || n >= state.totalSpreads) return;
  state.isAnimating = true;
  state.currentSpread = n;
  notify();
}

export function init() {
  state.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  notify();
}
