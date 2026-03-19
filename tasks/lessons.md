# Lessons Learned

Rules to prevent repeated mistakes. Review at session start.

---

## CSS & Styling

### Preview browser aggressively caches CSS
- **Problem:** After editing `static/css/main.css`, the preview browser keeps loading the old cached version even after page reload. New CSS rules appear missing.
- **Rule:** Always verify CSS is loaded by inspecting computed styles. If styles aren't applying, the cache is stale — don't assume the CSS is wrong.
- **Fix applied:** Added `?v={{ now.Unix }}` cache-busting to the CSS link in `layouts/partials/head.html`. This ensures each Hugo build/serve gets a fresh CSS URL.
- **Workaround for preview:** If cache-bust param doesn't help, inject a fresh `<link>` element via `preview_eval` with a unique timestamp.

### Bootstrap grid breakpoints need real viewport widths
- **Problem:** Bootstrap's `col-md-4` needs 992px+ viewport width to create 3-column layout. The `desktop` preset in `preview_resize` sometimes resolves to only 640px, causing columns to stack.
- **Rule:** Always use explicit dimensions (`preview_resize` with `width: 1400, height: 900`) instead of the `desktop` preset for reliable desktop testing.

### CSS inheritance on parent containers
- **Problem:** Adding `text-align: center` to `.gallery-section` to center the heading also affected the gallery grid contents.
- **Rule:** When adding inheritable CSS properties to a parent, always check if children need explicit resets (e.g., `.gallery-section .gallery-grid { text-align: left; }`).

### Inline-block elements don't auto-center
- **Problem:** Gallery heading had `display: inline-block` (from global h2 underline styles) which prevented it from centering within its parent, even with `text-align: center` on itself.
- **Rule:** To center an `inline-block` element, set `text-align: center` on the **parent**, not the element itself.

## Hugo & Dev Server

### Hugo caches template output
- **Problem:** Hugo's dev server caches rendered HTML. Template values like `{{ now.Unix }}` compute once and stay the same until the page is rebuilt.
- **Rule:** Don't expect `now.Unix` to change on every browser refresh — it only changes when Hugo re-renders the template.

### Static files served without versioning
- **Problem:** Files in `static/` are served as-is with no built-in cache-busting by Hugo.
- **Rule:** For any static asset that changes frequently during development, add a cache-bust parameter in the template that references it.

## Git & GitHub

### `gh auth login` is fully interactive
- **Problem:** Cannot run `gh auth login` non-interactively from Claude Code — it requires terminal input for selections.
- **Rule:** Direct the user to run `gh auth login` in their own terminal. Don't attempt to automate it.

### Worktree files belong to their branch
- **Problem:** Files created in a worktree are scoped to that worktree's branch. Project-level config files (CLAUDE.md, tasks/) should live in the main repo on `main`, not in worktrees.
- **Rule:** Always create project config files in the main repository, not in worktrees. Worktrees are for feature work only.

### HTTPS git push needs credential helper
- **Problem:** `git push` over HTTPS fails with "Device not configured" if no credential helper is set up.
- **Rule:** After `gh auth login`, `gh` configures the git credential helper automatically. Always check `gh auth status` before attempting to push.

## CSS Variables & Refactoring

### `replace_all` corrupts `:root` CSS variable definitions
- **Problem:** Using Edit with `replace_all: true` to replace a hex value like `#64b5f6` → `var(--link)` also replaces the *value* inside the `:root` definition, creating a circular reference: `--link: var(--link);`. This silently breaks all usages of that token.
- **Rule:** After any `replace_all` pass that involves a value also defined in `:root`, immediately restore the `:root` definition to its correct literal value.
- **Best approach:** Do all `replace_all` passes first (accepting that `:root` will be corrupted), then restore the entire `:root` block in one comprehensive Edit at the end. Track which entries will be corrupted before starting.

### Design token strategy for Moody Slate
- **Pattern used:** Insert a `:root {}` block at the very top of `main.css` with all tokens. Dark-mode overrides go in an immediately-following `@media (prefers-color-scheme: dark) :root {}` block. The Moody Slate section below uses `var(--token)` everywhere — no hardcoded hex values.
- **File structure order:** tokens → legacy theme CSS → Scott overrides → Moody Slate → cards.

## JavaScript

### JS files are cached more aggressively than CSS
- **Problem:** `footer_custom.html` uses `?v={{ now.Unix }}` cache-busting on JS script tags, but the *browser* still caches aggressively. After editing `static/js/map.js` or `mini-map.js`, the preview browser often serves the old file with `transferSize: 0` (from disk cache).
- **Diagnosis command:**
  ```js
  performance.getEntriesByType('resource').find(r => r.name.includes('map.js'))
  // If transferSize === 0, the file is cached
  ```
