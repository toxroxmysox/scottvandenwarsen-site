## Claude Code Handoff — YouTube Videos in Photo Galleries

**Goal:** Add YouTube video support to existing photo galleries,
displayed after photos in the grid, with a lightbox player
on click.

**Context:** Galleries are folder-based — Hugo auto-discovers
images. Videos declared explicitly via YouTube IDs in gallery
index.md frontmatter. Videos render after photos. Clicking a
video thumbnail opens a lightbox with the YouTube embed.
Videos should be unlisted on YouTube.

---

### RESOLVE BEFORE STARTING

- [ ] Inspect current gallery template — how images are looped,
  what range/resource function is used
- [ ] Check if lightbox is already implemented — if so, document
  its trigger mechanism, file location, and how it could be
  extended for video iframes
- [ ] Confirm frontmatter structure of existing gallery index.md
- [ ] Check existing CSS for gallery grid items — confirm grid
  approach (CSS grid, flexbox, columns?)
- [ ] Does the author convert HEIC to JPG before adding to
  galleries, or are HEIC files present? (Relevant for grid
  item sizing consistency)

---

### Frontmatter Schema

```yaml
videos:
  - id: "dQw4w9WgXcQ"
    title: "Seville — walking the old city"
    caption: "Optional caption"
  - id: "xxxxxxxxxxx"
    title: "Granada highlights"
```

- id: YouTube video ID only, not full URL
- title: required
- caption: optional
- No `videos` field = no videos rendered, gallery unaffected
- Empty `videos: []` = no videos rendered, no errors

---

### Gallery Grid

- Existing photo grid unchanged
- Videos appended after all photos in the same grid
- Each video grid item:
  - Thumbnail: `https://img.youtube.com/vi/[ID]/maxresdefault.jpg`
  - **Fallback:** maxresdefault.jpg returns 404 on some videos.
    Use `<img>` with `onerror` handler that swaps src to
    `https://img.youtube.com/vi/[ID]/hqdefault.jpg`
  - Play button overlay — centered, semi-transparent dark circle
    with white triangle, clearly visible over any thumbnail
  - Title below thumbnail if present, matching photo caption style
  - Caption below title if present
  - Visually consistent with photo grid items in size and spacing

---

### Lightbox

- **First: check if existing lightbox is implemented.** If yes,
  extend it for video iframes. If no, build a minimal one.
- Dark overlay (rgba black, ~0.9 opacity), centered content
- YouTube iframe parameters: `autoplay=1&rel=0&modestbranding=1`
- Title and caption displayed below iframe
- Close on: button click (X in top right), click outside iframe,
  or Escape key
- No prev/next between videos — close and select from grid
- **YouTube iframe loads ONLY when lightbox opens** — grid shows
  only thumbnail images, never iframes
- **Mobile sizing:** iframe fills viewport width with padding
  (e.g., `calc(100vw - 2rem)`), height set by 16:9 aspect ratio
  (`aspect-ratio: 16/9` or padding-bottom hack for older browsers).
  This results in a small-ish player on portrait phones — acceptable.

---

### Files Likely Involved

- layouts/partials/gallery-grid.html — add video rendering
  after photo loop
- layouts/partials/lightbox.html — extend or create
- static/js/gallery.js — extend for video lightbox handling
- static/css/gallery.css — play button overlay, lightbox styles

**Constraints:**

- Do not modify theme files directly
- Existing photo galleries must be completely unaffected
  if no `videos` field in frontmatter
- YouTube iframe must not load until lightbox opens —
  no iframes in the DOM on page load
- Lightbox must work on mobile
- Play button overlay must be pure CSS (no image asset required)
