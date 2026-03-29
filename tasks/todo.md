# Current Tasks

_No active tasks._

- [x] Trip & gallery workflow tooling (session 2026-03-28)
  - Enhanced `/add-gallery` Claude Code skill — creates gallery + optionally links trip to `data/trips.yaml`
  - Build-time validation: `warnf` in `layouts/index.tripsjson.json` warns if trip references nonexistent gallery
  - Commented trip template at bottom of `data/trips.yaml` for quick copy-paste
  - iOS Shortcut "Log Trip" — appends trip to GitHub via API, triggers Cloudflare rebuild
  - Shortcut docs: `docs/shortcuts/trip-logging.md` with reusable pattern for future shortcuts

## Completed

- [x] Travel page: map + timeline + flight lines + mobile tabs (PR #15, merged)
  - Renamed `/map/` → `/travel/` with alias redirect
  - Created `data/trips.yaml` as single source of truth for trip data
  - Built `travel.js` (~1000 lines) replacing `map.js` — pub/sub state management
  - Horizontal timeline strip (desktop) with chronological trip nodes
  - SVG flight line arcs between consecutive trips
  - Enhanced sidebar: trip info, gallery cards, prev/next navigation
  - Mobile two-tab layout (Map / Timeline) with gallery-style overlay cards
  - Fixed French Guiana overseas territory splitting
  - Removed navbar logo circle
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
- [x] Author config + custom 404 page (PR #10)
- [x] Fix mobile bottom sheet touch passthrough (PR #5, merged)
- [x] Gallery lightbox, card badges, feed archive, album breadcrumbs (PR #7, merged)
- [x] Mobile/tablet responsive map page (PR #4, merged)
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