- **Fix — force fresh JS in the preview:** Use `preview_eval` to navigate away then back with a unique bust param:
  ```js
  window.location.href = 'about:blank'
  // then:
  window.location.href = 'http://localhost:1313/?_bust=' + Date.now()
  ```
- **Root cause:** Hugo's dev server returns the same `?v=TIMESTAMP` URL on repeated renders because `now.Unix` is computed once per build, not per request. The browser sees the same URL and serves its cached copy.
- **Rule:** After editing a JS file, always check `transferSize` in performance entries before trusting what's rendered. If cached, force a fresh load before debugging the JS logic.

## Hugo

### Use `relURL` not `absURL` for local static assets
- **Problem:** `absURL` in Hugo templates generates full production URLs (`https://scottvandenwarsen.com/js/map.js`). During local dev, these 404 because the file isn't on production yet — so the script silently fails to load.
- **Rule:** Always use `relURL` for `<script>` and `<link>` tags that reference files in `static/`. Only use `absURL` for canonical URLs, Open Graph `og:url`, and sitemap entries that genuinely need an absolute URL.
- **Example fix:** `{{ "js/map.js" | absURL }}` → `{{ "js/map.js" | relURL }}`

## Git

### Always fetch `origin/main` before starting a worktree session
- **Problem:** Local `main` was 4 commits behind `origin/main`. PRs merged on GitHub don't update local branches — they only update the remote. A worktree branched from stale local `main` was missing the lightbox, feed redesign, and other merged changes.
- **Rule:** At session start, run `git fetch origin main` and rebase the worktree branch on `origin/main` (not local `main`). This ensures all merged PR changes are included.
- **Pattern:** `git fetch origin main && git rebase origin/main`

### Git rebase workflow when you have unstaged changes
If `git pull --rebase` fails with "unstaged changes":
1. `git stash` — shelve unstaged changes
2. `git pull --rebase origin main` — pull + replay local commits
3. Resolve any conflicts; `git add` each resolved file
4. `git rebase --continue` — complete the rebase
5. `git stash pop` — restore your unstaged changes
6. `git push origin main`

### Merge conflict strategy: CSS variables win over hardcoded values
- **Rule:** When a merge conflict is between a CSS `var(--token)` (remote design-token refactor) and a hardcoded hex value (our older code), **always keep the CSS variable**. It's more maintainable and consistent with the design system.
- **Pattern to watch for:** `.some-class { color: <<<< HEAD: var(--text-muted) ==== #99a8b8 >>>>` → keep `var(--text-muted)`.

### After git add, unmerged files still show as conflicted
- **Problem:** After resolving all conflict markers and running `git add file`, git rebase still reports the file as "needs merge" if you haven't also staged the other conflicted files.
- **Rule:** After resolving all files, check `git status` to see all "Unmerged paths". Stage every resolved file before running `git rebase --continue`.

## Testing & Verification

### Remove test data immediately after verification
- **Problem:** Temporarily injected a fake US-CA gallery entry into `buildLocationIndex` to verify the US state rendering code path. Later verified it as a "phantom highlight" bug — it was just the test data left in from the previous session.
- **Rule:** Inject test data → verify → remove in the same session, before marking the phase complete. Never leave test data in production code paths.

## Workflow

### Don't fight caching — fix it at the source
- **Problem:** Spent multiple rounds manually cache-busting CSS in the preview browser before realizing the fix should be in the template.
- **Rule:** If a caching problem comes up more than once, fix it at the source (template, build config) rather than repeatedly working around it.

### Verify at all breakpoints
- **Rule:** Always test mobile (375px), tablet (768px), and desktop (1400px) when making responsive layout changes. Don't skip any breakpoint.

### Multiple worktrees need different ports
- **Problem:** Running two Hugo servers on the same port causes conflicts and stale content from the wrong worktree.
- **Rule:** When comparing worktrees, assign different ports in `.claude/launch.json` (e.g., 1313 and 1314).

## Responsive / Mobile

### CSS sidebar transitions: use `transform` not `width` on mobile
- **Pattern:** Desktop sidebar animates via `width: 0 → 33%`. On mobile, animating width is janky and fights `position: fixed`. Use `transform: translateY(100%) → translateY(0)` for a smooth bottom sheet instead.
- **Rule:** For overlaid panels (bottom sheets, drawers), always animate `transform` — it's GPU-composited and doesn't trigger layout recalculation.

