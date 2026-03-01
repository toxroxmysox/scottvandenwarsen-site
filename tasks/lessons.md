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

## Workflow

### Don't fight caching — fix it at the source
- **Problem:** Spent multiple rounds manually cache-busting CSS in the preview browser before realizing the fix should be in the template.
- **Rule:** If a caching problem comes up more than once, fix it at the source (template, build config) rather than repeatedly working around it.

### Verify at all breakpoints
- **Rule:** Always test mobile (375px), tablet (768px), and desktop (1400px) when making responsive layout changes. Don't skip any breakpoint.

### Multiple worktrees need different ports
- **Problem:** Running two Hugo servers on the same port causes conflicts and stale content from the wrong worktree.
- **Rule:** When comparing worktrees, assign different ports in `.claude/launch.json` (e.g., 1313 and 1314).
