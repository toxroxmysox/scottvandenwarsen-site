# Current Tasks

_No active tasks._

## Completed

- [x] Author config + custom 404 page (PR #10)
  - `hugo.toml`: added `description`, `rss = true`
  - `layouts/404.html`: branded 404 with Moody Slate styling + nav pill links
  - Mobile responsive: nav links stack vertically at ≤480px

- [x] Fix mobile bottom sheet touch passthrough (PR #5, merged)
  - Root cause: iOS WebKit routes touches to `touch-action:none` SVG through `position:fixed` overlays
  - Fix: `position:absolute` (not `fixed`) on the sidebar; parent `.map-page` is `position:relative`
  - Added real `.sheet-handle` DOM element (pseudo-elements can't receive touch events)
  - Handle drag-down → close, drag-up → expand via `max-height` growth (not `translateY`)
  - `touch-action:none` on handle, `touch-action:pan-y` on scrollable `.sidebar-body`
  - `.dragging` class disables CSS transitions during drag; removed on release for snap animation
  - Removed broken `svg.on('.zoom',null)` approach from PR #4

- [x] Mobile/tablet responsive map page (PR #4, merged)
  - Mobile (≤767px): sidebar → bottom sheet with `translateY` animation, drag handle, momentum scroll
  - Tablet (768px–1023px): side panel tightened to 40% width
  - `zoomToFeature()` rewritten: viewport-aware centering (vertical offset on mobile, sidebar fraction on tablet/desktop)
  - Touch affordances: brighter fill on `has-gallery` countries via `@media (hover: none)`
  - Country label hidden on mobile; sidebar auto-closes on orientation change

- [x] Homepage redesign: Moody Slate colors, glassy feed cards, overlay gallery grid (PR #1, merged)
- [x] Set up CLAUDE.md, tasks/lessons.md, tasks/todo.md
- [x] Code cleanup: CSS design tokens, variablize Moody Slate, template hygiene (PR #2, merged)
  - CSS `:root` design token block — all colors, fonts, radii, transitions in one place
  - All Moody Slate hex values replaced with `var(--token)` references
  - Dead legacy CSS removed (old link colors, empty media query, duplicate nav block)
  - `gallery/single.html` rewritten — 7 inline styles → named CSS classes
  - `feed/single.html`, `index.html` inline styles removed
  - Duplicate `<title>` in `head_custom.html` deleted
  - `feedItemLimit` and `galleryAlbumLimit` params added to `hugo.toml`
