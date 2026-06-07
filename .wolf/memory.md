# Memory

> Chronological action log. Hooks and AI append to this file automatically.
> Old sessions are consolidated by the daemon weekly.

## 2026-06-07 — Architecture deepening (improve-codebase-architecture)

Shipped 3 candidates from the architecture review:
- **Country-code module**: extracted the byte-identical ~120-entry `numericToAlpha2`
  table (duplicated in travel.js + mini-map.js) plus `fipsToState` into a new
  `static/js/country-codes.js` on `window.SVW`. Both maps alias the globals; loaded
  before each map in `footer_custom.html`. −230 dup lines.
- **Theme removed**: deleted `themes/beautifulhugo/` (7 MB). Only 3 files were ever
  loaded — vendored into `layouts/partials/`. Dropped dead `syntax.css` link and
  `theme =` from hugo.toml. Recorded in `docs/adr/0001-vendor-theme-partials.md`.
- **Dead partial**: deleted `layouts/partials/now-playing.html` (0 callers, CSS
  classes unused — handoff's "dual path" was a misread).

Verified: `hugo` build exit 0; live server confirmed script order, `window.SVW`
populated, SEO meta + PhotoSwipe scaffold intact, no syntax.css.

Tooling note: preview MCP can't attach — it forces PORT=8080 but launch.json
hardcodes `-p 1313`. Verified via curl instead.
