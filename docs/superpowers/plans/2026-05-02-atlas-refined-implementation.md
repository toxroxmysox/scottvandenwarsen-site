# Atlas Refined Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Moody Slate design system with Atlas Refined across all pages — new CSS, new templates, Bootstrap 3 removed, new brand assets.

**Architecture:** Full visual rewrite. A new `static/css/main.css` provides all styling via CSS custom properties. All Hugo templates in `layouts/` are rewritten to use new `svw-*` class names. Bootstrap is completely removed. Existing JS behaviors (D3 maps, PhotoSwipe, scroll-spy) are preserved with surgical edits for color/class compatibility.

**Tech Stack:** Hugo (Go templates), CSS custom properties, CSS Grid/Flexbox, vanilla JS, D3.js (existing), PhotoSwipe v4 (existing), Google Fonts (Fraunces + IBM Plex Mono)

**Spec:** `docs/superpowers/specs/2026-05-02-atlas-refined-redesign.md`

---

## File Structure

```
layouts/
  _default/baseof.html          — NEW: document shell (replaces theme baseof)
  index.html                    — REWRITE: hero + feed + map bands
  404.html                      — KEEP (unchanged)
  partials/
    head.html                   — REWRITE: new fonts, favicon, no Bootstrap/FA
    nav.html                    — REWRITE: svw-nav sticky header
    footer.html                 — REWRITE: svw-footer + Buttondown form
    footer_custom.html          — EDIT: keep page-specific JS, unchanged
    comments.html               — KEEP (unchanged)
    subscribe-form.html         — KEEP (unused after footer rewrite, but harmless)
    home/
      feed-columns.html         — REWRITE: svw-card + svw-feed-row, accepts $limit
      card.html                 — KEEP (unused after feed-columns rewrite)
      gallery-card.html         — REWRITE: becomes svw-postcard partial
      gallery-albums.html       — KEEP (unused after gallery list rewrite)
  gallery/
    list.html                   — REWRITE: postcard grid
    single.html                 — REWRITE: forest bg + photo grid
  feed/
    list.html                   — REWRITE: three scrollable columns
    single.html                 — REWRITE: paper card article
  now/
    single.html                 — REWRITE: restyled cards + side nav
    baseof.html                 — DELETE (no longer needed — global baseof handles it)
  about/
    single.html                 — REWRITE: paper hero card + prose
    baseof.html                 — DELETE (no longer needed)
  travel/
    list.html                   — REWRITE: restyled tabs + map container
static/
  css/main.css                  — REWRITE: 100% new CSS from scratch
  js/nav.js                     — NEW: mobile hamburger toggle
  js/mini-map.js                — EDIT: rename mount ID + CSS classes
  js/travel.js                  — EDIT: replace 1 hardcoded color
  svw-compass.svg               — NEW: copy from handoff
  contours.svg                  — NEW: copy from handoff
  apple-touch-icon.png          — REPLACE: new compass on forest bg
  favicon.ico                   — DELETE
  favicon-16x16.png             — DELETE
  favicon-32x32.png             — DELETE
  preview-atlas.html            — DELETE
```

---

## Task 1: Copy Brand Assets

**Files:**
- Create: `static/svw-compass.svg`
- Create: `static/contours.svg`

- [ ] **Step 1: Copy SVW compass SVG from handoff**

```bash
cp "/Users/Scott/Downloads/design_handoff_atlas_refined 4/assets/svw-compass.svg" static/svw-compass.svg
```

- [ ] **Step 2: Copy contours SVG from handoff**

```bash
cp "/Users/Scott/Downloads/design_handoff_atlas_refined 4/assets/contours.svg" static/contours.svg
```

- [ ] **Step 3: Generate apple-touch-icon.png**

Use the existing `apple-touch-icon.png` as-is for now (it will be regenerated later from the SVG). The SVG favicon takes priority in modern browsers.

Alternatively, if `rsvg-convert` is available:
```bash
rsvg-convert -w 180 -h 180 -b '#162923' static/svw-compass.svg -o static/apple-touch-icon.png
```

If not available, skip — the SVG favicon covers modern browsers and the existing PNG won't break anything.

- [ ] **Step 4: Delete old favicons**

```bash
rm -f static/favicon.ico static/favicon-16x16.png static/favicon-32x32.png static/preview-atlas.html
```

- [ ] **Step 5: Commit**

```bash
git add static/svw-compass.svg static/contours.svg static/apple-touch-icon.png
git add -u static/favicon.ico static/favicon-16x16.png static/favicon-32x32.png static/preview-atlas.html
git commit -m "feat: add Atlas Refined brand assets, remove old favicons"
```

---

## Task 2: Write New CSS (`static/css/main.css`)

**Files:**
- Rewrite: `static/css/main.css`

This is the largest single file. Write it from scratch — do NOT try to edit the existing 3,878-line file.

- [ ] **Step 1: Write the complete new main.css**

The file structure (top to bottom):

1. `:root` tokens (copy verbatim from spec Section 1)
2. Reset/Base
3. Atoms (`.svw-eyebrow`, `.svw-pill`, `.svw-emph`, `.svw-contours`)
4. Components (`.svw-nav`, `.svw-footer`, `.svw-hero`, `.svw-card`, `.svw-feed-row`, `.svw-postcard`)
5. Page-specific (homepage, feed single, gallery, now, travel, about)
6. Responsive breakpoints
7. Utilities (skip-link, selection)

