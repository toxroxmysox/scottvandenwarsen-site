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
- `static/svw-compass.svg` — full SVW monogram with S/V/W letters at cardinal positions, north needle in `var(--accent)`, body in `currentColor`. Used everywhere: nav, favicon, footer, social cards, iOS icon.
- `static/contours.svg` — topographic line motif (hero backgrounds, card accents)
- `static/apple-touch-icon.png` — 180×180 export of SVW compass on `--color-ground` background

There is only ONE compass variant. The full SVW monogram is used at all sizes — no simplified/needle-only version.

Favicon strategy:
- `<link rel="icon" type="image/svg+xml" href="/svw-compass.svg">`
- `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`
- Remove old `favicon.ico`, `favicon-32x32.png`, `favicon-16x16.png` references from `head.html`
- Update `<meta name="theme-color" content="#162923">` (forest green)

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

**Nav toggle JS:** Lives in `static/js/nav.js` — a small standalone file (~15 lines). It queries `.svw-nav__toggle` and toggles `.is-open` on `.svw-nav__links`. Load it with `<script defer src="{{ "js/nav.js" | relURL }}"></script>` in `baseof.html` just before `</body>`. This keeps nav logic separate from page-specific scripts in `footer_custom.html`.

### 4c. Footer (`layouts/partials/footer.html`)

Complete rewrite. Structure:

```
footer.svw-footer
  .svw-footer__subscribe (Buttondown form, styled minimal)
  .svw-footer__bar
    .svw-footer__left (svw-compass 14px + "© 2026 · Detroit, MI")
    .svw-footer__right ("RSS · Email · LinkedIn" as links)
```

- Top border: `1px solid rgba(255,255,255,0.06)`
- Padding: `18px 56px`
- Font: `--font-ui` 10px, uppercase, `letter-spacing: 0.16em`
- Color: `rgba(236,228,208,0.5)`

**Subscribe form (Buttondown):** Sits above the footer rule line. Preserve the existing form action from `layouts/partials/subscribe-form.html` — it uses `{{ .Site.Params.buttondownFormAction }}` and includes a honeypot field. Restyle it with Atlas tokens:

```html
{{ with .Site.Params.buttondownFormAction }}
<div class="svw-footer__subscribe">
  <label for="bd-email" class="svw-eyebrow">Get new posts delivered to your inbox</label>
  <form method="POST" action="{{ . }}" class="svw-footer__subscribe-form">
    <input type="email" name="email" id="bd-email" placeholder="Your email" required />
    <button type="submit" class="svw-pill svw-pill--solid">Subscribe</button>
    <div style="position: absolute; left: -5000px;" aria-hidden="true">
      <input type="text" name="a_password" tabindex="-1" autocomplete="off" />
    </div>
  </form>
</div>
{{ end }}
```

Subscribe form styling: input gets `--font-ui` 12px, `--color-ground-deep` background, `--color-paper` text, 1px `rgba(236,228,208,0.2)` border, `--radius-pill`. Button uses `.svw-pill--solid` (rust bg, paper text).

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

**CTA pill hover states:**
- `.svw-pill--solid` (rust bg): on hover → darken 10% via `filter: brightness(0.9)`, cursor pointer
- `.svw-pill--outline` (transparent bg, paper border): on hover → `background: rgba(236,228,208,0.08)`, border brightens to full paper opacity
- Both: `transition: all 0.15s ease`

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
- **Homepage item limit: 3 per column** (hardcoded in the homepage template, not from config)

### 5c. The Map Section

```
section.svw-map-section
  header (S chip inverted + "The Map" title + eyebrow subtitle)
  .svw-map__canvas (D3 mini-map mounts here)
```

- Full-width below feed columns
- Padding: `30px 56px 50px 56px`
- S chip is inverted (paper background, ink text) since it's the row's only content
- Below the map: "Explore the Map →" link in accent color

