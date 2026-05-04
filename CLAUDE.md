# Codex Machina — Architecture Reference

## Project Overview

A physical-book reading experience built with vanilla HTML, CSS, and JavaScript. No runtime dependencies, no build step. Deployed on Netlify.

## File Structure

```
index.html          Single HTML file: all page content, all aria attributes
favicon.svg         Quill-nib SVG icon
css/
  main.css          @import barrel (load order matters — tokens first)
  tokens.css        All CSS custom properties / design tokens
  reset.css         Box-sizing reset, :focus-visible, .sr-only, .skip-link
  base.css          html/body, typography base
  environment.css   Walnut table surface (CSS gradients only, no images)
  book.css          .book-stage perspective, .book, .book__spine
  pages.css         .page 3D structure, paper texture, data-state visibility
  animation.css     @keyframes + @property for shadow sweep
  content.css       Book content typography: chapter, dropcap, cover, colophon
  toc.css           Table of contents layout + dot leaders
  controls.css      Prev/next buttons, folio counter, corner hit zones
  responsive.css    Tablet (768–1100px) and mobile (<768px) breakpoints
js/
  main.js           Entry: imports + wires all modules
  state.js          Page state machine: currentSpread, isAnimating, subscribers
  turn.js           CSS class orchestration for turn animations
  nav.js            Button/keyboard event wiring
  toc.js            TOC link → goToSpread() interception
```

## Spread Model

The book has 6 spreads (0–5). Each spread shows:

- **Recto** (right page): `page[N]` front face at `rotateY(0deg)`
- **Verso** (left page): `page[N-1]` back face at `rotateY(-180deg)` (spread 0: shows `.book__back-cover`)

| Spread | Verso (left)                 | Recto (right)                |
| ------ | ---------------------------- | ---------------------------- |
| 0      | Back cover/endpaper (static) | Cover — page 0 front         |
| 1      | Frontispiece — page 0 back   | TOC — page 1 front           |
| 2      | Chapter I — page 1 back      | Chapter II — page 2 front    |
| 3      | Chapter III — page 2 back    | Chapter IV — page 3 front    |
| 4      | Chapter V — page 3 back      | Chapter VI — page 4 front    |
| 5      | Colophon — page 4 back       | Author's Note — page 5 front |

## Page State via `data-state` Attribute

CSS reacts to `data-state` on `.page` elements. JS sets `element.dataset.state`.

| Value                | CSS effect                                                 |
| -------------------- | ---------------------------------------------------------- |
| _(none)_             | `visibility: hidden`, `z-index: 1`                         |
| `"recto"`            | Visible, `rotateY(0deg)`, `z-index: 4`                     |
| `"verso"`            | Visible, `rotateY(-180deg)`, `z-index: 3`                  |
| `"staged"`           | Visible, `z-index: 2` (behind turning page)                |
| `"turning-forward"`  | Visible, `z-index: 10`, runs `page-turn-forward` keyframe  |
| `"turning-backward"` | Visible, `z-index: 10`, runs `page-turn-backward` keyframe |

`.page--foreground` class overrides z-index to 10 during the midpoint swap.

## Animation: Forward Turn

1. `arrivingPage.dataset.state = "staged"` (visible behind)
2. `turningPage.dataset.state = "turning-forward"` + `.page--foreground`
3. At 325ms: remove `.page--foreground` from turning, add to arriving
4. On `animationend`: `applyStaticSpread(toSpread)` → clean recto/verso states

Keyframe animates `rotateY(0deg → -180deg)`. Starting at 0deg matches the recto state — no visual jump on class toggle.

## Animation: Backward Turn

1. `leavingPage.dataset.state = "staged"` (visible behind)
2. `turningPage.dataset.state = "turning-backward"` + `.page--foreground`
3. At 325ms: swap `.page--foreground`
4. On `animationend`: `applyStaticSpread(toSpread)`

Keyframe animates `rotateY(-180deg → 0deg)`. Starting at -180deg matches the verso state — no jump.

## State Machine (`state.js`)

- `currentSpread`: 0–5
- `isAnimating`: set true before any DOM mutation; cleared only in `finishTurn()` (called from `animationend` or `setTimeout` in reduced-motion mode)
- `reducedMotion`: read once at `init()` from `matchMedia`
- Subscribers called synchronously on every state change

## CSS Design Tokens

All tokens in `css/tokens.css`. Key groups:

- `--book-width / --book-height` — book dimensions
- `--page-bg / --cover-bg` — page colors
- `--ink-*` — text hierarchy
- `--chapter-rule` — gold accent `#c9b97a`
- `--env-*` — walnut scene
- `--ctrl-*` — navigation controls
- `--font-body / --font-display / --font-cover / --font-ui` — typefaces
- `--turn-duration / --turn-easing` — animation timing

## Paper Texture

Pure CSS. `.page__front` and `.page__back` use layered `repeating-linear-gradient` at low opacity (2–4%) to simulate fiber texture. No images required.

## Responsive Strategy

- **Desktop (>1100px)**: Full 3D two-page spread, 920×640px book
- **Tablet (768–1100px)**: Two-page spread, `min(900px, 94vw)` book width, perspective reduced via clamp
- **Mobile (<768px)**: 3D disabled entirely; pages stack vertically as flat cards; `body::before` simplifies to solid color; animations disabled

## Accessibility

- All non-active pages have `aria-hidden="true"` (managed by `turn.js`)
- Page turns announced via `role="status"` on `.ctrl-folio`
- Skip link targets `#book-controls`
- Corner buttons: `tabindex="-1"` (pointer only); arrow keys handle keyboard nav
- Focus indicators: `--focus-ring-color: #c9b97a` on all interactive elements
- `prefers-reduced-motion`: 3D keyframes replaced with 200ms opacity/translate fade

## Pre-commit Tooling (Phase 5)

Husky + lint-staged enforcing:

- Prettier (HTML, CSS, JS)
- ESLint flat config (no unused vars, no console.log, strict ===)
- Stylelint (standard + order + use-logical)
- CSS property alphabetization
- No trailing whitespace, LF endings

## Dev Workflow

```bash
# Serve locally (no build step)
npx serve .

# Lint
npm run lint

# Format
npm run format
```