```css
/* ============================================================
   ATLAS REFINED — Design Tokens
   ============================================================ */
:root {
  /* Surfaces */
  --color-ground:      #162923;
  --color-ground-deep: #0e1a16;
  --color-paper:       #ece4d0;
  --color-paper-deep:  #ddd2b6;

  /* Ink (text on paper) */
  --color-ink:         #141a18;
  --color-ink-soft:    #2f3833;
  --color-ink-faint:   #6e7167;

  /* Rules / dividers */
  --color-rule:        rgba(20, 26, 24, 0.18);
  --color-rule-soft:   rgba(20, 26, 24, 0.10);
  --color-rule-dark:   rgba(255, 255, 255, 0.07);

  /* Accent */
  --accent:            #b65a31;
  --accent-soft:       color-mix(in srgb, var(--accent) 12%, transparent);

  /* Typography */
  --font-display:      'Fraunces', Georgia, 'Times New Roman', serif;
  --font-body:         'Fraunces', Georgia, 'Times New Roman', serif;
  --font-ui:           'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, monospace;

  /* Type scale (px) */
  --fs-hero:           52px;
  --fs-page:           50px;
  --fs-section:        28px;
  --fs-card-title:     22px;
  --fs-item:           15px;
  --fs-body:           16px;
  --fs-body-sm:        13px;
  --fs-meta:           12.5px;
  --fs-eyebrow:        10px;

  /* Letter-spacing */
  --ls-display:        -0.025em;
  --ls-section:        -0.015em;
  --ls-card-title:     -0.01em;
  --ls-body:            0;
  --ls-eyebrow:         0.16em;
  --ls-eyebrow-tight:   0.10em;

  /* Line-heights */
  --lh-display:         1.06;
  --lh-section:         1.15;
  --lh-body:            1.55;
  --lh-tight:           1.25;

  /* Radii */
  --radius-card:        4px;
  --radius-pill:        999px;

  /* Shadows */
  --shadow-card:        0 1px 0 rgba(0,0,0,0.20), 0 12px 24px -12px rgba(0,0,0,0.40);
  --shadow-card-lg:     0 1px 0 rgba(0,0,0,0.30), 0 18px 36px -12px rgba(0,0,0,0.50);

  /* Spacing */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px;
  --space-4: 18px; --space-5: 24px; --space-6: 36px;
  --space-7: 56px; --space-8: 64px;

  /* Layout */
  --content-max:        1180px;
  --hero-max:           880px;
  --hero-sub-max:       640px;

  /* Page defaults */
  color-scheme:         dark;
}

/* ============================================================
   RESET & BASE
   ============================================================ */
*, *::before, *::after { box-sizing: border-box; }
body, h1, h2, h3, h4, p, ul, ol, figure, blockquote { margin: 0; padding: 0; }
img, svg { display: block; max-width: 100%; }
a { color: inherit; text-decoration: none; }

.svw-page {
  background: var(--color-ground);
  color: var(--color-paper);
  font-family: var(--font-body);
  font-size: var(--fs-body);
  line-height: var(--lh-body);
  min-height: 100vh;
}

::selection {
  background: var(--accent);
  color: var(--color-paper);
}

/* ============================================================
   ATOMS
   ============================================================ */
.svw-eyebrow {
  font-family: var(--font-ui);
  font-size: var(--fs-eyebrow);
  font-weight: 600;
  letter-spacing: var(--ls-eyebrow);
  text-transform: uppercase;
  color: rgba(236, 228, 208, 0.55);
}

.svw-eyebrow--ink {
  color: var(--color-ink-faint);
}

.svw-pill {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-ui);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: var(--ls-eyebrow-tight);
  text-transform: uppercase;
  padding: 8px 18px;
  border-radius: var(--radius-pill);
  transition: all 0.15s ease;
  cursor: pointer;
}

.svw-pill--solid {
  background: var(--accent);
  color: var(--color-paper);
  border: none;
}
.svw-pill--solid:hover {
  filter: brightness(0.9);
}

.svw-pill--outline {
  background: transparent;
  color: var(--color-paper);
  border: 1px solid rgba(236, 228, 208, 0.4);
}
.svw-pill--outline:hover {
  background: rgba(236, 228, 208, 0.08);
  border-color: var(--color-paper);
}

.svw-pill--light {
  background: var(--accent-soft);
  color: var(--accent);
  border: none;
}

.svw-emph {
  font-style: italic;
  color: var(--accent);
}

.svw-contours {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}
.svw-contours img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ============================================================
   NAVIGATION
   ============================================================ */
.svw-nav {
  display: flex;
  align-items: center;
  gap: 24px;
  background: var(--color-ground-deep);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding: 14px 40px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.svw-nav__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--color-paper);
  flex-shrink: 0;
}
.svw-nav__brand svg {
  width: 28px;
  height: 28px;
}
.svw-nav__brand span {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 500;
}

.svw-nav__links {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-left: auto;
  list-style: none;
}
.svw-nav__links a {
  font-family: var(--font-ui);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: var(--ls-eyebrow-tight);
  text-transform: uppercase;
  color: rgba(236, 228, 208, 0.72);
  transition: color 0.15s ease;
}
.svw-nav__links a:hover,
.svw-nav__links a.active {
  color: var(--accent);
}

.svw-nav__toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  margin-left: auto;
}
.svw-nav__toggle span {
  display: block;
  width: 20px;
  height: 2px;
  background: var(--color-paper);
  margin: 4px 0;
  transition: transform 0.2s ease;
}

/* ============================================================
   FOOTER
   ============================================================ */
.svw-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding: 36px 56px 18px;
}

.svw-footer__subscribe {
  max-width: 400px;
  margin: 0 auto 24px;
  text-align: center;
}
.svw-footer__subscribe label {
  display: block;
  margin-bottom: 10px;
}
.svw-footer__subscribe-form {
  display: flex;
  gap: 8px;
  position: relative;
}
.svw-footer__subscribe-form input[type="email"] {
  flex: 1;
  font-family: var(--font-ui);
  font-size: 12px;
  padding: 8px 16px;
  background: var(--color-ground-deep);
  color: var(--color-paper);
  border: 1px solid rgba(236, 228, 208, 0.2);
  border-radius: var(--radius-pill);
  outline: none;
}
.svw-footer__subscribe-form input[type="email"]::placeholder {
  color: rgba(236, 228, 208, 0.4);
}
.svw-footer__subscribe-form input[type="email"]:focus {
  border-color: var(--accent);
}

.svw-footer__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
.svw-footer__left,
.svw-footer__right {
  font-family: var(--font-ui);
  font-size: 10px;
  letter-spacing: var(--ls-eyebrow);
  text-transform: uppercase;
  color: rgba(236, 228, 208, 0.5);
}
.svw-footer__left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.svw-footer__left svg {
  width: 14px;
  height: 14px;
}
.svw-footer__right a {
  color: rgba(236, 228, 208, 0.5);
  transition: color 0.15s ease;
}
.svw-footer__right a:hover {
  color: var(--accent);
}

/* ============================================================
   HERO
   ============================================================ */
.svw-hero {
  position: relative;
  padding: 64px 56px 36px;
  max-width: var(--content-max);
  margin: 0 auto;
}
.svw-hero__title {
  font-family: var(--font-display);
  font-size: var(--fs-hero);
  font-weight: 400;
  line-height: var(--lh-display);
  letter-spacing: var(--ls-display);
  color: var(--color-paper);
  max-width: var(--hero-max);
}
.svw-hero__sub {
  font-family: var(--font-body);
  font-size: 17px;
  font-style: italic;
  color: rgba(236, 228, 208, 0.78);
  max-width: var(--hero-sub-max);
  margin-top: var(--space-4);
}
.svw-hero__cta {
  display: flex;
  gap: 12px;
  margin-top: var(--space-5);
  flex-wrap: wrap;
}

/* ============================================================
   FEED CARD & ROWS
   ============================================================ */
.svw-feed {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  padding: 24px 56px 30px;
  max-width: var(--content-max);
  margin: 0 auto;
}

.svw-card {
  background: var(--color-paper);
  color: var(--color-ink);
  border-radius: var(--radius-card);
  padding: 20px 22px;
  box-shadow: var(--shadow-card);
}

.svw-card--scrollable {
  max-height: 80vh;
  overflow-y: auto;
}

.svw-card__head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--color-ink);
  margin-bottom: 10px;
}
.svw-card__chip {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--color-ink);
  color: var(--color-paper);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-ui);
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
}
.svw-card__chip--inverted {
  background: var(--color-paper);
  color: var(--color-ink);
}
.svw-card__title {
  font-family: var(--font-display);
  font-size: var(--fs-card-title);
  font-weight: 500;
  letter-spacing: var(--ls-card-title);
  color: var(--color-ink);
}

.svw-feed-row {
  padding: 12px 0;
  border-bottom: 1px solid var(--color-rule-soft);
}
.svw-feed-row:last-child {
  border-bottom: none;
}
.svw-feed-row__meta {
  font-family: var(--font-ui);
  font-size: 9.5px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-ink-faint);
  margin-bottom: 4px;
}
.svw-feed-row__meta-mark {
  color: var(--accent);
}
.svw-feed-row__title {
  font-family: var(--font-display);
  font-size: var(--fs-item);
  font-weight: 500;
  line-height: var(--lh-tight);
  color: var(--color-ink);
  margin-bottom: 4px;
}
.svw-feed-row__summary {
  font-family: var(--font-body);
  font-size: var(--fs-meta);
  line-height: var(--lh-body);
  color: var(--color-ink-soft);
}

/* ============================================================
   POSTCARD (Gallery card)
   ============================================================ */
.svw-postcards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  padding: var(--space-8) var(--space-7);
  max-width: var(--content-max);
  margin: 0 auto;
}

.svw-postcard {
  position: relative;
  background: var(--color-paper);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  text-decoration: none;
  color: var(--color-ink);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.svw-postcard:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-lg);
}
.svw-postcard__photo {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}
.svw-postcard__body {
  padding: 14px 16px;
}
.svw-postcard__title {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 500;
  color: var(--color-ink);
  margin-bottom: 6px;
  letter-spacing: -0.005em;
}
.svw-postcard__meta {
  font-family: var(--font-ui);
  font-size: 9.5px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-ink-faint);
}
.svw-postcard__badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: var(--accent);
  color: var(--color-paper);
  font-family: var(--font-ui);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: var(--ls-eyebrow-tight);
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: var(--radius-pill);
}
.svw-postcard__flag {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 20px;
  line-height: 1;
}

/* ============================================================
   MAP SECTION (Homepage)
   ============================================================ */
.svw-map-section {
  padding: 30px 56px 50px;
  max-width: var(--content-max);
  margin: 0 auto;
}
.svw-map-section header {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 18px;
}
.svw-map-section__title {
  font-family: var(--font-display);
  font-size: var(--fs-card-title);
  font-weight: 500;
  letter-spacing: var(--ls-card-title);
  color: var(--color-paper);
}
.svw-map-section__sub {
  font-family: var(--font-ui);
  font-size: var(--fs-eyebrow);
  letter-spacing: var(--ls-eyebrow);
  text-transform: uppercase;
  color: rgba(236, 228, 208, 0.55);
}

.svw-map__canvas {
  background: var(--color-paper);
  border-radius: var(--radius-card);
  padding: 12px;
  box-shadow: var(--shadow-card);
}
.svw-map__canvas svg {
  display: block;
  width: 100%;
}
.svw-map__country {
  fill: var(--color-ink);
  opacity: 0.10;
  stroke: none;
}
.svw-map__country--visited {
  fill: var(--accent);
  opacity: 0.55;
}
.svw-map__border {
  fill: none;
  stroke: var(--color-ink);
  stroke-width: 0.5px;
  opacity: 0.15;
}

.svw-map-cta {
  display: inline-block;
  margin-top: 14px;
  font-family: var(--font-ui);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: var(--ls-eyebrow-tight);
  text-transform: uppercase;
  color: var(--accent);
  transition: opacity 0.15s ease;
}
.svw-map-cta:hover {
  opacity: 0.75;
}

/* ============================================================
   PAGE: Gallery Single
   ============================================================ */
.svw-gallery-single {
  padding: var(--space-7);
  max-width: var(--content-max);
  margin: 0 auto;
}
.svw-gallery-single__breadcrumb {
  font-family: var(--font-ui);
  font-size: var(--fs-eyebrow);
  letter-spacing: var(--ls-eyebrow);
  text-transform: uppercase;
  color: rgba(236, 228, 208, 0.55);
  margin-bottom: var(--space-5);
}
.svw-gallery-single__breadcrumb a {
  color: inherit;
  transition: color 0.15s ease;
}
.svw-gallery-single__breadcrumb a:hover {
  color: var(--accent);
}
.svw-gallery-single__date {
  font-family: var(--font-ui);
  font-size: var(--fs-eyebrow);
  letter-spacing: var(--ls-eyebrow);
  text-transform: uppercase;
  color: rgba(236, 228, 208, 0.55);
  margin-bottom: var(--space-2);
}
.svw-gallery-single__title {
  font-family: var(--font-display);
  font-size: var(--fs-section);
  font-weight: 500;
  letter-spacing: var(--ls-section);
  color: var(--color-paper);
  margin-bottom: var(--space-3);
}
.svw-gallery-single__desc {
  font-family: var(--font-body);
  font-size: var(--fs-body);
  color: rgba(236, 228, 208, 0.78);
  margin-bottom: var(--space-6);
  max-width: var(--hero-sub-max);
}
.svw-photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
  margin-bottom: var(--space-6);
}
.svw-photo-grid a {
  display: block;
  border-radius: var(--radius-card);
  overflow: hidden;
  transition: box-shadow 0.2s ease;
}
.svw-photo-grid a:hover {
  box-shadow: var(--shadow-card);
}
.svw-photo-grid img {
  width: 100%;
  height: 220px;
  object-fit: cover;
}

/* Video gallery */
.svw-video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
  margin-bottom: var(--space-6);
}
.video-thumb-wrap {
  position: relative;
  border-radius: var(--radius-card);
  overflow: hidden;
}
.video-thumb-wrap img {
  width: 100%;
  height: 220px;
  object-fit: cover;
}
.video-play-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid var(--color-paper);
}
.video-play-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 54%;
  transform: translate(-50%, -50%);
  width: 0;
  height: 0;
  border-left: 14px solid var(--color-paper);
  border-top: 9px solid transparent;
  border-bottom: 9px solid transparent;
}
.video-title {
  font-family: var(--font-display);
  font-size: var(--fs-item);
  font-weight: 500;
  color: var(--color-paper);
  margin-top: 8px;
}
.video-caption {
  font-family: var(--font-body);
  font-size: var(--fs-meta);
  color: rgba(236, 228, 208, 0.65);
}

/* Video lightbox */
.video-lightbox {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 1000;
  align-items: center;
  justify-content: center;
}
.video-lightbox.is-open {
  display: flex;
}
.video-lightbox-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(14, 26, 22, 0.92);
}
.video-lightbox-topbar {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
}
.video-lightbox-close {
  background: none;
  border: none;
  color: var(--color-paper);
  font-size: 32px;
  cursor: pointer;
  line-height: 1;
}
.video-lightbox-content {
  position: relative;
  z-index: 1;
  width: 90vw;
  max-width: 900px;
}
.video-lightbox-player {
  position: relative;
  padding-bottom: 56.25%;
  background: #000;
  border-radius: var(--radius-card);
  overflow: hidden;
}
.video-lightbox-player iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
}
.video-lightbox-info {
  margin-top: 12px;
  text-align: center;
}
.video-lightbox-title {
  font-family: var(--font-display);
  font-size: var(--fs-item);
  font-weight: 500;
  color: var(--color-paper);
}
.video-lightbox-caption {
  font-family: var(--font-body);
  font-size: var(--fs-meta);
  color: rgba(236, 228, 208, 0.65);
  margin-top: 4px;
}

/* ============================================================
   PAGE: Feed Single
   ============================================================ */
.svw-feed-single {
  padding: var(--space-7);
  max-width: 780px;
  margin: 0 auto;
}
.svw-feed-single__breadcrumb {
  font-family: var(--font-ui);
  font-size: var(--fs-eyebrow);
  letter-spacing: var(--ls-eyebrow);
  text-transform: uppercase;
  color: rgba(236, 228, 208, 0.55);
  margin-bottom: var(--space-5);
}
.svw-feed-single__breadcrumb a {
  color: inherit;
  transition: color 0.15s ease;
}
.svw-feed-single__breadcrumb a:hover {
  color: var(--accent);
}

.svw-feed-hero {
  background: var(--color-paper);
  color: var(--color-ink);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: 28px 32px;
  margin-bottom: var(--space-5);
}
.svw-feed-hero__date {
  font-family: var(--font-ui);
  font-size: var(--fs-meta);
  color: var(--color-ink-faint);
  margin-bottom: var(--space-2);
}
.svw-feed-hero__title {
  font-family: var(--font-display);
  font-size: var(--fs-section);
  font-weight: 500;
  letter-spacing: var(--ls-section);
  color: var(--color-ink);
  margin-bottom: var(--space-3);
}
.svw-feed-hero__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: var(--space-3);
}
.svw-feed-hero__external {
  display: inline-block;
  margin-top: var(--space-2);
}

/* Article body (on paper surface) */
.svw-article {
  background: var(--color-paper);
  color: var(--color-ink);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: 32px;
}
.svw-article p {
  margin-bottom: 24px;
  line-height: var(--lh-body);
}
.svw-article a {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.svw-article h2 {
  font-family: var(--font-display);
  font-size: var(--fs-card-title);
  font-weight: 500;
  margin: 36px 0 16px;
}
.svw-article h3 {
  font-family: var(--font-display);
  font-size: var(--fs-item);
  font-weight: 600;
  margin: 28px 0 12px;
}
.svw-article ul, .svw-article ol {
  margin: 0 0 24px 24px;
  color: var(--color-ink-soft);
}
.svw-article li {
  margin-bottom: 6px;
}
.svw-article blockquote {
  border-left: 2px solid var(--accent);
  padding-left: 16px;
  font-style: italic;
  color: var(--color-ink-soft);
  margin: 24px 0;
}
.svw-article code {
  font-family: var(--font-ui);
  font-size: 0.9em;
  background: rgba(20, 26, 24, 0.06);
  padding: 2px 5px;
  border-radius: 3px;
}
.svw-article pre {
  background: var(--color-ground-deep);
  color: var(--color-paper);
  padding: 16px 20px;
  border-radius: var(--radius-card);
  overflow-x: auto;
  margin: 24px 0;
}
.svw-article pre code {
  background: none;
  padding: 0;
  color: inherit;
}
.svw-article img {
  border-radius: var(--radius-card);
  margin: 24px 0;
}

/* Related posts */
.svw-related {
  margin-top: var(--space-7);
}
.svw-related__heading {
  font-family: var(--font-ui);
  font-size: var(--fs-eyebrow);
  letter-spacing: var(--ls-eyebrow);
  text-transform: uppercase;
  color: rgba(236, 228, 208, 0.55);
  margin-bottom: var(--space-4);
}
.svw-related__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
}
.svw-related__card {
  background: var(--color-paper);
  color: var(--color-ink);
  border-radius: var(--radius-card);
  padding: 16px 18px;
  box-shadow: var(--shadow-card);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.svw-related__card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-lg);
}
.svw-related__card-title {
  font-family: var(--font-display);
  font-size: var(--fs-item);
  font-weight: 500;
  color: var(--color-ink);
  margin-bottom: 4px;
}
.svw-related__card-summary {
  font-family: var(--font-body);
  font-size: var(--fs-meta);
  color: var(--color-ink-soft);
}

/* Pager */
.svw-pager {
  display: flex;
  justify-content: space-between;
  margin-top: var(--space-6);
  font-family: var(--font-ui);
  font-size: var(--fs-eyebrow);
  letter-spacing: var(--ls-eyebrow);
  text-transform: uppercase;
}
.svw-pager a {
  color: rgba(236, 228, 208, 0.55);
  transition: color 0.15s ease;
}
.svw-pager a:hover {
  color: var(--accent);
}

/* ============================================================
   PAGE: Now
   ============================================================ */
.svw-now {
  padding: var(--space-7);
  max-width: var(--content-max);
  margin: 0 auto;
}
.svw-now__header {
  text-align: center;
  margin-bottom: var(--space-7);
}
.svw-now__title {
  font-family: var(--font-display);
  font-size: var(--fs-page);
  font-weight: 400;
  letter-spacing: var(--ls-display);
  color: var(--color-paper);
}
.svw-now__subtitle {
  font-family: var(--font-body);
  font-size: 17px;
  font-style: italic;
  color: rgba(236, 228, 208, 0.78);
  margin-top: var(--space-3);
}

.svw-now__layout {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: var(--space-6);
}

.svw-now__nav {
  position: sticky;
  top: 80px;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.svw-now__nav a {
  font-family: var(--font-ui);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: var(--ls-eyebrow-tight);
  text-transform: uppercase;
  color: rgba(236, 228, 208, 0.55);
  transition: color 0.15s ease;
}
.svw-now__nav a.active {
  color: var(--accent);
}

.svw-now__cards {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.now-card {
  background: var(--color-paper);
  color: var(--color-ink);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: 20px 24px;
  opacity: var(--card-opacity, 1);
  transition: opacity 0.3s ease;
}
.now-card--hidden {
  opacity: 0;
}
.now-card--reveal {
  opacity: var(--card-opacity, 0);
}
.now-card--reveal .now-card__content {
  opacity: var(--content-opacity, 0);
  transition: opacity 0.3s ease;
}

.now-card__label {
  font-family: var(--font-ui);
  font-size: var(--fs-eyebrow);
  letter-spacing: var(--ls-eyebrow);
  text-transform: uppercase;
  color: var(--color-ink-faint);
  display: block;
  margin-bottom: var(--space-2);
}
.now-card__value {
  font-family: var(--font-display);
  font-size: var(--fs-section);
  font-weight: 500;
  letter-spacing: var(--ls-section);
  color: var(--color-ink);
  display: block;
  margin-bottom: var(--space-2);
}
.now-card__date {
  font-family: var(--font-ui);
  font-size: var(--fs-meta);
  color: var(--color-ink-faint);
  display: block;
}

.now-card--photo {
  padding: 0;
  overflow: hidden;
}
.now-card--photo img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: var(--radius-card) var(--radius-card) 0 0;
}
.now-card--photo .now-card__overlay {
  padding: 14px 20px;
}

/* ============================================================
   PAGE: Travel
   ============================================================ */
.svw-travel {
  min-height: 100vh;
}

.travel-tabs {
  display: flex;
  gap: var(--space-4);
  padding: 14px 40px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.travel-tab {
  font-family: var(--font-ui);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: var(--ls-eyebrow-tight);
  text-transform: uppercase;
  color: rgba(236, 228, 208, 0.55);
  background: none;
  border: none;
  padding: 6px 0;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: color 0.15s ease, border-color 0.15s ease;
}
.travel-tab.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.map-container {
  background: var(--color-paper);
  border-radius: var(--radius-card);
  margin: 18px;
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.map-sidebar {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 380px;
  background: var(--color-paper);
  color: var(--color-ink);
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.3);
  transform: translateX(100%);
  transition: transform 0.3s ease;
  z-index: 200;
  overflow-y: auto;
}
.map-sidebar.open {
  transform: translateX(0);
}
.sidebar-body {
  padding: 24px;
}
.sidebar-close {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--color-ink);
  cursor: pointer;
  float: right;
}
.sidebar-title {
  font-family: var(--font-display);
  font-size: var(--fs-section);
  font-weight: 500;
  color: var(--color-ink);
  margin-bottom: var(--space-4);
}

/* D3 map elements */
.map-country {
  fill: var(--color-ink);
  fill-opacity: 0.12;
  stroke: var(--color-ink);
  stroke-opacity: 0.25;
  stroke-width: 0.5px;
  cursor: pointer;
  transition: fill-opacity 0.2s ease;
}
.map-country:hover,
.map-country.active {
  fill-opacity: 0.22;
}
.map-country.map-overseas {
  fill: var(--accent);
  fill-opacity: 0.45;
}
.map-border {
  fill: none;
  stroke: var(--color-ink);
  stroke-width: 0.5px;
  stroke-opacity: 0.15;
  pointer-events: none;
}

/* Map pins & flight lines */
.city-pin {
  fill: var(--accent);
}
.city-ring {
  fill: none;
  stroke: var(--accent);
  stroke-opacity: 0.25;
}
.flight-path {
  stroke: var(--accent);
  stroke-dasharray: 4 3;
  stroke-width: 1.5px;
  fill: none;
  opacity: 0.6;
}

/* Country labels */
.country-label {
  font-family: var(--font-ui);
  font-size: 9px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  fill: var(--color-ink);
  opacity: 0.6;
  pointer-events: none;
}

/* Timeline */
.timeline-cards {
  padding: 24px 56px;
  max-width: var(--content-max);
  margin: 0 auto;
}
.sidebar-album-card {
  display: flex;
  gap: 12px;
  margin-bottom: 14px;
  padding: 10px;
  border-radius: var(--radius-card);
  transition: background 0.15s ease;
  cursor: pointer;
}
.sidebar-album-card:hover {
  background: var(--color-paper-deep);
}
.sidebar-album-cover {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: var(--radius-card);
}
.sidebar-album-info {
  flex: 1;
}
.sidebar-album-title {
  font-family: var(--font-display);
  font-size: var(--fs-item);
  font-weight: 500;
  color: var(--color-ink);
}
.sidebar-album-date {
  font-family: var(--font-ui);
  font-size: var(--fs-eyebrow);
  letter-spacing: var(--ls-eyebrow);
  text-transform: uppercase;
  color: var(--color-ink-faint);
  margin-top: 4px;
}
.sidebar-album-summary {
  font-size: var(--fs-meta);
  color: var(--color-ink-soft);
  margin-top: 4px;
}
.sidebar-trip-dates {
  font-family: var(--font-ui);
  font-size: var(--fs-eyebrow);
  letter-spacing: var(--ls-eyebrow);
  text-transform: uppercase;
  color: var(--color-ink-faint);
  margin-bottom: var(--space-3);
}
.sidebar-trip-description {
  font-size: var(--fs-body-sm);
  color: var(--color-ink-soft);
  margin-bottom: var(--space-4);
}
.sidebar-trip-nav {
  display: flex;
  justify-content: space-between;
  margin-top: var(--space-4);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-rule-soft);
}
.sidebar-trip-nav-btn {
  font-family: var(--font-ui);
  font-size: var(--fs-eyebrow);
  letter-spacing: var(--ls-eyebrow);
  text-transform: uppercase;
  color: var(--accent);
  background: none;
  border: none;
  cursor: pointer;
}
.sidebar-trip-nav-btn:disabled {
  color: var(--color-ink-faint);
  cursor: not-allowed;
}

/* Desktop timeline strip */
.travel-timeline {
  background: var(--color-ground-deep);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding: 12px 40px;
  font-family: var(--font-ui);
  font-size: 9px;
  letter-spacing: var(--ls-eyebrow);
  text-transform: uppercase;
  color: rgba(236, 228, 208, 0.5);
}

/* ============================================================
   PAGE: About
   ============================================================ */
.svw-about {
  padding: var(--space-7);
  max-width: var(--content-max);
  margin: 0 auto;
}
.svw-about__hero {
  background: var(--color-paper);
  color: var(--color-ink);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: 48px 40px;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.svw-about__hero .svw-contours {
  opacity: 0.04;
}
.svw-about__photo {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  object-fit: cover;
  margin: 0 auto 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 1;
}
.svw-about__name {
  font-family: var(--font-display);
  font-size: var(--fs-page);
  font-weight: 400;
  letter-spacing: var(--ls-display);
  color: var(--color-ink);
  position: relative;
  z-index: 1;
}
.svw-about__subtitle {
  font-family: var(--font-ui);
  font-size: var(--fs-eyebrow);
  letter-spacing: var(--ls-eyebrow);
  text-transform: uppercase;
  color: var(--color-ink-faint);
  margin-top: var(--space-2);
  position: relative;
  z-index: 1;
}
.svw-about__tagline {
  font-family: var(--font-body);
  font-size: var(--fs-body);
  color: var(--color-ink-soft);
  margin-top: var(--space-3);
  position: relative;
  z-index: 1;
}

.svw-about__prose {
  background: var(--color-paper);
  color: var(--color-ink);
  border-radius: 0 0 var(--radius-card) var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: 40px;
  margin-top: -2px;
}
.svw-about__prose p {
  margin-bottom: 24px;
  line-height: var(--lh-body);
}
.svw-about__prose a {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.svw-about__prose h2 {
  font-family: var(--font-display);
  font-size: var(--fs-card-title);
  font-weight: 500;
  margin: 36px 0 16px;
}
.svw-about__prose h3 {
  font-family: var(--font-display);
  font-size: var(--fs-item);
  font-weight: 600;
  margin: 28px 0 12px;
}
.svw-about__prose ul, .svw-about__prose ol {
  margin: 0 0 24px 24px;
  color: var(--color-ink-soft);
}
.svw-about__prose li {
  margin-bottom: 6px;
}

/* ============================================================
   COMMENTS
   ============================================================ */
.comments-section {
  margin-top: var(--space-7);
  text-align: center;
}
.comments-toggle-btn {
  font-family: var(--font-ui);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: var(--ls-eyebrow-tight);
  text-transform: uppercase;
  color: rgba(236, 228, 208, 0.55);
  background: none;
  border: 1px solid rgba(236, 228, 208, 0.2);
  border-radius: var(--radius-pill);
  padding: 8px 18px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.comments-toggle-btn:hover {
  background: rgba(236, 228, 208, 0.08);
  border-color: var(--color-paper);
}
.comments-body {
  margin-top: var(--space-4);
  text-align: left;
}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 1024px) {
  .svw-feed {
    grid-template-columns: repeat(2, 1fr);
  }
  .svw-postcards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .svw-nav__links {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--color-ground-deep);
    flex-direction: column;
    padding: 18px 40px;
    gap: 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }
  .svw-nav__links.is-open {
    display: flex;
  }
  .svw-nav__toggle {
    display: block;
  }
  .svw-nav {
    position: relative;
  }

  .svw-hero {
    padding: 40px 24px 24px;
  }
  .svw-hero__title {
    font-size: 32px;
  }

  .svw-feed {
    grid-template-columns: 1fr;
    padding: 24px 24px 30px;
    gap: 14px;
  }

  .svw-postcards {
    grid-template-columns: 1fr;
    padding: var(--space-6) var(--space-5);
  }

  .svw-map-section {
    padding: 24px 24px 40px;
  }

  .svw-now__layout {
    grid-template-columns: 1fr;
  }
  .svw-now__nav {
    position: static;
    flex-direction: row;
    flex-wrap: wrap;
    gap: var(--space-3);
    margin-bottom: var(--space-4);
  }

  .svw-about__hero {
    padding: 32px 24px;
  }
  .svw-about__photo {
    width: 150px;
    height: 150px;
  }
  .svw-about__name {
    font-size: 32px;
  }
  .svw-about__prose {
    padding: 24px;
  }

  .svw-feed-single {
    padding: var(--space-5) var(--space-4);
  }
  .svw-feed-hero {
    padding: 20px;
  }
  .svw-article {
    padding: 20px;
  }

  .svw-gallery-single {
    padding: var(--space-5) var(--space-4);
  }
  .svw-photo-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 8px;
  }
  .svw-photo-grid img {
    height: 140px;
  }

  .svw-footer {
    padding: 24px;
  }
  .svw-footer__bar {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }

  .map-sidebar {
    width: 100%;
    top: auto;
    bottom: 0;
    max-height: 60vh;
    transform: translateY(100%);
    border-radius: var(--radius-card) var(--radius-card) 0 0;
  }
  .map-sidebar.open {
    transform: translateY(0);
  }
}

/* ============================================================
   UTILITIES
   ============================================================ */
.skip-link {
  position: absolute;
  top: -100px;
  left: 16px;
  background: var(--accent);
  color: var(--color-paper);
  padding: 8px 16px;
  border-radius: var(--radius-card);
  font-family: var(--font-ui);
  font-size: 12px;
  z-index: 9999;
  transition: top 0.2s ease;
}
.skip-link:focus {
  top: 16px;
}
```