### Keep JS breakpoints in sync with CSS
- **Pattern:** Defined `MOBILE_MAX = 767` and `TABLET_MAX = 1023` as JS constants at the top of `map.js`, with a comment "must match CSS". The CSS uses `@media (max-width: 767px)` and `@media (min-width: 768px) and (max-width: 1023px)`.
- **Rule:** When JS behavior depends on responsive breakpoints, define them once as named constants and add a comment tying them to the CSS. Don't hardcode pixel values inline in JS functions.

### Zoom centering must account for where the sidebar appears
- **Problem:** `zoomToFeature()` hardcoded `width * 0.333` as sidebar offset, which is wrong when the sidebar is a bottom sheet (mobile) or 40% wide (tablet).
- **Rule:** When zooming/centering content that shares space with a sidebar, compute the available area dynamically based on viewport size and sidebar position (horizontal on desktop, vertical on mobile).

### `!important` is acceptable for responsive overrides of base layout
- **Pattern:** Used `width: 100% !important; min-width: 0 !important;` in the mobile media query to override the base `.map-sidebar.open { width: 33.333%; min-width: 320px; }`.
- **Rule:** `!important` is fine when a responsive media query needs to definitively override a base rule that would otherwise break the layout at that breakpoint. This is one of the legitimate use cases for `!important`.

### Use `@media (hover: none)` for touch-specific styles
- **Pattern:** Touch devices don't have hover. Used `@media (hover: none)` to give `.has-gallery` countries a brighter default fill so they're visually distinct as tappable without relying on `:hover`.
- **Rule:** Don't rely on `:hover` as the only visual affordance for interactive elements. Add `@media (hover: none)` fallbacks for touch devices.

### `position: fixed` overlays pass touches through to `touch-action: none` elements on iOS WebKit
- **Problem:** A `position: fixed` bottom sheet with `z-index: 20` was visually on top of a D3 SVG, but taps on the sheet hit the SVG instead. D3's `zoom()` sets `touch-action: none` inline on the SVG. iOS WebKit (Safari, Arc, Chrome for iOS — all use the same engine) incorrectly routes touch events to the `touch-action: none` element rather than the fixed overlay above it.
- **Root cause:** This is a longstanding iOS WebKit bug, not a z-index/pointer-events issue.
- **Fix:** Change the overlay from `position: fixed` to `position: absolute`. Ensure the parent container has `position: relative`. Visually identical (bottom-anchored), but iOS touch routing works correctly.
- **Wrong approach tried first:** `svg.on('.zoom', null)` — removes D3's zoom listener, but D3 already set `touch-action: none` as an inline style; touch routing was still broken AND it blocked map interaction while the sheet was open.

### Pseudo-elements cannot receive touch or pointer events
- **Problem:** Used `::before` to render a drag handle bar. When implementing drag-to-resize, attached `touchstart`/`touchmove`/`touchend` to the pseudo-element area — but events never fired.
- **Rule:** Pseudo-elements (`::before`, `::after`) are not DOM nodes and cannot receive events. Always create a real DOM element for anything interactive. Inject it via JS or add it to the HTML template.

### Bottom sheet expand: use `max-height`, not `translateY`
- **Problem:** To simulate "drag up to expand" on a bottom sheet, used `translateY(-Npx)` — this just shifted the whole box upward without revealing more content, since the sheet height didn't change.
- **Rule:** For a bottom-anchored sheet (`position: absolute; bottom: 0`), expanding means growing the sheet's `max-height` (or `height`) so content is revealed. `translateY` should only be used for the close/dismiss direction (dragging down).
- **Pattern:** `touchmove UP → sidebar.style.maxHeight = (baseH + |deltaY|) + 'px'` (capped at max). `touchend → sidebar.classList.add('expanded')` (CSS class takes over). Include `max-height` in the CSS `transition` property for smooth snap animation.

### Disable CSS transitions during active drag, re-enable on release
- **Pattern:** Add a `.dragging` class with `transition: none !important` when `touchstart` fires. Remove it on `touchend` before snapping to final position — this lets the CSS transition animate the snap.
- **Rule:** Direct manipulation (drag) must be instantaneous. The snap-to-final-position on release should animate. `.dragging` class is the clean way to toggle this.

### iOS browser ≠ Safari only — all iOS browsers share WebKit
- **Lesson:** Tested on Arc browser on iOS; assumed the bug might be Arc-specific. Arc on iOS still uses WKWebView (iOS-mandated WebKit). All iOS browsers — Safari, Chrome, Arc, Firefox, Edge — run on WebKit.
- **Rule:** Any iOS touch bug is a WebKit bug and affects every browser on iOS. Don't narrow scope to "Safari only" when diagnosing iOS touch issues.
