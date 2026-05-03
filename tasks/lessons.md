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

### iOS Shortcuts Replace Text mishandles regex with literal newlines
- **Problem:** Cherri pattern `"{key}:\n  value: \"[^\"]*\"\n  updated: [^\n]*"` compiles `\n` to actual newline characters in the regex pattern. Pattern works in Python's `re`, but iOS Shortcuts' Replace Text action silently fails to match. The shortcut runs to completion, the YAML appears unchanged, and the GitHub PUT silently goes through with stale content (no commit lands because content matches existing SHA).
- **Fix:** Use `[\\s\\S]*?` (lazy match across all chars including newlines) and `\\S+` for date-like tokens. No literal newlines in the pattern.
  ```cherri
  @findPattern = "{key}:[\\s\\S]*?value: \"[^\"]*\"[\\s\\S]*?updated: \\S+"
  @replacement = "{key}:\n  value: \"{newValue}\"\n  updated: {today}"
  ```
- **Rule:** When writing iOS Shortcuts regex patterns in cherri, never include literal `\n` (cherri converts `\n` → newline char). Use `[\s\S]*?` for cross-line matching. The replacement string CAN have literal newlines — only the pattern is constrained.

### `getValue(const, "key")` is mandatory for JSON SHA extraction — `const['key']` returns empty
- **Problem:** `const fileInfo = downloadURL(...); @sha = fileInfo['sha']` compiles to a property aggrandizement that does NOT auto-parse the response as a dictionary. SHA comes back empty string. GitHub PUT then returns 409 Conflict with message `"data/now.yaml does not match "` (trailing space because the provided SHA was empty).
- **Fix:** Use `@sha = getValue(fileInfo, "sha")` — compiles to `is.workflow.actions.getvalueforkey` (dedicated Get Dictionary Value action) which does explicit JSON parse before extraction.
- **Rule:** For ALL `const`-bound JSON responses, use `getValue(constVar, "key")`. The bracket syntax `['key']` is reserved for `@`-bound dicts.

### `shortcuts sign --mode anyone` fails with DNS NXDOMAIN
- **Problem:** `shortcuts sign --mode anyone --input X --output Y` exits non-zero with "A server with the specified hostname could not be found" — the Apple signing endpoint isn't reachable even when iCloud and other Apple services work fine. No output file is produced. Installing the unsigned plist-as-shortcut shows "unsigned and can't open" on iOS.
- **Fix:** Use `--mode people-who-know-me` instead. Works reliably for personal devices on the user's iCloud account.
- **Rule:** Default cherri build pipeline uses `--mode people-who-know-me`. Size sanity check: signed bundle should be ~33KB (AEA-wrapped), not ~12KB (unsigned binary plist).

### iOS Shortcuts HTTP actions silently swallow 4xx/5xx errors
- **Problem:** `Get Contents of URL` and `JSON Request` continue executing after 4xx/5xx responses — they don't raise errors. A shortcut that should commit to GitHub but gets 409/422 will still trigger the Cloudflare deploy hook and show its success notification, leading to "the build ran but content didn't change" mystery debugging.
- **Fix:** When a shortcut "executes correctly" but produces no observable result, add `quicklook(value)` after each suspect step:
  - `quicklook(working)` after regex replace → did the pattern match?
  - `quicklook(fileInfo)` after API GET → raw response shape
  - `quicklook(fileSHA)` after extraction → 40-char hex if good, empty if extraction broke
  - `quicklook(putResult)` after PUT → success has `"commit": {...}`, errors have `"message": "..."`
- **Rule:** Never trust a shortcut's "completed" notification. If GitHub commits don't appear, instrument with `quicklook` and rebuild.

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

### Hugo `isset` needed for zero-value template parameters
- **Problem:** Passing `"limit" 0` to a partial, then checking `if .limit` evaluates to false because Hugo treats 0 as falsy. Feed columns showed only 3 posts instead of all.
- **Rule:** Use `isset . "limit"` to check if a parameter was passed, not `if .limit`. Then use the value directly.

### Hugo `.Process` with `autoOrient` may not work reliably
- **Problem:** `.Process "resize 600x webp q80 autoOrient"` still produced sideways WebP thumbnails from EXIF-rotated source images. Root cause unclear on Hugo v0.154.2.
- **Fix:** Bake EXIF orientation into pixel data before adding images to the repo. Use Python to rotate pixels and reset EXIF orientation tag to 1.
- **Rule:** Don't rely on Hugo's `autoOrient`. Pre-process photos with `sips --rotate` + EXIF tag reset, or `mogrify -auto-orient`.

### `sips --rotate` doesn't clear EXIF orientation tag
- **Problem:** `sips --rotate 90` rotates pixel data but leaves EXIF Orientation tag at its original value. Browsers then apply ANOTHER rotation based on the stale tag, causing double-rotation.
- **Rule:** After `sips --rotate`, always reset the EXIF orientation tag to 1. `sips` can't do this reliably — use Python or `exiftool` to patch the raw EXIF bytes.

### Hugo server caches can serve stale CSS/templates
- **Problem:** After restarting Hugo dev server, old CSS was still being served. The `relURL` function was resolving to the production domain URL instead of localhost, even with `--baseURL` flag.
- **Fix:** Delete `resources/_gen` and `public/` directories, then restart the server fresh.
- **Rule:** When design changes aren't appearing, nuke `resources/_gen` and `public/` before restarting Hugo server. Don't assume a restart clears all caches.

### PhotoSwipe v4 requires a root `.pswp` overlay element in the DOM
- **Problem:** PhotoSwipe lightbox didn't open on gallery pages. The JS init code was present and found `.pswp-gallery` links, but `document.querySelector('.pswp')` returned null.
- **Fix:** Include the theme's `load-photoswipe-theme.html` partial in the gallery single template.
- **Rule:** PhotoSwipe v4 needs the `.pswp` root element with its full child structure (bg, scroll-wrap, container, UI) in the page. Check that it's present when lightbox isn't working.

### CSS class names must match between JS and CSS
- **Problem:** travel.js adds class `has-gallery` to visited countries, but CSS only had `.map-country.map-overseas` — the class name didn't match.
- **Rule:** When JS dynamically adds CSS classes, grep the stylesheet to verify a matching rule exists. Name mismatches between JS and CSS are silent failures.
