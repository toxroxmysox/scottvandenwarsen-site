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

### Hugo `Resize` strips EXIF orientation — don't use it for user-facing thumbnails
- **Problem:** Used `$img.Resize "768x q85"` to generate responsive `srcset` variants for gallery album photos. Hugo's `Resize` strips EXIF orientation metadata without rotating the underlying pixels. Portrait photos (stored as landscape with EXIF rotation flag) rendered sideways.
- **Rule:** Don't use Hugo's `Resize` on photos that may have EXIF orientation metadata (i.e., any camera/phone photo). Serve the original image and let the browser handle EXIF rotation natively. The CSS `aspect-ratio` + `object-fit: cover` approach already handles consistent thumbnail sizing without needing processed images.
- **Alternative:** If responsive images are needed, pre-process photos with a tool that bakes EXIF rotation into pixels (e.g., `mogrify -auto-orient`) before adding them to the repo.

## iOS Shortcuts

### Shortcuts can't reliably decode base64 from the GitHub Contents API
- **Problem:** The GitHub Contents API returns file content as base64 with embedded `\n` line breaks. Shortcuts' Decode Base64 action produces blank output even after stripping newlines with Replace Text (regex `\n` → empty).
- **Fix:** Use `raw.githubusercontent.com/{owner}/{repo}/main/{path}` to fetch raw file content directly. No decoding needed. Still use the Contents API separately to get the `sha` for PUT requests.
- **Rule:** For any "read a file from GitHub" step in a Shortcut, always use the raw URL for content and the API only for metadata (sha).

### Don't hand-craft JSON as Text for API request bodies
- **Problem:** Built a PUT request body as a Text action: `{"message": "...", "content": "{base64}", "sha": "..."}`. GitHub returned "Problems parsing JSON" (400). The base64 string contained characters that broke the JSON structure.
- **Fix:** Set Request Body to "JSON" in the Get Contents of URL action and add keys individually via the built-in editor. Shortcuts handles escaping correctly.
- **Rule:** Always use Shortcuts' JSON body editor for API requests. Never construct JSON via Text actions.

### Base64 Encode action includes line breaks by default
- **Problem:** Encoded content for GitHub PUT, got "content is not valid Base64" (422). The Encode Base64 action wraps output at 76 characters with newlines.
- **Fix:** Expand the Encode action and set Line Breaks to None. Alternatively, add a Replace Text after encoding to strip `\n` (regex mode).
- **Rule:** Always check/set the Line Breaks option on Encode Base64 actions.

## Video Lightbox

### Click-outside-to-close: use a single lightbox-level handler, not a backdrop handler
- **Problem:** Added a click handler on `.video-lightbox-backdrop` to close the lightbox when clicking outside the video. But the backdrop is `position: absolute` behind the content div — clicks at the center hit the content, not the backdrop. The `preview_click` tool (and real users on mobile) couldn't reliably hit the backdrop.
- **Fix:** Listen on the entire lightbox element and check `!e.target.closest('.video-lightbox-content')`. This catches clicks on the backdrop, topbar, close button — anything outside the player.
- **Rule:** For "click outside to close" patterns, attach the handler to the outermost overlay element and filter by target, not to a backdrop div that may be occluded by sibling elements.

### Avoid duplicate event handlers that call the same function
- **Problem:** Had both `closeBtn.addEventListener('click', closeVideo)` and a lightbox click handler that also calls `closeVideo()` when clicking outside content. The close button is outside `.video-lightbox-content`, so both handlers fired on the same click.
- **Rule:** When a parent click handler already covers a child element's behavior, don't add a redundant handler on the child. One handler, one responsibility.

### Hugo page bundle archetypes panic on v0.154 with cascade settings
- **Problem:** `hugo new gallery/"Test Album"/index.md` causes a panic: `[BUG] no Page found for ...`. This happens when the section's `_index.md` uses `cascade` in frontmatter.
- **Fix:** Don't use archetypes for page bundles. Create the folder and index.md directly via `mkdir` + file write.
- **Rule:** Test archetypes before relying on them. If they panic, fall back to manual file creation.

## Cherri (iOS Shortcut Compiler)

### Build workflow: compile → patch plist → re-sign
- **Problem:** Cherri's `base64Encode()` doesn't expose the Line Breaks parameter. Shortcuts' Base64 Encode defaults to adding line breaks every 76 chars, causing GitHub API "content is not valid Base64" (422) errors.
- **Fix:** Compile normally, then patch the plist to add `<key>WFBase64LineBreakMode</key><string>None</string>` to the base64 action, then re-sign with `shortcuts sign`.
- **Build script:**
  ```sh
  cherri file.cherri -d --skip-sign          # get .plist
  # patch the plist XML to add WFBase64LineBreakMode: None
  plutil -convert binary1 patched.xml -o patched.shortcut
  shortcuts sign --mode anyone --input patched.shortcut --output "Final.shortcut"
  ```

### Use `getValue()` for const variables, `['key']` for @ variables
- **Problem:** `const fileInfo = downloadURL(...)` then `@sha = fileInfo['sha']` produced empty SHA. The bracket syntax only works with `@` variables.
- **Rule:** For `const` (magic variable from an action output), use `const sha = getValue(fileInfo, "sha")`. For `@` variables, use `@val = myDict['key']`.

### `#question` import questions don't fire from file installs
- **Problem:** `#question ghToken "..."` creates import questions that should prompt when the shortcut is added. They only work reliably from iCloud shared links, not when installing from a `.shortcut` file.
- **Fix:** For personal shortcuts, hardcode credentials directly. For shared shortcuts, test the import question flow via iCloud link.
- **Rule:** Don't rely on `#question` for shortcuts distributed via AirDrop/file.

### Headers must be literal dictionaries, not variables
- **Problem:** `@headers = {...}; downloadURL(url, headers)` fails with "Shortcuts does not allow variable values for this argument."
- **Rule:** Always inline the headers dictionary: `downloadURL(url, {"Authorization": "Bearer {token}", ...})`.

### `joinText` and `splitText` crash on edge cases (Cherri bugs)
- **Problem:** `joinText(list, "")` panics with index out of range. `splitText(encoded)` (single arg) also panics.
- **Rule:** Avoid these patterns. Use alternative approaches (regex replaceText, for loops, or plist patching) to work around.

### URL-encode album/folder names with spaces for GitHub raw URLs
- **Problem:** `raw.githubusercontent.com` doesn't handle literal spaces in paths. `Spain 2025` in the URL split into `content/gallery/Spain` (truncated at space), creating a stray file instead of modifying the album.
- **Fix:** Use `urlEncode(albumName)` and use the encoded version in all URLs.
- **Rule:** Always URL-encode path segments that may contain spaces before embedding in URLs.

### GitHub Contents API SHA must match exactly
- **Problem:** PUT with wrong/empty SHA returns 409 "does not match". PUT with line-break-corrupted base64 returns 422 "content is not valid Base64".
- **Diagnosis:** Add debug `alert()` calls showing SHA and PUT result to identify which error is occurring.

## Hugo

### Hugo `define "header"` won't override baseof's `block "header"` for section templates
- **Problem:** Created `layouts/about/single.html` with `{{ define "header" }}{{ end }}` to suppress the theme's header banner. It didn't work — the default header.html partial still rendered, even though `{{ define "main" }}` worked fine.
- **Fix:** Created a section-specific `layouts/about/baseof.html` that omits the `{{ block "header" }}` entirely.
- **Rule:** If you need to suppress a baseof block for a specific section, create a section-specific baseof rather than relying on `{{ define "blockname" }}{{ end }}` in the inner template.
