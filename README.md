# Codex Machina

A physical book reading experience built with vanilla HTML, CSS, and JavaScript — no frameworks, no build step, no runtime dependencies. The book contains a six-chapter essay on front-end development philosophy written for the project.

---

## What it does

- **3D page-turn animation** — CSS `rotateY` on a `preserve-3d` context; a six-spread book with realistic forward and backward turns
- **Two-page spread layout** — recto/verso model with correct z-index choreography across the turn midpoint
- **Clickable page corners + prev/next controls** — pointer and keyboard nav (`←` `→` `Home` `End`)
- **Table of contents** with chapter links that drive the spread state machine on desktop; anchor-scroll on mobile
- **Paper texture** — layered `repeating-linear-gradient` at 2–4% opacity; no images anywhere in the project
- **Walnut table surface** — pure CSS gradients only
- **Fully responsive** — 3D spread on desktop/tablet; flat single-column scroll on mobile (`< 768px`)
- **`prefers-reduced-motion`** — 3D keyframes replaced with a 200ms opacity/translate fade
- **Accessibility** — `inert` on inactive pages (prevents focus leaking into hidden content), `aria-hidden` managed per page face, `role="status"` live region for page-turn announcements, skip link, full keyboard nav

## Stack

| Layer   | Choice                                 | Why                                                 |
| ------- | -------------------------------------- | --------------------------------------------------- |
| HTML    | Semantic, single file                  | No component abstraction needed for fixed content   |
| CSS     | Custom properties + logical properties | Theming, RTL-readiness, no preprocessor             |
| JS      | ES modules, no bundler                 | Native browser support; 5 modules, ~350 lines total |
| Tooling | Prettier · ESLint · Stylelint · Husky  | Enforced on commit via lint-staged                  |
| Hosting | Netlify                                | Cache headers + security headers in `netlify.toml`  |

## CSS architecture

Twelve CSS files imported via a barrel (`css/main.css`), load order enforced:

```
tokens.css      → all custom properties
reset.css       → box-sizing, :focus-visible, .sr-only
base.css        → html/body, typography
environment.css → walnut table (gradients only)
book.css        → .book-stage, .book, .book__spine
pages.css       → .page 3D structure, paper texture
animation.css   → @keyframes + @property shadow sweep
content.css     → chapter, dropcap, cover, colophon
toc.css         → table of contents + dot leaders
controls.css    → prev/next, folio counter, corner zones
responsive.css  → tablet (768–1100px) + mobile (< 768px)
```

## Local development

```bash
# No install needed to view — just serve the directory
npx serve .
# Open http://localhost:3000

# Lint (ESLint + Stylelint + Prettier check)
npm run lint

# Format
npm run format
```

## Architecture notes

See [CLAUDE.md](CLAUDE.md) for the spread model, page state machine, animation sequencing, and CSS token inventory.
