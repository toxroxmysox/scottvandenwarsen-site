# Lessons Learned

Rules to prevent repeated mistakes. Review at session start.

---

## CSS & Styling

### `replace_all` corrupts `:root` CSS variable definitions
- **Problem:** Using Edit with `replace_all: true` to replace a hex value like `#64b5f6` → `var(--link)` also replaces the *value* inside the `:root` definition, creating a circular reference.
- **Rule:** Do all `replace_all` passes first, then restore the entire `:root` block in one Edit at the end.

### Fixed height on thumbnails distorts aspect ratio
- **Rule:** Use `aspect-ratio: 4/3` + `object-fit: cover` + `width: 100%` instead of fixed `height` for thumbnails.

### Dark mode `@media` overrides can silently revert component changes
- **Rule:** When modifying a CSS property, always search for that selector in the dark mode `@media` block and update it there too.

### Tab/wrapper elements can break existing flex layouts
- **Problem:** Wrapping existing flex children inside a new `<div>` breaks the parent's flex layout.
- **Rule:** When adding wrapper elements around existing flex children, make the wrapper `display: flex; flex: 1; min-height: 0` so it acts as a flex pass-through.

## Hugo

### Hugo `data/` vs `static/data/` — different purposes
- **Problem:** Files in `data/` are only accessible via `.Site.Data` in templates — they are NOT served as static assets. JS `fetch()` returns 404 for `data/` files.
- **Rule:** Files JS needs to fetch at runtime → `static/` or `static/data/`. Files Hugo templates need → `data/`.

### Hugo output format template naming uses lowercased format name
- **Rule:** `TripsJSON` format → template filename is `index.tripsjson.json` (lowercased).

### `canonifyURLs = true` converts relURL to absolute URLs
- **Problem:** With `canonifyURLs = true`, `relURL` generates absolute production URLs that 404 during local dev.
- **Rule:** Add `--baseURL http://localhost:1313` to local dev command (in `.claude/launch.json`).

### Hugo `Resize` strips EXIF orientation
- **Rule:** Don't use Hugo's `Resize` on camera/phone photos — it strips EXIF orientation and portraits render sideways. Serve originals with `aspect-ratio` + `object-fit: cover`.

### YAML dates must be unquoted for Hugo's `dateFormat`
- **Rule:** In `data/*.yaml`, leave dates unquoted: `updated: 2026-03-19` (not `"2026-03-19"`). Quoted dates become strings, breaking `dateFormat`.

### Hugo `$` in partials invoked via `dict` refers to the dict
- **Rule:** Pass `.Site` explicitly. Use `$.field` (not `.field`) inside nested `with`/`range` blocks.

### Hugo template lookup order: type cascades override section
- **Rule:** Lookup: `layouts/[type]/` → `layouts/[section]/` → `layouts/_default/`. Check `_index.md` for `type` or `cascade` settings.

## Hugo Themes & Libraries

### Check what the theme already provides before adding it yourself
- **Rule:** Before adding a JS library, `grep -r "LibraryName" themes/`. If the theme loads it, only add custom init logic.

### PhotoSwipe v4: use `data-size="WxH"` with Hugo's `.Width`/`.Height`
- **Rule:** Hugo image resources expose `.Width`/`.Height`. Use `data-size="{{ $img.Width }}x{{ $img.Height }}"`. Never hardcode dimensions.

## JavaScript

### `Promise.all` rejection kills the entire chain
- **Problem:** One `fetch()` 404 in `Promise.all` caused the entire `.then()` to never execute, silently preventing all rendering.
- **Rule:** Ensure ALL URLs are valid. Consider `Promise.allSettled()` for non-critical resources, or per-fetch `.catch()` for graceful degradation.

### Keep JS breakpoints in sync with CSS
- **Rule:** Define breakpoints as named JS constants (e.g., `MOBILE_MAX = 767`) with a comment linking to the CSS `@media` rules.

### Zoom/centering must account for sidebar position
- **Rule:** Compute available area dynamically based on viewport size and sidebar position (horizontal on desktop, vertical on mobile).

## Responsive / Mobile

### CSS sidebar transitions: use `transform` not `width` on mobile
- **Rule:** For overlaid panels (bottom sheets, drawers), animate `transform: translateY()` — GPU-composited, no layout recalculation.

### `!important` is acceptable for responsive overrides of base layout
- **Rule:** `!important` in a media query is fine when it definitively overrides a base rule that would break the layout at that breakpoint.

### Use `@media (hover: none)` for touch-specific styles
- **Rule:** Don't rely on `:hover` alone. Add `@media (hover: none)` fallbacks so interactive elements are visually distinct on touch devices.

### iOS `position: fixed` overlays pass touches through to `touch-action: none` elements
- **Problem:** Fixed bottom sheet visually covered an SVG with `touch-action: none`, but taps hit the SVG. All iOS browsers use WebKit — this affects Safari, Chrome, Arc, etc.
- **Fix:** Use `position: absolute` with parent `position: relative` instead of `position: fixed`.

### Pseudo-elements cannot receive touch or pointer events
- **Rule:** `::before`/`::after` are not DOM nodes. Create real DOM elements for anything interactive.

### Bottom sheet expand: use `max-height`, not `translateY`
- **Rule:** For `position: absolute; bottom: 0` sheets, grow `max-height` to expand. `translateY` shifts the box without revealing content.

### Disable CSS transitions during active drag
- **Rule:** Add `.dragging` class with `transition: none !important` on `touchstart`. Remove on `touchend` to let CSS transition animate the snap.

## D3.js / Maps

### Country MultiPolygons may include overseas territories
- **Problem:** France's TopoJSON MultiPolygon includes French Guiana. Highlighting France also highlights South America.
- **Fix:** Split polygons by centroid longitude (< -10° = overseas). Give overseas paths a separate class with no click handler. Exclude overseas from zoom bounds.
- **Rule:** Always check if a country geometry needs splitting for accurate highlighting and zooming.

## Git

### Worktree files belong to their branch
- **Rule:** Project config files (CLAUDE.md, tasks/) belong in the main repo on `main`, not in worktrees.

### Worktree PRs cause local main to fall behind
- **Rule:** After merging PRs on GitHub, local `main` doesn't update. Run `git pull --rebase origin main` at session start. The `/warmup` command checks this.

### `git stash pop` can conflict with append-only files
- **Rule:** When both branches append to the same file (e.g., main.css), keep upstream's block first (ensure it's syntactically complete), then ours after.

## Testing & Verification

### Remove test data immediately after verification
- **Rule:** Inject → verify → remove in the same session. Never leave test data in production code.

### Verify at all breakpoints
- **Rule:** Always test mobile (375px), tablet (768px), and desktop (1400px) for responsive changes.

### Multiple worktrees need different ports
- **Rule:** Assign different ports in `.claude/launch.json` (e.g., 1313 vs 1314) when running multiple Hugo servers.

### Preview server must run from the worktree
- **Rule:** Verify `preview_list` CWD matches the worktree path. Template changes are invisible if the server runs from the wrong directory.
