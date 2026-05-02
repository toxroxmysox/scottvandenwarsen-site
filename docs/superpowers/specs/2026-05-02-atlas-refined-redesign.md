# Atlas Refined — Full Site Redesign Spec

## Overview

Replace the existing "Moody Slate" design system with "Atlas Refined" — a warmer, traveler's-notebook direction. Forest green backgrounds, tan paper card surfaces, Fraunces/IBM Plex Mono typography, a compass monogram brand mark, topographic contour motifs, and a rust accent color.

This is a full visual rewrite. All pages adopt the new tokens. Bootstrap 3 is removed entirely. The `62.5%` font-size trick is removed. No new JS frameworks are introduced.

**What stays the same:** Hugo static site generator, existing content model (reading/watching/listening/gallery/travel/about/now), existing JS behaviors (D3 map, PhotoSwipe lightbox, video lightbox, now-page scroll-spy), Cloudflare Pages deployment, Buttondown email subscription.

**What's new:** Design tokens, typography, brand mark, nav/footer chrome, component patterns, gallery postcard card style. The Recommendations page is deferred — not built in this pass.

---

## 1. Design Tokens

All tokens live at the top of `static/css/main.css` in a single `:root` block. The old Moody Slate tokens are deleted entirely — no dark-mode `@media` override (the site is always "dark" with forest ground).

```css
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
```

---

## 2. Typography

**Fonts loaded from Google Fonts:**
- Fraunces (variable: ital, opsz 9–144, wght 300–700, SOFT axis)
- IBM Plex Mono (400, 500, 600)

**Usage:**
- `--font-display` / `--font-body`: All headings, body text, card content (Fraunces)
- `--font-ui`: Navigation, eyebrows, dates, pills, meta labels, code-like UI text (IBM Plex Mono)

