# Handoff — Codex Machina

## Current Phase

**Phase 5 complete. Ready for Phase 6: Final recruiter audit + Lighthouse.**

## What Was Completed in Phase 5

### Tooling installed (all devDependencies)

| Package                                   | Version       | Purpose                               |
| ----------------------------------------- | ------------- | ------------------------------------- |
| `prettier`                                | ^3.8          | HTML / CSS / JS formatting            |
| `eslint` + `@eslint/js` + `globals`       | ^10.x         | JS linting (flat config)              |
| `stylelint` + `stylelint-config-standard` | ^17.x / ^40.x | CSS linting                           |
| `stylelint-order`                         | ^8.x          | Alphabetical property ordering        |
| `stylelint-plugin-logical-css`            | ^2.x          | Enforce logical CSS properties        |
| `husky`                                   | ^9.x          | Git hooks                             |
| `lint-staged`                             | ^16.x         | Per-file linting on staged files only |

### Config files created

- **`.prettierrc`** — 100-char print width, LF endings, `htmlWhitespaceSensitivity: "css"` (preserves inline `<span>` adjacency)
- **`.prettierignore`** — excludes `node_modules/`, `package-lock.json`
- **`eslint.config.js`** — flat config; `no-unused-vars`, `no-console`, `eqeqeq: always` on `js/**/*.js`
- **`.stylelintrc.json`** — standard config + alphabetical order + logical CSS + `declaration-no-important`; BEM class pattern override for `__`/`--` names
- **`.stylelintignore`** — excludes `node_modules/`
- **`.husky/pre-commit`** — runs `npx lint-staged`
- **`netlify.toml`** — no build command; security headers on `/*`; `no-cache` on `index.html`; 1-day TTL on CSS/JS
- **`_redirects`** — placeholder comment (single-page static site, no routing needed)
- **`robots.txt`** — `Allow: /` for all agents

### CSS issues found and fixed during linting

1. **`width: 100%` on `.book-stage`** (`book.css`) — physical property; changed to `inline-size: 100%` and moved into alphabetical position.
2. **`overflow-x: hidden` on `body`** (`base.css`) — changed to `overflow-inline: hidden`.
3. **`overflow-y` in two places** (`pages.css`, `responsive.css`) — changed to `overflow-block`.
4. **`float: left` on `.dropcap`** (`content.css`) — changed to `float: inline-start` (good browser support as of 2026).
5. **`-webkit-text-size-adjust`** (`reset.css`) — removed vendor-prefixed line; standard `text-size-adjust: 100%` retained.
6. **Deprecated `clip: rect(0 0 0 0)` and `clip: auto`** (`reset.css`) — removed both; `clip-path` equivalents were already present.
7. **Unquoted `Garamond` font name** (`tokens.css`) — wrapped in double quotes.
8. **`@import "x.css"` notation** (`main.css`) — changed all 11 imports to `url()` form per stylelint-config-standard.
9. **Property ordering** (`book.css`, `pages.css`, `responsive.css`) — `inline-size` moved before `inset-*` in several rules (alphabetical: `inl` < `ins`).
10. **Duplicate `.page__front, .page__back` selector** (`responsive.css`) — merged two blocks into one.
11. **Duplicate `.book-stage` selector** (`responsive.css`) — merged two blocks into one.
12. **Selector specificity ordering** (`controls.css`) — `:disabled` and `:focus-visible` moved before `:hover:not(:disabled)`.
13. **`no-descending-specificity` false positives** (`content.css`) — `.colophon__body p` / `.author-note__body p` come after `.chapter__body p:last-child` in file order; added `stylelint-disable-next-line` comments since selectors never apply to the same elements.
14. **`!important` in responsive.css** — three instances annotated with `stylelint-disable-next-line declaration-no-important`; all are necessary to override attribute-selector specificity on mobile.

### `.gitignore` additions

Added at end of existing Visual Studio `.gitignore`:

- `package-lock.json`
- `.eslintcache`, `.stylelintcache`, `.prettiercache`

(`node_modules/` was already present in the VS template section.)

## How to use

```bash
# Serve locally (no build step)
npx serve .

# Check all linters
npm run lint

# Format everything
npm run format

# Pre-commit hook fires automatically on git commit
```

## Remaining Phases

1. ~~Phase 1: Pre-code declaration~~ ✅
2. ~~Phase 2: Core HTML/CSS scaffold + book environment~~ ✅
3. ~~Phase 3: Page-turn JS + navigation~~ ✅
4. ~~Phase 4: Written content + table of contents~~ ✅
5. ~~Phase 5: Pre-commit tooling~~ ✅
6. **Phase 6: Final recruiter audit + Lighthouse** ← next
   - Lighthouse CLI run (Performance, Accessibility, Best Practices, SEO)
   - Contrast audit (cover text, running heads, folio counter, chapter rule colour on paper)
   - Accessibility smoke test: keyboard nav, screen reader order, skip link, ARIA labels
   - README final rewrite (project description, live URL, tech highlights, local dev instructions)
   - Mobile aria-hidden fix (deferred from Phase 3): on `< 768px`, skip aria-hidden management in JS

## Known Issues Deferred to Phase 6

- **Mobile `aria-hidden`**: `applyStaticSpread` sets `aria-hidden="true"` on all non-active pages even on mobile where all pages scroll into view. Fix: detect `< 768px` in JS and skip aria-hidden toggling.
