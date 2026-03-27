# Current Tasks

_No active tasks._

## Completed

- [x] Typography scale & design consistency (commit bb0e085, pushed to main)
  - Added 5-step typography scale tokens to `:root`: `--text-sm` (12px), `--text-base` (15px), `--text-lg` (18px), `--text-xl` (24px), `--text-2xl` (30px)
  - Added line-height tokens: `--leading-tight/normal/relaxed/loose`
  - Added font-weight tokens: `--weight-normal/medium/bold/heavy`
  - Applied tokens across all custom CSS components (feed cards, gallery cards, now-playing, subscribe form, about page, 404 page, map sidebar, breadcrumbs, related posts, comments, tag pills)
  - Fixed subscribe form: 9px → 15px
  - Fixed feed card summaries: 10px → 15px
  - Fixed feed card titles: 15px → 18px (matches gallery cards)
  - Fixed now-playing value: 13px → 18px
  - Nav links: 12px → 15px (with tablet scaling back to 12px to prevent wrapping)
  - Section headings: 30px → 24px
  - About hero name: 32px → 30px, subtitle: 16px → 24px
  - Feed card meta date contrast improved (`--text-faint` → `--text-subtle`)
  - Breadcrumbs unified across feed and gallery (both 15px)
  - Verified at desktop (1400px), tablet (768px), mobile (375px)

- [x] Now-playing widget + feed breadcrumb fix (commit 85b97d7, pushed to main)
  - `data/now.yaml`: per-field data source (value + updated date)
  - `layouts/partials/now-playing.html`: reusable partial with triple-nested `with` guards
  - Widget injected in `feed-columns.html` (homepage + /feed/) and `_default/list.html` (section pages)
  - Centered text, label on own line, blue/purple gradient separator matching section headings
  - Feed breadcrumb: `history.back()` with `/feed/` fallback
  - Edge cases: missing field, empty values, deleted file all handled gracefully
  - Tracked `.claude/commands/` and `.claude/settings.json` in git; gitignored `.claude/worktrees/`

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

- [x] Gallery lightbox, card badges, feed archive, album breadcrumbs (PR #7, merged)
  - PhotoSwipe v4 lightbox on album pages — no more raw JPEG in new tab
  - Gallery cards: country flag (top-left) + photo count (top-right) corner badges
  - Card overlay text +25% larger (title, summary, badge, flag)
  - Album thumbnails: `aspect-ratio: 4/3` instead of fixed height — no distortion
  - Album pages: `← Gallery` breadcrumb at top and bottom
  - Feed page (`/feed`): bypasses 5-item cap to show full archive
  - Unique per-photo `alt` text (`Egypt 2023 — photo 3`) for accessibility
  - `data/country_flags.json`: ISO 3166-1 → flag emoji for 190+ countries

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

---

## Future Session Backlog

### Content Additions
- [ ] **Now page** (`/now/`) — what you're currently focused on, updated regularly. Creates return visits.
- [ ] **Uses/Tools page** — gear, apps, services you use. Surprisingly popular content type.

### Design Polish
- [ ] Micro-interactions on feed/gallery cards (subtle hover animations, glow effects)
- [ ] Homepage hero section — add a tagline/subheading communicating what the site is about in <10 words
- [ ] Visual section dividers between feed columns (gradient lines or subtle separators)
- [ ] Sticky back-to-top button for long pages
- [ ] Textural elements — noise/grain overlay on dark backgrounds for depth
- [ ] Scroll-triggered fade-in animations as sections enter viewport

### Content Enhancements
- [ ] Newsletter archive — display past Buttondown editions on-site (SEO + discoverability)
- [ ] Enhanced gallery narratives — travel dates, favorite shots, stories alongside photos
- [ ] Link log / "Recently bookmarked" section for short-form curation

### Design Inspiration Sites to Study
- Tobias van Schneider (minimalist, lets work shine)
- Johnny Harris (clean typeface, scrapbook aesthetic)
- Devon Stank (video hero)
- Mindy Nguyen (excellent fonts, spacing, hierarchy)
- Peter McKinnon (image collage + parallax)