**62.5% removal:** The old `html { font-size: 62.5% }` trick is removed. All sizes use straight `px` values via the `--fs-*` tokens. This means ALL existing `rem`-based values in the CSS become irrelevant (they're deleted in the rewrite).

---

## 3. Brand Mark & Assets

New files in `static/`:
- `static/svw-compass.svg` — full SVW monogram (nav wordmark, social cards, iOS icon base)
- `static/svw-compass-plain.svg` — simplified needle-only (favicon, footer, small decorative)
- `static/contours.svg` — topographic line motif (hero backgrounds, card accents)
- `static/apple-touch-icon.png` — 180x180 export of compass on forest background

Favicon strategy:
- `<link rel="icon" type="image/svg+xml" href="/svw-compass-plain.svg">`
- `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`
- Remove old `favicon.ico`, `favicon-32x32.png`, `favicon-16x16.png` references

---

## 4. Global Chrome

### 4a. baseof.html (`layouts/_default/baseof.html`)

New override replacing the theme's baseof. Controls the full document structure:

```html
<!doctype html>
<html lang="{{ .Site.LanguageCode }}">
<head>
  {{ partial "head.html" . }}
</head>
<body class="svw-page">
  {{ partial "nav.html" . }}
  {{ block "main" . }}{{ end }}
  {{ partial "footer.html" . }}
</body>
</html>
```

Body-level CSS:
```css
.svw-page {
  background: var(--color-ground);
  color: var(--color-paper);
  font-family: var(--font-body);
  font-size: var(--fs-body);
  line-height: var(--lh-body);
  min-height: 100vh;
  margin: 0;
}
```

### 4b. Navigation (`layouts/partials/nav.html`)

Complete rewrite. Structure:

```
header.svw-nav
  a.svw-nav__brand (compass SVG + "Scott Vanden Warsen")
  nav.svw-nav__links (page links)
  button.svw-nav__toggle (mobile hamburger)
```

- Background: `--color-ground-deep`
- Bottom border: `1px solid rgba(255,255,255,0.06)`
- Padding: `14px 40px`
- Brand: 28px compass SVG + `--font-display` 17px / weight 500, paper color
- Links: `--font-ui` 11px / 600, uppercase, `letter-spacing: 0.10em`, color `rgba(236,228,208,0.72)`
- Active link: `color: var(--accent)`
- Sticky: `position: sticky; top: 0; z-index: 100`

**Nav items (in order):** Home, Now, Feed, Gallery, Travel, About

**Mobile (< 768px):** Links collapse behind a hamburger button. Toggle via vanilla JS class swap (`.is-open`). No Bootstrap dependency.

### 4c. Footer (`layouts/partials/footer.html`)

Complete rewrite. Structure:

```
footer.svw-footer
  .svw-footer__subscribe (Buttondown form, styled minimal)
  .svw-footer__bar
    .svw-footer__left (compass-plain 14px + "© 2026 · Detroit, MI")
    .svw-footer__right ("RSS · Email · LinkedIn" as links)
```

- Top border: `1px solid rgba(255,255,255,0.06)`
- Padding: `18px 56px`
- Font: `--font-ui` 10px, uppercase, `letter-spacing: 0.16em`
- Color: `rgba(236,228,208,0.5)`
- Subscribe form sits above the rule line, same mono style, simple email input + submit

---

## 5. Homepage (`layouts/index.html`)

Five-band layout stacked vertically on `--color-ground`:

### 5a. Hero

```
section.svw-hero
  .svw-contours (background SVG, 8% paper opacity)
  h1.svw-hero__title ("An inside look at [what I'm thinking about] — ...")
  p.svw-hero__sub (italic 17px Fraunces, 78% paper opacity)
  .svw-hero__cta (pill row: "Read the latest" solid → /feed/, "The map" outline → /travel/)
```

- Padding: `64px 56px 36px 56px`
- H1: `--fs-hero` (52px), weight 400, lh 1.06, ls -0.025em, paper color
- Italic emphasized phrase: `.svw-emph` — `font-style: italic; color: var(--accent)`
- Subhead: max-width 640px, margin-top 18px
- No "Recommendations" pill (deferred)
- Contours SVG: `position: absolute; inset: 0; pointer-events: none; color: var(--color-paper); opacity: 0.08`

**Contours usage across the site:**
- Homepage hero: `color: var(--color-paper); opacity: 0.08` (paper lines on forest)
- Homepage map section: `color: var(--color-ink); opacity: 0.06` (ink lines on paper card)
- About hero card: `color: var(--color-ink); opacity: 0.04` (very subtle on paper)
- Elsewhere: not used — keep postcards and feed cards clean

### 5b. Feed Columns

```
section.svw-feed
  article.svw-card (×3: Reading, Watching, Listening)
```

- 3-column CSS grid, gap 18px
- Section padding: `24px 56px 30px 56px`
- Per card: paper background, 4px radius, `20px 22px` padding, `--shadow-card`
- Card header: chip (N/E/W) + title, separated by 2px solid ink rule
- Chip: 22×22 circle, ink bg, paper text, `--font-ui` 10px/700
- Card titles: Reading (N), Watching (E), Listening (W)
- Feed rows: eyebrow (date ◆ source), title (15px/500), summary (12.5px ink-soft)
- Item limit: controlled by existing `feedItemLimit` param (default 5)

### 5c. The Map Section

```
section.svw-map-section
  header (S chip inverted + "The Map" title + eyebrow subtitle)
  .svw-map__canvas (D3 mini-map mounts here)
```

- Full-width below feed columns
- Padding: `30px 56px 50px 56px`
- S chip is inverted (paper background, ink text) since it's the row's only content
- The mini-map.js renders inside `.svw-map__canvas` with restyled colors
- Below the map: "Explore the Map →" link in accent color

---

## 6. Gallery

### 6a. Gallery List (`layouts/gallery/list.html`)

**Postcard card design.** Each album is rendered as a physical postcard:

```
a.svw-postcard
  .svw-postcard__photo (cover image, fills top portion)
  .svw-postcard__body (paper surface below image)
    .svw-postcard__title
    .svw-postcard__meta (date + counts)
```

Layout: CSS grid, `repeat(auto-fill, minmax(320px, 1fr))`, gap 24px.
Page padding: `var(--space-8) var(--space-7)`.

**Postcard styling:**
- Background: `--color-paper`
- Border-radius: `--radius-card` (4px)
- Box-shadow: `--shadow-card`
- Photo portion: takes up ~65% of card height, `object-fit: cover`, no border-radius on inner image (sharp edge where photo meets paper)
- Body portion: 14px padding, paper background
- Title: `--font-display` 16px/500, `--color-ink`
- Meta: `--font-ui` 9.5px, `--color-ink-faint`, uppercase, letter-spaced
- Photo count badge: positioned on image, rust accent background, paper text, mono font
- Location flag: positioned on image, top-left
- Hover: subtle lift via `translateY(-2px)` + `--shadow-card-lg`
- The entire card is an `<a>` link (same as current)

### 6b. Gallery Single (`layouts/gallery/single.html`)

- Forest page background
- Breadcrumb: mono eyebrow style, paper color, `← Gallery`
- Date: `--font-ui` eyebrow, `--color-paper` at 55% opacity
- Album title: `--font-display` `--fs-section`, paper color
- Album description (if any): Fraunces `--fs-body`, paper at 78% opacity
- Photo grid: CSS grid `repeat(auto-fill, minmax(280px, 1fr))`, gap 12px
- Each photo: `--radius-card` border-radius, slight shadow on hover
- PhotoSwipe behavior unchanged
- Video gallery section: same grid, video thumbnail + play button overlay
- Video lightbox: unchanged behavior, just color-updated (forest backdrop)

---

## 7. Feed Pages

### 7a. Feed List (`layouts/feed/list.html`)

Uses the same three-column layout as the homepage feed section, but shows ALL items (no limit). The partial `home/feed-columns.html` already handles this via `$limit = 9999` when `Section == "feed"`.

Restyled with the svw-card + svw-feed-row patterns (same as homepage).

### 7b. Feed Single (`layouts/feed/single.html`)

- Forest page background
- Breadcrumb: `--font-ui` eyebrow style, `← Back`
- Hero card: paper background, `--radius-card`, `--shadow-card`
  - Date: `--font-ui` meta size, `--color-ink-faint`
  - Title: `--font-display` `--fs-section` (28px), `--color-ink`
  - Tags: pills using `.svw-pill--light` (on paper surface)
  - External link button: `.svw-pill--solid` (rust bg, paper text)
- Article body: paper card continuation (or seamless with hero card)
  - Font: `--font-body` 16px / 1.55
  - Links: `--accent` color
  - Code blocks: `--color-ground-deep` background, `--font-ui`
  - Blockquotes: 2px left border `--accent`, italic, `--color-ink-soft`
- Related posts: grid of small paper cards
  - Title: `--font-display` 15px/500
  - Summary: 12.5px `--color-ink-soft`
- Prev/Next navigation: mono eyebrow style arrows
- Comments (Cusdis): unchanged, just token-adjusted background

---

## 8. Now Page (`layouts/now/single.html`)

- Forest page background
- Page header: `--font-display` `--fs-page` (50px), paper color, centered
- Subtitle: Fraunces italic 17px, 78% paper opacity
- Layout: same sticky side-nav + scrollable cards structure
- Side nav: `--font-ui` 11px uppercase, paper at 55% opacity, active = `--accent`
- Cards: paper background, `--radius-card`, `--shadow-card`, `20px 24px` padding
  - Label: `--font-ui` eyebrow, `--color-ink-faint`
  - Value: `--font-display` `--fs-section` (28px), `--color-ink`
  - Date: `--font-ui` `--fs-meta`, `--color-ink-faint`
- Photo card (viewing): image fills card with no padding, paper surface below for overlay labels
- Scroll-spy JS behavior: unchanged, just reads new CSS custom properties for opacity

---

## 9. Travel Page (`layouts/travel/list.html`)

- Forest page background (same as current — it already suppresses the header)
- Travel tabs: restyle with `--font-ui` eyebrow, paper text, active tab = `--accent` underline
- Map container: paper background, `--radius-card` on the container, subtle `--shadow-card`
- D3 map styling:
  - Land fill: `--color-ink` at 12% opacity (very subtle silhouette on paper)
  - Land stroke: `--color-ink` at 25% opacity
  - Water (paper background): `--color-paper` (the card surface)
  - City pins: `--accent` filled circles (3.5px radius), with 9px faint accent ring
  - Flight paths: dashed `--accent` stroke, 1.5px width
  - Hover state: pin enlarges, accent ring pulses
- Map sidebar: paper background, ink text, same card shadow
- Timeline tab: paper cards for each trip, stacked vertically
  - Title: `--font-display` `--fs-card-title`
  - Date: `--font-ui` eyebrow style
  - Gallery thumbnails: small rounded images
- Desktop timeline strip: `--font-ui` labels, accent markers for trip points

**travel.js changes:** The existing JS references hardcoded colors. Update to read CSS custom properties via `getComputedStyle` at initialization, or define color constants at the top of the file that reference the token values directly. The map should still look like a recognizable world map — land masses are subtly visible against the paper surface.

---

## 10. About Page (`layouts/about/single.html`)

- Forest page background
- Hero section: paper card, centered, `--shadow-card`, max-width `--content-max`
  - Photo: circular crop, 200×200, `border-radius: 50%`, `object-fit: cover`, with subtle box-shadow
  - Name: `--font-display` `--fs-page`, `--color-ink`, centered
  - Subtitle: `--font-ui` eyebrow style, `--color-ink-faint`, centered
  - Tagline: `--font-body` 16px, `--color-ink-soft`, centered
- Body prose: same paper card surface continues below hero (single card, not two)
  - Font: `--font-body` 16px / 1.55
  - Links: `--accent`
  - Headings: `--font-display`, h2 = `--fs-card-title`, h3 = `--fs-item`
  - Paragraphs: `--color-ink`, 24px margin between
  - Lists: `--color-ink-soft`, standard indentation

---

## 11. CSS Architecture

The new `static/css/main.css` structure (top to bottom):

1. **Tokens** (`:root` block — all custom properties)
2. **Reset/Base** (minimal box-sizing, margin reset, body styles, `::selection`)
3. **Atoms** (`.svw-eyebrow`, `.svw-pill`, `.svw-emph`, `.svw-contours`)
4. **Components** (`.svw-card`, `.svw-feed-row`, `.svw-postcard`, `.svw-nav`, `.svw-footer`, `.svw-hero`)
5. **Page-specific** (homepage layout, feed single, gallery, now, travel, about)
6. **Utilities** (skip-link accessibility, print styles if any)

**What's deleted:**
- All Bootstrap grid classes (`.container`, `.row`, `.col-*`)
- All Beautiful Hugo theme styles (legacy section)
- All Moody Slate color system
- The `62.5%` font-size trick
- All `rem`-based sizing (replaced with px tokens)
- The `@media (prefers-color-scheme: dark)` override block
- All frosted-glass card CSS (`.feed-card`, `.feed-card-link`, etc.)

**What's preserved (functionality, not styling):**
- PhotoSwipe CSS (external CDN, untouched)
- Video lightbox layout (restyled)
- Skip-link (restyled)
- Travel page map/sidebar/timeline structure (restyled)
- Now page scroll-spy card structure (restyled)
- Gallery photo grid (restyled)

---

## 12. Bootstrap Removal

**CSS:** Remove the `<link>` to `bootstrap.min.css` from `head.html`.

**JS:** Remove `<script src="bootstrap.min.js">` and jQuery from `footer.html`. The only Bootstrap JS was for the navbar collapse — replaced by vanilla JS toggle.

**Templates:** Remove all `.container`, `.row`, `.col-*` classes. Replace with:
- `.svw-feed` for the 3-column feed (CSS grid)
- `.svw-recs-grid` for future recommendations (CSS grid)
- Page-level max-width via `.svw-page-content { max-width: var(--content-max); margin: 0 auto; }`
- Gallery grid via CSS grid `auto-fill`

**head.html cleanup:**
- Remove KaTeX CSS/JS (not used)
- Remove FontAwesome CSS (replaced by SVG compass icons)
- Remove Lora / Open Sans font links (replaced by Fraunces / IBM Plex Mono)
- Remove photoswipe CSS from CDN (keep — still needed for gallery)
- Actually: keep PhotoSwipe CSS and JS (still used in gallery single pages)

---

## 13. Mobile Responsiveness

**Breakpoints:**
- `< 768px`: Single column feed, stacked postcards, hamburger nav
- `768px–1024px`: 2-column gallery grid, smaller hero text
- `> 1024px`: Full 3-column feed, full hero, desktop nav

**Mobile nav:**
- Hamburger icon: three 2px horizontal lines, 20px wide, paper color
- Opens: full-width dropdown below nav bar, forest background, links stacked vertically
- Vanilla JS: toggle `.is-open` class on `.svw-nav__links`

**Mobile hero:**
- `--fs-hero` reduces to ~32px
- Padding reduces to `40px 24px 24px`

**Mobile feed columns:**
- Single column stack (each card full-width)
- Gap: 14px

**Mobile gallery:**
- Single column postcards
- Photo portion maintains aspect ratio

**Mobile travel:**
- Already handled by existing travel.js mobile behavior (tabs, bottom sheet)
- Just reskinned

---

## 14. Font Loading

In `layouts/partials/head.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300..700,30..100;1,9..144,300..700,30..100&family=IBM+Plex+Mono:wght@400;500;600&display=swap">
```

Remove Lora and Open Sans links.

---

## 15. Asset Migration

From `design_handoff_atlas_refined 4/assets/` to `static/`:
- `svw-compass.svg` → `static/svw-compass.svg`
- `svw-compass-plain.svg` → `static/svw-compass-plain.svg`
- `contours.svg` → `static/contours.svg`
- `apple-touch-icon.svg` → used to generate `static/apple-touch-icon.png` (180x180)

---

## 16. What's NOT in Scope

- Recommendations page (deferred — no nav link, no template, no content)
- Dark/light mode toggle (always forest-ground)
- JS framework introduction
- Content editing (all body text is read-only per CLAUDE.md)
- SEO/Open Graph image updates (separate task)
- Email subscription modal or dedicated subscribe page