**mini-map.js integration:**
- The map currently mounts on `#mini-map-container`. Rename this element to `.svw-map__canvas` (use `id="svw-map-canvas"` since the JS uses `getElementById`).
- Update `static/js/mini-map.js` line 52: change `document.getElementById('mini-map-container')` to `document.getElementById('svw-map-canvas')`.
- Update line 64: change `d3.select('#mini-map-container')` to `d3.select('#svw-map-canvas')`.
- The map uses CSS classes for colors (`.mini-map-country`, `.mini-map-country.visited`, `.mini-map-border`) — no hardcoded JS colors. Rename these classes to `.svw-map__country`, `.svw-map__country--visited`, `.svw-map__border` and define new styles in main.css:

```css
.svw-map__canvas svg { display: block; width: 100%; }
.svw-map__country { fill: var(--color-ink); opacity: 0.10; stroke: none; }
.svw-map__country--visited { fill: var(--accent); opacity: 0.55; }
.svw-map__border { fill: none; stroke: var(--color-ink); stroke-width: 0.5px; opacity: 0.15; }
```

- Update the JS class assignments at lines 98 and 105 to use the new class names.
- The map container gets a paper background: `background: var(--color-paper); border-radius: var(--radius-card); padding: 12px;` so the map looks like it's drawn on paper.

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

Same three-column card layout as homepage, but each column shows ALL items for its category (no limit). Each column becomes a scrollable container:

- Each `.svw-card` gets `max-height: 80vh; overflow-y: auto` so the three columns scroll independently
- Items flow infinitely within each column — all content is rendered server-side (no pagination/JS needed)
- The partial should accept a `$limit` parameter: homepage passes `3`, feed list passes `0` (meaning all)
- Restyled with the svw-card + svw-feed-row patterns (same visual treatment as homepage)

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
- Photo card (viewing): The now-photo image fills the top of its card edge-to-edge (no padding on the image area), with the paper surface providing padding below for the label. This uses the same structure as the current implementation — `data/now.yaml` provides `photo:` which the partial renders inside a card. Just restyle with `border-radius: var(--radius-card)` on the card container and `border-radius: var(--radius-card) var(--radius-card) 0 0` on the image itself.
- Scroll-spy JS behavior: unchanged. The existing JS in `footer_custom.html` toggles `.active` classes on the side-nav links based on scroll position. Just update the CSS for `.active` to use `color: var(--accent)` instead of the old link color.

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

**travel.js color approach:** The existing JS references hardcoded colors. Replace them by reading CSS custom properties at initialization:

```js
var style = getComputedStyle(document.documentElement);
var COLORS = {
  ground: style.getPropertyValue('--color-ground').trim(),
  paper: style.getPropertyValue('--color-paper').trim(),
  ink: style.getPropertyValue('--color-ink').trim(),
  accent: style.getPropertyValue('--accent').trim(),
};
```

Then reference `COLORS.accent` etc. wherever the JS currently hardcodes hex values. The map should still look like a recognizable world map — land masses are subtly visible against the paper surface.

**Files edited:**
- `static/js/travel.js` — replace hardcoded hex colors with `COLORS.*` references (edit in place)
- `static/js/mini-map.js` — rename mount ID, rename CSS classes (edit in place)
- Neither file is rewritten from scratch — surgical edits only

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

**JS:** Remove these script tags from `layouts/partials/footer.html` (currently at lines 78-82):
- KaTeX (`katex.min.js`, `auto-render.min.js`)
- jQuery (`jquery-3.7.0.slim.min.js`)
- Bootstrap (`bootstrap.min.js`)
- `js/main.js` (Beautiful Hugo theme JS — no longer needed)

**Keep** in footer.html:
- PhotoSwipe scripts (`photoswipe.min.js`, `photoswipe-ui-default.min.js`)
- `js/load-photoswipe.js`
- `{{ partial "footer_custom.html" . }}` (page-specific JS)

**Templates:** Remove all `.container`, `.row`, `.col-*` classes. Replace with:
- `.svw-feed` for the 3-column feed (CSS grid)
- Page-level max-width via `.svw-page-content { max-width: var(--content-max); margin: 0 auto; }`
- Gallery grid via CSS grid `auto-fill`