- [ ] **Step 2: Verify the file has no syntax errors**

Run: `hugo server` and confirm no CSS-related build errors. (The site won't look right yet because templates still use old classes — that's expected.)

- [ ] **Step 3: Commit**

```bash
git add static/css/main.css
git commit -m "feat: rewrite main.css with Atlas Refined design tokens and components"
```

---

## Task 3: Global Shell — baseof.html, head.html, nav.js

**Files:**
- Create: `layouts/_default/baseof.html`
- Rewrite: `layouts/partials/head.html`
- Create: `static/js/nav.js`

- [ ] **Step 1: Create baseof.html**

```html
<!doctype html>
<html lang="{{ .Site.LanguageCode | default "en" }}">
<head>
  {{ partial "head.html" . }}
</head>
<body class="svw-page">
  <a class="skip-link" href="#main">Skip to main content</a>
  {{ partial "nav.html" . }}
  <main id="main">
    {{ block "main" . }}{{ end }}
  </main>
  {{ partial "footer.html" . }}
  <script defer src="{{ "js/nav.js" | relURL }}"></script>
</body>
</html>
```

- [ ] **Step 2: Rewrite head.html**

```html
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

{{- $siteTitle := .Site.Title -}}
{{- with .Site.Params.homeTitle -}}{{ $siteTitle = . }}{{- end -}}
<title>{{- if .IsHome -}}{{ $siteTitle }}{{- else -}}{{ .Title | default $siteTitle }}{{ with $siteTitle }} - {{ . }}{{ end }}{{- end -}}</title>

{{- with .Description | default .Params.subtitle | default .Summary }}
  <meta name="description" content="{{ . }}">
{{- end }}
{{- with .Site.Params.author.name }}
  <meta name="author" content="{{ . }}">
{{- end }}

<link rel="icon" type="image/svg+xml" href="{{ "svw-compass.svg" | relURL }}">
<link rel="apple-touch-icon" href="{{ "apple-touch-icon.png" | relURL }}">
<meta name="theme-color" content="#162923">

<link rel="alternate" href="{{ "index.xml" | absLangURL }}" type="application/rss+xml" title="{{ .Site.Title }}">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300..700,30..100;1,9..144,300..700,30..100&family=IBM+Plex+Mono:wght@400;500;600&display=swap">

<link rel="stylesheet" href="{{ "css/main.css" | relURL }}?v={{ now.Unix }}">
<link rel="stylesheet" href="{{ "css/syntax.css" | relURL }}">

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/photoswipe/4.1.2/photoswipe.min.css" integrity="sha384-h/L2W9KefUClHWaty3SLE5F/qvc4djlyR4qY3NUV5HGQBBW7stbcfff1+I/vmsHh" crossorigin="anonymous">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/photoswipe/4.1.2/default-skin/default-skin.min.css" integrity="sha384-iD0dNku6PYSIQLyfTOpB06F2KCZJAKLOThS5HRe8b3ibhdEQ6eKsFf/EeFxdOt5R" crossorigin="anonymous">

{{- partial "seo/main.html" . }}
{{- if not hugo.IsServer -}}
  {{ template "_internal/google_analytics.html" . }}
{{- end -}}
```

