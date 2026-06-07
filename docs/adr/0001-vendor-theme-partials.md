# Vendor the three live theme files; drop Beautiful Hugo

---
Status: accepted
---

## Context

The site declared `theme = "beautifulhugo"` but `layouts/_default/baseof.html`, `head.html`,
`footer.html`, and `nav.html` are all fully overridden, so the theme's shell never loads.
Of the entire 7 MB theme, only three files were ever resolved at build time:
`layouts/partials/seo/` (`main`, `schema`, `opengraph`, `twitter`) and
`layouts/partials/load-photoswipe-theme.html`. The theme's `static/css/syntax.css` was
linked in `head.html` but styled nothing (no code fences, no Chroma config).

## Decision

Copy the three live partials into `layouts/partials/`, drop the dead `syntax.css` link,
remove `theme = "beautifulhugo"` from `hugo.toml`, and delete `themes/beautifulhugo/`.
The site now has no theme — all templates live in `layouts/`.

## Why this is recorded

A Hugo site with no theme is surprising. Without this note, a future reader (or a future
architecture review) would assume the theme was dropped by accident and re-suggest adopting
one. The trade-off was real: keeping the theme gives upstream updates and unused-but-available
features (Disqus, KaTeX, share links); vendoring the three files we actually use removes a
7 MB dependency, concentrates every live template in `layouts/`, and makes the codebase
fully self-contained. We chose locality over latent features.

## Consequence

If a future feature needs a Beautiful Hugo partial (e.g. share links), copy that one file
from the theme's git history rather than re-vendoring the whole theme.