**head.html cleanup (remove if present):**
- Remove KaTeX CSS (`katex.min.css`) and JS (`katex.min.js`, `auto-render.min.js`) — not used on any page
- Remove all FontAwesome CSS links (7 stylesheets in the CDN block) — replaced by SVG compass
- Remove Lora / Open Sans font links — replaced by Fraunces / IBM Plex Mono
- Remove Bootstrap CSS (`bootstrap.min.css`)
- Remove the `selfHosted` conditional blocks entirely (site uses CDN mode)
- **Keep:** PhotoSwipe CSS and JS (still used in gallery single pages)
- **Keep:** RSS alternate link
- **Keep:** syntax.css / codeblock.css (for code blocks in feed articles)

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

From `/Users/Scott/Downloads/design_handoff_atlas_refined 4/assets/` to `static/`:
- `svw-compass.svg` → `static/svw-compass.svg` (the full SVW monogram — only variant)
- `contours.svg` → `static/contours.svg`
- Generate `static/apple-touch-icon.png` (180×180) from the compass SVG on `#162923` background

---

## 16. File Manifest

### Create (new files)
| File | Purpose |
|------|---------|
| `layouts/_default/baseof.html` | Override theme baseof — full document shell |
| `static/js/nav.js` | Mobile hamburger toggle (~15 lines) |
| `static/svw-compass.svg` | Brand mark (copy from handoff) |
| `static/contours.svg` | Topographic motif (copy from handoff) |
| `static/apple-touch-icon.png` | 180×180 compass on forest bg (generate from SVG) |

### Rewrite (full replacement)
| File | Notes |
|------|-------|
| `static/css/main.css` | Complete rewrite — old file is 3,878 lines of Moody Slate + Bootstrap overrides |
| `layouts/partials/nav.html` | New svw-nav structure |
| `layouts/partials/footer.html` | New svw-footer + subscribe form |
| `layouts/partials/head.html` | New font links, favicon, remove Bootstrap/FA/KaTeX |
| `layouts/index.html` | Hero + feed columns + map bands |
| `layouts/gallery/list.html` | Postcard grid |
| `layouts/gallery/single.html` | Forest bg + photo grid (keep PhotoSwipe) |
| `layouts/feed/list.html` | Three scrollable columns |
| `layouts/feed/single.html` | Paper card article layout |
| `layouts/now/single.html` | Restyled cards + side nav |
| `layouts/travel/list.html` | Restyled tabs + map container |
| `layouts/about/single.html` | Paper hero card + prose |
| `layouts/partials/home/feed-columns.html` | svw-card + svw-feed-row partial (accepts `$limit`) |
| `layouts/partials/home/gallery-card.html` | Becomes svw-postcard partial |

### Edit (surgical changes)
| File | Changes |
|------|---------|
| `static/js/mini-map.js` | Rename mount ID, rename CSS class strings |
| `static/js/travel.js` | Replace hardcoded hex colors with `COLORS.*` from CSS vars |
| `layouts/partials/footer_custom.html` | Remove jQuery/Bootstrap script tags, keep page-specific JS |

### Delete
| File | Reason |
|------|--------|
| `static/favicon.ico` | Replaced by SVG |
| `static/favicon-32x32.png` | Replaced by SVG |
| `static/favicon-16x16.png` | Replaced by SVG |
| `static/preview-atlas.html` | Temporary preview file |

### Unchanged (explicitly keep)
- `static/js/load-photoswipe.js` — still needed for gallery
- `static/data/world-110m.json` — still needed for maps
- `static/css/syntax.css`, `static/css/codeblock.css` — still needed for code blocks
- All `content/` files — read-only per CLAUDE.md
- `themes/beautifulhugo/` — overridden, not edited

---

## 17. What's NOT in Scope

- Recommendations page (deferred — no nav link, no template, no content)
- Dark/light mode toggle (always forest-ground)
- JS framework introduction
- Content editing (all body text is read-only per CLAUDE.md)
- SEO/Open Graph image updates (separate task)
- Email subscription modal or dedicated subscribe page