- [ ] **Step 3: Create nav.js**

```js
(function () {
  var toggle = document.querySelector('.svw-nav__toggle');
  var links = document.querySelector('.svw-nav__links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', function () {
    links.classList.toggle('is-open');
    var expanded = links.classList.contains('is-open');
    toggle.setAttribute('aria-expanded', expanded);
  });
})();
```

- [ ] **Step 4: Delete the about and now baseof overrides (no longer needed)**

```bash
rm layouts/about/baseof.html layouts/now/baseof.html
```

- [ ] **Step 5: Commit**

```bash
git add layouts/_default/baseof.html layouts/partials/head.html static/js/nav.js
git add -u layouts/about/baseof.html layouts/now/baseof.html
git commit -m "feat: add baseof shell, rewrite head.html, add nav.js toggle"
```

---

## Task 4: Navigation & Footer

**Files:**
- Rewrite: `layouts/partials/nav.html`
- Rewrite: `layouts/partials/footer.html`

- [ ] **Step 1: Rewrite nav.html**

```html
<header class="svw-nav">
  <a class="svw-nav__brand" href="{{ "" | relLangURL }}">
    {{ readFile "static/svw-compass.svg" | safeHTML }}
    <span>{{ .Site.Title }}</span>
  </a>

  <nav class="svw-nav__links" aria-label="Main navigation">
    <a href="{{ "/" | relLangURL }}" {{ if .IsHome }}class="active"{{ end }}>Home</a>
    <a href="{{ "/now/" | relLangURL }}" {{ if eq .Type "now" }}class="active"{{ end }}>Now</a>
    <a href="{{ "/feed/" | relLangURL }}" {{ if eq .Section "feed" }}class="active"{{ end }}>Feed</a>
    <a href="{{ "/gallery/" | relLangURL }}" {{ if eq .Section "gallery" }}class="active"{{ end }}>Gallery</a>
    <a href="{{ "/travel/" | relLangURL }}" {{ if eq .Type "travel" }}class="active"{{ end }}>Travel</a>
    <a href="{{ "/about/" | relLangURL }}" {{ if eq .Section "about" }}class="active"{{ end }}>About</a>
  </nav>

  <button class="svw-nav__toggle" aria-label="Toggle navigation" aria-expanded="false">
    <span></span>
    <span></span>
    <span></span>
  </button>
</header>
```

