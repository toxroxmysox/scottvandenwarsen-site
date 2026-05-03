# Current Tasks

_No active tasks._

- [x] Atlas Refined visual redesign (PR #20, merged)
  - Complete rewrite of CSS from scratch — removed Bootstrap 3, new token system (paper/ink/accent)
  - New `baseof.html` shell, nav with SVW compass monogram, footer with subscribe form
  - Homepage: hero section, 3-column feed, gallery postcards, mini-map
  - Gallery: postcard cards with flag/photo-count badges, PhotoSwipe lightbox
  - Feed: paper card articles, scrollable columns
  - Travel: tab visibility, country highlighting fix
  - About, Now pages rewritten
  - Fixed EXIF orientation on 89 gallery images (baked rotation into pixels)
  - Brand assets: SVW compass SVG, contour background, OG images

- [x] YouTube video support in photo galleries (PR #17, merged)
  - Videos declared in gallery frontmatter (`videos:` array with `id`, `title`, optional `caption`)
  - Thumbnails render after photos in same grid with CSS play-button overlay
  - Custom lightbox matching PhotoSwipe visual style (0.92 opacity, fade, close button)
  - iframe created on click, destroyed on close — no iframes at rest
  - Gallery card badge: "N photos, M videos"
  - Overlay tokens: `--overlay-play`, `--overlay-play-hover`, `--overlay-backdrop`
  - Switzerland 2026 album includes first video: Mid-Mountain Drone

- [x] Trip & gallery workflow tooling (session 2026-03-28)
  - Enhanced `/add-gallery` Claude Code skill — creates gallery + optionally links trip to `data/trips.yaml`
  - Build-time validation: `warnf` in `layouts/index.tripsjson.json` warns if trip references nonexistent gallery
  - Commented trip template at bottom of `data/trips.yaml` for quick copy-paste
  - iOS Shortcut "Log Trip" — appends trip to GitHub via API, triggers Cloudflare rebuild
  - Shortcut docs: `docs/shortcuts/trip-logging.md` with reusable pattern for future shortcuts

- [x] Add-video tooling & iOS Shortcut (session 2026-03-29)
  - New `/add-video` Claude Code skill — interactive prompts for album, YouTube URL, title, caption
  - Rewrote `/add-gallery` skill to be interactive (no command-line args)
  - iOS Shortcut "Add Gallery Video" — built with Cherri compiler, adds videos via GitHub API
  - Shortcut handles: Share Sheet input, video ID regex extraction, dynamic album list, frontmatter modification, base64 encoding, deploy hook
  - Source: `shortcuts/add-gallery-video.cherri` (not committed — contains credentials)

- [x] Update Now iOS Shortcut + reusable Cherri pipeline (session 2026-04-25)
  - iOS Shortcut "Update Now" — multi-select chooseFromList → loop prompts → single GitHub commit + single Cloudflare deploy (no N×commits)
  - Updates any subset of `/now/` fields (watching/listening/reading/doing/feeling/viewing); 'viewing' picks a photo
  - `shortcuts/build.sh` — reusable compile→patch→sign pipeline (extracts display name from `#define name`, patches WFBase64LineBreakMode on every base64encode, signs with `--mode people-who-know-me`)
  - New `/add-shortcut` Claude Code skill — guided authoring of new Cherri shortcuts citing all proven patterns + gotchas
  - Hard-won gotchas: `getValue(const, "key")` not `const['key']` for JSON SHA (otherwise empty → 409); single-line regex `[\s\S]*?` not literal `\n` (iOS Shortcuts mishandles literal newlines); `--mode anyone` signing endpoint fails network, use `--mode people-who-know-me`
  - Source: `shortcuts/update-now.cherri` (not committed — contains credentials)

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

### Atlas Refined Follow-up
- [ ] **Travel map flight lines** — disabled in redesign (JS commented out at travel.js:189). Needs visual rework to fit Atlas Refined aesthetic
- [ ] **Dark mode audit** — Atlas Refined tokens have dark mode overrides, but full page-by-page verification needed
- [ ] **Responsive audit** — verify all pages at mobile (375px), tablet (768px), desktop (1400px)
- [ ] **Gallery single page thumbnails** — currently serves original full-size images. Could add Hugo `.Process` thumbnails with grid layout for faster loads (but beware EXIF orientation — source files are now fixed)
- [ ] **Favicon** — old favicons deleted, need new ones based on SVW compass monogram
- [ ] **Open Graph images** — need per-page or per-section OG images for social sharing

### Content Additions
- [ ] **Uses/Tools page** — gear, apps, services you use. Surprisingly popular content type.

### Design Polish
- [ ] Micro-interactions on feed/gallery cards (subtle hover animations, glow effects)
- [ ] Sticky back-to-top button for long pages
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