- [ ] **Step 2: Rewrite footer.html**

```html
<footer class="svw-footer">
  {{ with .Site.Params.buttondownFormAction }}
  <div class="svw-footer__subscribe">
    <label for="bd-email" class="svw-eyebrow">Get new posts delivered to your inbox</label>
    <form method="POST" action="{{ . }}" class="svw-footer__subscribe-form">
      <input type="email" name="email" id="bd-email" placeholder="Your email" required>
      <button type="submit" class="svw-pill svw-pill--solid">Subscribe</button>
      <div style="position: absolute; left: -5000px;" aria-hidden="true">
        <input type="text" name="a_password" tabindex="-1" autocomplete="off">
      </div>
    </form>
  </div>
  {{ end }}

  <div class="svw-footer__bar">
    <div class="svw-footer__left">
      <svg width="14" height="14" viewBox="0 0 64 64" fill="none">
        <use href="{{ "svw-compass.svg" | relURL }}#compass"></use>
      </svg>
      <span>&copy; {{ now.Format "2006" }} &middot; Detroit, MI</span>
    </div>
    <div class="svw-footer__right">
      {{ if .Site.Params.rss }}
        <a href="{{ "index.xml" | relURL }}">RSS</a> &middot;
      {{ end }}
      <a href="mailto:scottvh519@gmail.com">Email</a> &middot;
      {{ with .Site.Params.author.linkedin }}
        <a href="https://linkedin.com/in/{{ . }}" rel="me">LinkedIn</a>
      {{ end }}
    </div>
  </div>

  {{/* PhotoSwipe scripts — needed by gallery single pages */}}
  <script src="https://cdnjs.cloudflare.com/ajax/libs/photoswipe/4.1.2/photoswipe.min.js" integrity="sha384-QELNnmcmU8IR9ZAykt67vGr9/rZJdHbiWi64V88fCPaOohUlHCqUD/unNN0BXSqy" crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/photoswipe/4.1.2/photoswipe-ui-default.min.js" integrity="sha384-m67o7SkQ1ALzKZIFh4CiTA8tmadaujiTa9Vu+nqPSwDOqHrDmxLezTdFln8077+q" crossorigin="anonymous"></script>
  <script src="{{ "js/load-photoswipe.js" | relURL }}"></script>
  {{- partial "footer_custom.html" . }}
</footer>
```

Note: The footer inline SVG `<use>` may not work cross-file. If it doesn't render, replace with the full SVG inline:
```html
<svg width="14" height="14" viewBox="0 0 64 64" fill="none" style="color: var(--color-paper);">
  <circle cx="32" cy="32" r="31" stroke="currentColor" stroke-width="1.4" opacity="0.85"/>
  <path d="M32 14 L34 32 L32 50 L30 32 Z" fill="currentColor" opacity="0.85"/>
  <path d="M32 14 L34 32 L30 32 Z" fill="var(--accent, #b65a31)"/>
</svg>
```

- [ ] **Step 3: Run `hugo server` and verify build succeeds**

Expected: The site should build. Pages may look broken (old templates calling new CSS) — that's fine at this stage.

- [ ] **Step 4: Commit**

```bash
git add layouts/partials/nav.html layouts/partials/footer.html
git commit -m "feat: rewrite nav and footer with Atlas Refined design"
```

---

## Task 5: Homepage

**Files:**
- Rewrite: `layouts/index.html`
- Rewrite: `layouts/partials/home/feed-columns.html`

- [ ] **Step 1: Rewrite feed-columns.html**

This partial now accepts a `$limit` parameter via a dict. Pages call it with `{{ partial "home/feed-columns.html" (dict "Site" .Site "limit" 3) }}`.

```html
{{ $limit := .limit | default 3 }}
{{ $sections := slice
  (dict "section" "reading"   "title" "Reading"   "chip" "N")
  (dict "section" "watching"  "title" "Watching"  "chip" "E")
  (dict "section" "listening" "title" "Listening" "chip" "W")
}}

<section class="svw-feed">
  {{ range $sections }}
    {{ $pages := where $.Site.RegularPages.ByDate.Reverse "Section" .section }}
    {{ if $limit }}
      {{ $pages = first $limit $pages }}
    {{ end }}
    <article class="svw-card{{ if not $limit }} svw-card--scrollable{{ end }}">
      <header class="svw-card__head">
        <span class="svw-card__chip">{{ .chip }}</span>
        <h3 class="svw-card__title">{{ .title }}</h3>
      </header>
      {{ range $pages }}
        <a href="{{ .RelPermalink }}" class="svw-feed-row">
          <div class="svw-feed-row__meta">
            {{ .Date.Format "JAN 2" | upper }}
            <span class="svw-feed-row__meta-mark">&diams;</span>
            {{ .Section | upper }}
          </div>
          <div class="svw-feed-row__title">{{ .Title }}</div>
          {{ with .Params.summary }}
            <p class="svw-feed-row__summary">{{ . }}</p>
          {{ end }}
        </a>
      {{ end }}
    </article>
  {{ end }}
</section>
```

- [ ] **Step 2: Rewrite index.html**

```html
{{ define "main" }}

{{/* ---- Hero ---- */}}
<section class="svw-hero">
  <div class="svw-contours" style="color: var(--color-paper); opacity: 0.08;">
    <img src="{{ "contours.svg" | relURL }}" alt="" aria-hidden="true">
  </div>
  <h1 class="svw-hero__title">
    An inside look at <span class="svw-emph">what I'm thinking about</span> and want to share with others.
  </h1>
  <p class="svw-hero__sub">{{ .Site.Params.description }}</p>
  <div class="svw-hero__cta">
    <a href="{{ "/feed/" | relLangURL }}" class="svw-pill svw-pill--solid">Read the latest</a>
    <a href="{{ "/travel/" | relLangURL }}" class="svw-pill svw-pill--outline">The map</a>
  </div>
</section>

{{/* ---- Feed Columns ---- */}}
{{ partial "home/feed-columns.html" (dict "Site" .Site "limit" 3) }}

{{/* ---- Map Section ---- */}}
<section class="svw-map-section">
  <header>
    <span class="svw-card__chip svw-card__chip--inverted">S</span>
    <h2 class="svw-map-section__title">The Map</h2>
    <span class="svw-map-section__sub">Where I've been</span>
  </header>
  <div class="svw-map__canvas" id="svw-map-canvas">
    <!-- D3 renders the static SVG here -->
  </div>
  <a href="{{ "/travel/" | relLangURL }}" class="svw-map-cta">Explore the Map &rarr;</a>
</section>

{{ end }}
```

- [ ] **Step 3: Run `hugo server` and verify homepage builds**

Expected: Homepage renders with hero, feed columns (3 items each), and map section. The D3 map won't render yet because mini-map.js still targets the old ID (fixed in Task 8).

- [ ] **Step 4: Commit**

```bash
git add layouts/index.html layouts/partials/home/feed-columns.html
git commit -m "feat: rewrite homepage with hero, feed columns, and map section"
```

---

## Task 6: Gallery Pages

**Files:**
- Rewrite: `layouts/gallery/list.html`
- Rewrite: `layouts/partials/home/gallery-card.html`
- Rewrite: `layouts/gallery/single.html`

- [ ] **Step 1: Rewrite gallery-card.html (postcard partial)**

```html
<a href="{{ .RelPermalink }}" class="svw-postcard">
  {{ with .Params.cover }}
    {{ with $.Resources.GetMatch . }}
      {{ $thumb := .Resize "600x webp q80" }}
      <img
        src="{{ $thumb.RelPermalink }}"
        alt="{{ $.Title }}"
        class="svw-postcard__photo"
        loading="lazy"
        width="{{ $thumb.Width }}"
        height="{{ $thumb.Height }}"
      >
    {{ end }}
  {{ end }}

  {{/* Location flag badge */}}
  {{ $flag := index .Site.Data.country_flags .Params.location }}
  {{ with $flag }}
    <span class="svw-postcard__flag">{{ . }}</span>
  {{ end }}

  {{/* Photo/video count badge */}}
  {{ $photoCount := len (.Resources.Match "*.{jpg,jpeg,png,webp}") }}
  {{ $videoCount := len (.Params.videos | default slice) }}
  {{ if or (gt $photoCount 0) (gt $videoCount 0) }}
    <span class="svw-postcard__badge">{{ $photoCount }} photos{{ if gt $videoCount 0 }}, {{ $videoCount }} video{{ if gt $videoCount 1 }}s{{ end }}{{ end }}</span>
  {{ end }}

  <div class="svw-postcard__body">
    <div class="svw-postcard__title">{{ .Title }}</div>
    <div class="svw-postcard__meta">
      {{ .Date.Format "JAN 2006" | upper }}
      {{ with .Params.location }}
        &middot; {{ . | upper }}
      {{ end }}
    </div>
  </div>
</a>
```

- [ ] **Step 2: Rewrite gallery list.html**

```html
{{ define "main" }}
<div class="svw-postcards">
  {{ $albums := where .Site.RegularPages.ByDate.Reverse "Section" "gallery" }}
  {{ range $albums }}
    {{ partial "home/gallery-card.html" . }}
  {{ end }}
</div>
{{ end }}
```

- [ ] **Step 3: Rewrite gallery single.html**

```html
{{ define "main" }}
<div class="svw-gallery-single">

  <nav class="svw-gallery-single__breadcrumb">
    <a href="{{ "/gallery/" | relURL }}">&larr; Gallery</a>
  </nav>

  <div class="svw-gallery-single__date">
    {{ .Date.Format "January 2, 2006" | upper }}
  </div>

  <h1 class="svw-gallery-single__title">{{ .Title }}</h1>

  {{ with .Content }}
    <div class="svw-gallery-single__desc">{{ . }}</div>
  {{ end }}

  {{/* Photo grid */}}
  <div class="svw-photo-grid pswp-gallery" itemscope itemtype="http://schema.org/ImageGallery">
    {{ $imgs := .Resources.Match "*.{jpg,jpeg,png,webp}" }}
    {{ range $i, $img := $imgs }}
      {{ $thumb := $img.Resize "400x webp q80" }}
      <a href="{{ $img.RelPermalink }}"
         data-size="{{ $img.Width }}x{{ $img.Height }}"
         itemprop="contentUrl">
        <img src="{{ $thumb.RelPermalink }}"
             alt="{{ $.Title }} — photo {{ add $i 1 }}"
             loading="lazy"
             itemprop="thumbnail">
      </a>
    {{ end }}
  </div>

  {{/* Video grid */}}
  {{ with .Params.videos }}
  <div class="svw-video-grid video-gallery">
    {{ range . }}
      <a href="#" class="video-trigger"
         data-video-id="{{ .id }}"
         data-video-title="{{ .title }}"
         data-video-caption="{{ .caption }}">
        <div class="video-thumb-wrap">
          <img src="https://img.youtube.com/vi/{{ .id }}/maxresdefault.jpg"
               onerror="this.onerror=null;this.src='https://img.youtube.com/vi/{{ .id }}/hqdefault.jpg';"
               alt="{{ .title }}"
               loading="lazy">
          <div class="video-play-btn" aria-hidden="true"></div>
        </div>
        {{ with .title }}<div class="video-title">{{ . }}</div>{{ end }}
        {{ with .caption }}<div class="video-caption">{{ . }}</div>{{ end }}
      </a>
    {{ end }}
  </div>
  {{ end }}

  {{ partial "comments.html" . }}

  <nav class="svw-gallery-single__breadcrumb" style="margin-top: var(--space-7);">
    <a href="{{ "/gallery/" | relURL }}">&larr; Back to Gallery</a>
  </nav>

  {{/* Video lightbox overlay */}}
  {{ with .Params.videos }}
  <div class="video-lightbox" id="videoLightbox" role="dialog" aria-hidden="true">
    <div class="video-lightbox-backdrop"></div>
    <div class="video-lightbox-topbar">
      <button class="video-lightbox-close" aria-label="Close video">&times;</button>
    </div>
    <div class="video-lightbox-content">
      <div class="video-lightbox-player"></div>
      <div class="video-lightbox-info">
        <div class="video-lightbox-title" id="videoLightboxTitle"></div>
        <div class="video-lightbox-caption" id="videoLightboxCaption"></div>
      </div>
    </div>
  </div>
  {{ end }}

</div>
{{ end }}
```

- [ ] **Step 4: Run `hugo server` and verify gallery builds**

Expected: Gallery list shows postcard cards. Gallery single shows photo grid. PhotoSwipe should still open on click (the JS in footer_custom.html targets `.pswp-gallery` which we kept).

- [ ] **Step 5: Commit**

```bash
git add layouts/gallery/list.html layouts/gallery/single.html layouts/partials/home/gallery-card.html
git commit -m "feat: rewrite gallery pages with postcard card design"
```

---

## Task 7: Feed Pages

**Files:**
- Rewrite: `layouts/feed/list.html`
- Rewrite: `layouts/feed/single.html`

- [ ] **Step 1: Rewrite feed list.html**

```html
{{ define "main" }}
{{ partial "home/feed-columns.html" (dict "Site" .Site "limit" 0) }}
{{ end }}
```

When `limit` is `0` (falsy), the partial shows all items and adds `.svw-card--scrollable`.

- [ ] **Step 2: Rewrite feed single.html**

```html
{{ define "main" }}
<div class="svw-feed-single">

  <nav class="svw-feed-single__breadcrumb">
    <a href="{{ "feed/" | relURL }}" onclick="if(history.length>1){history.back();return false;}">&larr; Back</a>
  </nav>

  <div class="svw-feed-hero">
    {{ with .Date }}
      <div class="svw-feed-hero__date">{{ .Format "January 2, 2006" }}</div>
    {{ end }}
    <h1 class="svw-feed-hero__title">{{ .Title }}</h1>
    {{ if .Params.tags }}
      <div class="svw-feed-hero__tags">
        {{ range .Params.tags }}
          <a class="svw-pill svw-pill--light" href="{{ "tags" | relLangURL }}/{{ . | urlize }}/">{{ . }}</a>
        {{ end }}
      </div>
    {{ end }}
    {{ with .Params.external_url }}
      <a class="svw-pill svw-pill--solid svw-feed-hero__external" href="{{ . }}" target="_blank" rel="noopener noreferrer">
        View Source &#8599;
      </a>
    {{ end }}
  </div>

  {{ with .Content }}
    <article class="svw-article">
      {{ . }}
    </article>
  {{ end }}

  {{/* Prev/Next */}}
  {{ if or .PrevInSection .NextInSection }}
    <nav class="svw-pager" aria-label="Post navigation">
      {{ with .PrevInSection }}
        <a href="{{ .RelPermalink }}">&larr; {{ .Title }}</a>
      {{ else }}
        <span></span>
      {{ end }}
      {{ with .NextInSection }}
        <a href="{{ .RelPermalink }}">{{ .Title }} &rarr;</a>
      {{ end }}
    </nav>
  {{ end }}

  {{/* Related posts */}}
  {{ if and .Site.Params.showRelatedPosts .Params.tags }}
    {{ $feedPages := where .Site.RegularPages "Section" "in" (slice "reading" "watching" "listening") }}
    {{ $related := first (.Site.Params.related_content_limit | default 4) (where (where $feedPages ".Params.tags" "intersect" .Params.tags) "Permalink" "!=" .Permalink) }}
    {{ if $related }}
      <section class="svw-related">
        <h2 class="svw-related__heading">Related</h2>
        <div class="svw-related__grid">
          {{ range $related }}
            <a class="svw-related__card" href="{{ .RelPermalink }}">
              <span class="svw-related__card-title">{{ .Title }}</span>
              {{ with .Params.summary }}
                <span class="svw-related__card-summary">{{ . }}</span>
              {{ end }}
            </a>
          {{ end }}
        </div>
      </section>
    {{ end }}
  {{ end }}

  {{ partial "comments.html" . }}

</div>
{{ end }}
```

- [ ] **Step 3: Run `hugo server` and verify feed pages build**

Expected: `/feed/` shows three scrollable columns. Individual feed posts show the paper card article layout.

- [ ] **Step 4: Commit**

```bash
git add layouts/feed/list.html layouts/feed/single.html
git commit -m "feat: rewrite feed pages with scrollable columns and paper card articles"
```

---

## Task 8: Now Page + Mini-Map Fix

**Files:**
- Rewrite: `layouts/now/single.html`
- Edit: `static/js/mini-map.js`

- [ ] **Step 1: Rewrite now single.html**

```html
{{ define "main" }}
<div class="svw-now">

  <header class="svw-now__header">
    <h1 class="svw-now__title">Now</h1>
    {{ with .Params.subtitle }}
      <p class="svw-now__subtitle">{{ . }}</p>
    {{ end }}
  </header>

  {{/* Build category list */}}
  {{ $categories := slice
    (dict "key" "viewing"   "label" "Now Viewing"   "nav" "Viewing")
    (dict "key" "watching"  "label" "Now Watching"   "nav" "Watching")
    (dict "key" "listening" "label" "Now Listening"  "nav" "Listening")
    (dict "key" "reading"   "label" "Now Reading"    "nav" "Reading")
    (dict "key" "doing"     "label" "Now Doing"      "nav" "Doing")
    (dict "key" "feeling"   "label" "Now Feeling"    "nav" "Feeling")
  }}
  {{ $now := .Site.Data.now }}

  {{/* Filter to only categories with values */}}
  {{ $active := slice }}
  {{ range $categories }}
    {{ $k := .key }}
    {{ $l := .label }}
    {{ $n := .nav }}
    {{ $entry := index $now $k }}
    {{ with $entry }}
      {{ with .value }}
        {{ $active = $active | append (dict "key" $k "label" $l "nav" $n) }}
      {{ end }}
    {{ end }}
  {{ end }}

  <div class="svw-now__layout">

    <nav class="svw-now__nav" aria-label="Now categories">
      {{ range $active }}
        <a class="now-nav-link" href="#now-{{ .key }}" data-target="now-{{ .key }}">{{ .nav }}</a>
      {{ end }}
    </nav>

    <div class="svw-now__cards">
      {{ range $active }}
        {{ $entry := index $now .key }}
        <section class="now-card now-card--hidden" id="now-{{ .key }}">
          {{ if eq .key "viewing" }}
            {{ $photoName := $entry.value }}
            {{ $photo := $.Resources.GetMatch $photoName }}
            {{ if $photo }}
              <div class="now-card--photo">
                <img src="{{ $photo.RelPermalink }}"
                     alt="What I'm viewing now"
                     loading="lazy">
                <div class="now-card__overlay">
                  <span class="now-card__label">{{ .label }}</span>
                  {{ with $entry.updated }}
                    <span class="now-card__date">{{ dateFormat "January 2, 2006" . }}</span>
                  {{ end }}
                </div>
              </div>
            {{ end }}
          {{ else }}
            <div class="now-card__content">
              <span class="now-card__label">{{ .label }}</span>
              <span class="now-card__value">{{ $entry.value }}</span>
              {{ with $entry.updated }}
                <span class="now-card__date">{{ dateFormat "January 2, 2006" . }}</span>
              {{ end }}
            </div>
          {{ end }}
        </section>
      {{ end }}
    </div>

  </div>
</div>
{{ end }}
```

- [ ] **Step 2: Edit mini-map.js — rename mount ID and CSS classes**

In `static/js/mini-map.js`, make these surgical replacements:

Line 52: `document.getElementById('mini-map-container')` → `document.getElementById('svw-map-canvas')`

Line 64: `d3.select('#mini-map-container')` → `d3.select('#svw-map-canvas')`

Line 68: `.attr('class', 'mini-map-svg')` → `.attr('class', 'svw-map-svg')`

Line 98: `return 'mini-map-country' + (visited ? ' visited' : '')` → `return 'svw-map__country' + (visited ? ' svw-map__country--visited' : '')`

Line 105: `.attr('class', 'mini-map-border')` → `.attr('class', 'svw-map__border')`

- [ ] **Step 3: Run `hugo server` and verify now page and homepage map**

Expected: Now page shows cards with scroll-spy. Homepage mini-map renders with new class names.

- [ ] **Step 4: Commit**

```bash
git add layouts/now/single.html static/js/mini-map.js
git commit -m "feat: rewrite now page, update mini-map.js class names"
```

---

## Task 9: Travel Page + travel.js Color Fix

**Files:**
- Rewrite: `layouts/travel/list.html`
- Edit: `static/js/travel.js`

- [ ] **Step 1: Rewrite travel list.html**

```html
{{ define "main" }}
<div class="svw-travel" id="map-page">
  <div class="travel-tabs" id="travel-tabs">
    <button class="travel-tab active" data-tab="map">Map</button>
    <button class="travel-tab" data-tab="timeline">Timeline</button>
  </div>
  <div class="travel-tab-content active" id="tab-map">
    <div class="map-container" id="map-container">
      <!-- D3 renders the SVG here -->
    </div>
    <div class="map-sidebar" id="map-sidebar">
      <div class="sidebar-body" id="sidebar-body">
        <button class="sidebar-close" id="sidebar-close">&times;</button>
        <h2 class="sidebar-title" id="sidebar-title"></h2>
        <div class="sidebar-albums" id="sidebar-albums"></div>
      </div>
    </div>
  </div>
  <div class="travel-tab-content" id="tab-timeline">
    <div class="timeline-cards" id="timeline-cards"></div>
  </div>
  <div class="travel-timeline" id="travel-timeline"></div>
</div>
{{ end }}
```

- [ ] **Step 2: Edit travel.js — replace hardcoded border color**

In `static/js/travel.js`, find line 426:
```js
.style('stroke', 'rgba(100, 120, 140, 0.25)')
```

Replace with:
```js
.style('stroke', 'var(--color-ink)')
.style('stroke-opacity', '0.15')
```

This is the only hardcoded color in travel.js — the rest uses CSS classes already defined in main.css (`.map-country`, `.map-border`, etc.).

- [ ] **Step 3: Run `hugo server` and verify travel page**

Expected: Travel page renders with paper-colored map container, forest-green page background. Tabs work. Map sidebar opens.

- [ ] **Step 4: Commit**

```bash
git add layouts/travel/list.html static/js/travel.js
git commit -m "feat: rewrite travel page template, fix travel.js border color"
```

---

## Task 10: About Page

**Files:**
- Rewrite: `layouts/about/single.html`

- [ ] **Step 1: Rewrite about single.html**

```html
{{ define "main" }}
<div class="svw-about">

  <section class="svw-about__hero">
    <div class="svw-contours" style="color: var(--color-ink); opacity: 0.04;">
      <img src="{{ "contours.svg" | relURL }}" alt="" aria-hidden="true">
    </div>

    {{ $photo := .Resources.GetMatch (.Params.photo | default "*.jpg") }}
    {{ if $photo }}
      {{ $crop := .Params.photo_crop | default "Center" }}
      {{ $opts := printf "400x400 %s webp q90" $crop }}
      {{ $sized := $photo.Fill $opts }}
      <img src="{{ $sized.RelPermalink }}"
           alt="{{ .Title }}"
           class="svw-about__photo"
           width="{{ $sized.Width }}"
           height="{{ $sized.Height }}">
    {{ end }}

    <h1 class="svw-about__name">{{ .Title }}</h1>
    {{ with .Params.subtitle }}
      <p class="svw-about__subtitle">{{ . }}</p>
    {{ end }}
    {{ with .Params.tagline }}
      <p class="svw-about__tagline">{{ . | markdownify }}</p>
    {{ end }}
  </section>

  {{ with .Content }}
    <div class="svw-about__prose">
      {{ . }}
    </div>
  {{ end }}

</div>
{{ end }}
```

- [ ] **Step 2: Run `hugo server` and verify about page**

Expected: About page shows circular photo, name, subtitle, tagline on paper hero card. Prose body continues below in same card aesthetic.

- [ ] **Step 3: Commit**

```bash
git add layouts/about/single.html
git commit -m "feat: rewrite about page with paper hero card and prose"
```

---

## Task 11: Footer Custom Cleanup + Final Build Check

**Files:**
- Edit: `layouts/partials/footer_custom.html` (minor: ensure class references still match)

- [ ] **Step 1: Verify footer_custom.html compatibility**

The scroll-spy JS in `footer_custom.html` targets:
- `.now-card` → still used (unchanged class name)
- `.now-card--hidden` / `.now-card--reveal` → still used
- `.now-nav-link` → still used

The PhotoSwipe JS targets:
- `.pswp-gallery` → still used in gallery single

The video lightbox JS targets:
- `.video-gallery`, `.video-trigger`, `.video-lightbox` → still used

No changes needed to `footer_custom.html`. The existing JS is compatible with the new templates.

- [ ] **Step 2: Run full `hugo server` and verify all pages**

Check each page loads without build errors:
- `/` (homepage)
- `/now/`
- `/feed/`
- `/feed/<any-post>/`
- `/gallery/`
- `/gallery/<any-album>/`
- `/travel/`
- `/about/`

- [ ] **Step 3: Verify mobile nav toggle works**

Open the site, resize to mobile width, click the hamburger — links should appear/disappear.

- [ ] **Step 4: Verify PhotoSwipe still works**

Navigate to a gallery album, click a photo — lightbox should open.

- [ ] **Step 5: Verify video lightbox (if album has videos)**

If any album has videos, click a video thumbnail — YouTube embed should open.

- [ ] **Step 6: Verify D3 maps render**

- Homepage mini-map: should show world map with visited countries highlighted in rust
- Travel page: should show interactive map with pins, flight lines

- [ ] **Step 7: Verify scroll-spy on Now page**

Scroll through now cards — side nav should highlight the active section.

- [ ] **Step 8: Commit any final fixes**

If any issues were found and fixed during verification:
```bash
git add -A
git commit -m "fix: address issues found during Atlas Refined integration testing"
```

---

## Task 12: Cleanup and Final Commit

- [ ] **Step 1: Remove unused files if still present**

```bash
rm -f static/preview-atlas.html
```

- [ ] **Step 2: Verify the build is clean**

```bash
hugo
```

Expected: Build completes with no errors or warnings.

- [ ] **Step 3: Final commit if anything changed**

```bash
git status
# If anything changed:
git add -A
git commit -m "chore: remove temporary preview file, final cleanup"
```

---

## Summary of Commits (Expected)

1. `feat: add Atlas Refined brand assets, remove old favicons`
2. `feat: rewrite main.css with Atlas Refined design tokens and components`
3. `feat: add baseof shell, rewrite head.html, add nav.js toggle`
4. `feat: rewrite nav and footer with Atlas Refined design`
5. `feat: rewrite homepage with hero, feed columns, and map section`
6. `feat: rewrite gallery pages with postcard card design`
7. `feat: rewrite feed pages with scrollable columns and paper card articles`
8. `feat: rewrite now page, update mini-map.js class names`
9. `feat: rewrite travel page template, fix travel.js border color`
10. `feat: rewrite about page with paper hero card and prose`
11. `fix: address issues found during Atlas Refined integration testing` (if needed)
12. `chore: remove temporary preview file, final cleanup` (if needed)
