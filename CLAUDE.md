# CLAUDE.md — scottvandenwarsen.com

## Stack Overview

- **Static site generator:** Hugo (theme: Beautiful Hugo, MIT license)
- **Hosting:** Cloudflare Pages — builds trigger automatically on push to `main`
- **Source control:** GitHub (`toxroxmysox/scottvandenwarsen-site`)
- **Content authoring:** Obsidian (vault config lives at `.obsidian/`)
- **Base URL:** https://scottvandenwarsen.com/
- **GitHub CLI:** `gh` (installed via Homebrew, authenticated via HTTPS)

## Project Structure

```
├── CLAUDE.md              # This file — project instructions for Claude
├── hugo.toml              # Site config (theme, params, base URL)
├── content/
│   ├── feed/              # Section hub aggregating reading/watching/listening
│   ├── reading/           # Articles & links
│   ├── watching/          # Shows, films, videos
│   ├── listening/         # Podcasts & audio
│   ├── gallery/           # Photo albums (page bundles with images)
│   └── travel/            # Travel page (map + timeline, aliases /map/)
├── data/
│   ├── trips.yaml         # Trip metadata (source of truth for travel page)
│   └── now.yaml           # Now-playing widget data
├── layouts/               # Custom templates overriding the theme
│   ├── index.html         # Homepage (feed columns + gallery grid)
│   ├── _default/          # Default list layout
│   ├── feed/              # Feed list & single templates
│   ├── gallery/           # Gallery list & single templates
│   ├── travel/            # Travel page template (map + timeline + tabs)
│   └── partials/          # Reusable components (cards, nav, head, etc.)
├── static/
│   ├── css/main.css       # All custom styles (Moody Slate, dark mode, layout)
│   ├── js/travel.js       # Travel page: D3 map, timeline, flight lines, state mgmt
│   ├── js/mini-map.js     # Homepage mini-map (independent)
│   ├── data/              # JSON data files fetched by JS at runtime
│   └── favicon files
├── tasks/
│   ├── todo.md            # Current task tracking
│   └── lessons.md         # Accumulated lessons and error prevention rules
├── themes/beautifulhugo/  # Upstream theme (do not edit directly if avoidable)
├── assets/                # Empty — available for Hugo Pipes if needed
├── archetypes/            # Content templates (default.md)
└── public/                # Build output (git-ignored)
```

## Content Model

Feed items (reading, watching, listening) share a common frontmatter:

```yaml
title: "String"
date: YYYY-MM-DD
draft: false
summary: "Short description"
tags: ["tag1", "tag2"]
external_url: "https://..."   # optional — links out to source
```

Gallery albums are Hugo page bundles:

```yaml
title: "Album Name"
date: YYYY-MM-DD
draft: false
summary: "Description"
tags: ["travel"]
cover: "filename.jpg"         # thumbnail shown on album cards
```

Images sit alongside `index.md` inside each album folder.

## Design System

### Color Scheme — Atlas Refined

Warm, earthy tones with a dark forest green base and cream/parchment text. Full dark mode via `prefers-color-scheme`.

All colors are defined as CSS custom properties (design tokens) in `:root` at the top of `static/css/main.css`. Dark-mode overrides follow immediately after. **Never hardcode hex/rgba values in component CSS — always use `var(--token)`.**

Key token groups:
- **Backgrounds:** `--color-bg` (deep forest green `#162923`), `--color-paper` (warm cream `#ece4d0`), `--color-paper-alt` (darker parchment)
- **Text:** `--color-ink` (near-black on light, warm cream on dark), `--color-ink-light` (muted secondary text)
- **Accent:** `--accent` (warm gold `#c8a96e`), `--accent-hover` (brighter gold)
- **Cards:** `--shadow-card` (layered box-shadow for paper card depth)
- **Shape:** `--radius-card` (12px), `--radius-sm` (6px)

### Typography

- **Body text:** `clamp(1rem, 0.95rem + 0.25vw, 1.125rem)` using Fraunces (variable serif)
- **UI text:** IBM Plex Mono for nav, labels, metadata, card titles
- **Headings:** Fraunces with optical sizing
- No `font-size: 62.5%` trick — uses standard browser default (1rem = 16px)

### Component Patterns

- **Layout:** Custom `baseof.html` shell with `svw-page` body class, no Bootstrap
- **Feed cards:** Paper card style (`.svw-article`) — `var(--color-paper)` background, box-shadow, hover lift
- **Gallery cards:** Postcard style (`.svw-postcard`) — full-bleed cover image with flag badge, photo count badge, title/meta overlay
- **Feed layout:** CSS grid 3-column layout for Reading/Watching/Listening (`.svw-feed-columns`)
- **Nav:** Sticky nav with SVW compass monogram, IBM Plex Mono links, hamburger toggle on mobile (`nav.js`)
- **Footer:** Centered with email subscribe form (Buttondown), social links
- **CSS cache-busting:** `?v={{ now.Unix }}` appended to main.css link in `layouts/partials/head.html`
- **Brand:** SVW compass monogram (`static/svw-compass.svg`), contour line background (`static/contours.svg`)

## Commands

### Local development

```sh
hugo server
```

Starts a local dev server with live reload (default: http://localhost:1313/).

### Production build

```sh
hugo
```

Outputs to `public/`. Cloudflare Pages runs this automatically on push.

### Deploy

```sh
git push origin main
```

Cloudflare Pages picks up the push and builds + deploys automatically.

### GitHub CLI

```sh
gh auth status          # Check auth
gh pr create            # Create PR
gh pr list              # List open PRs
```

## Access Rules

### content/ — READ-ONLY (body text)

- **You may** read frontmatter and file structure to understand the content model.
- **You must NEVER** edit, rewrite, or rephrase the body text or prose in any content file. The author writes all prose in Obsidian; Claude must not touch it.

### content/gallery/ — FULLY READ-ONLY

- Photo albums and their images must not be modified, renamed, moved, or deleted.
- Frontmatter in gallery `index.md` files: read-only.

### themes/, layouts/, assets/, static/, config (hugo.toml) — FULL READ/WRITE

- You have full access to modify templates, partials, stylesheets, and site configuration.
- Prefer overriding in `layouts/` over editing files inside `themes/beautifulhugo/` directly.

### archetypes/ — READ/WRITE

- May be updated when the content model changes.

---

## Workflow Orchestration

### 1. Plan Mode Default

- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions).
- If something goes sideways, STOP and re-plan immediately — don't keep pushing.
- Use plan mode for verification steps, not just building.
- Write detailed specs upfront to reduce ambiguity.

### 2. Subagent Strategy

- Use subagents liberally to keep main context window clean.
- Offload research, exploration, and parallel analysis to subagents.
- For complex problems, throw more compute at it via subagents.
- One task per subagent for focused execution.

### 3. Self-Improvement Loop

- After ANY correction from the user: update `tasks/lessons.md`.
- Write rules for yourself that prevent the same mistake.
- Ruthlessly iterate on these lessons until mistake rate drops.
- Review `tasks/lessons.md` at session start for relevant project context.

### 4. Verification Before Done

- Never mark a task complete without proving it works.
- Diff behavior between main and your changes when relevant.
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness.

### 5. Demand Elegance (Balanced)

- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution."
- Skip this for simple, obvious fixes — don't over-engineer.
- Challenge your own work before presenting it.

### 6. Autonomous Bug Fixing

- When given a bug report: just fix it. Don't ask for hand-holding.
- Point at logs, errors, failing tests — then resolve them.
- Zero context switching required from the user.
- Go fix failing CI tests without being told how.

## Task Management

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items.
2. **Verify Plan**: Check in before starting implementation.
3. **Track Progress**: Mark items complete as you go.
4. **Explain Changes**: High-level summary at each step.
5. **Document Results**: Add review section to `tasks/todo.md`.
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections.

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.

## Verification

Before finishing any task, always run:

```sh
hugo server
```

Confirm:

1. No build errors or warnings in the terminal output.
2. The site renders and pages load without broken layouts.

If the build fails, fix the issue before marking the task complete.

## Hugo Template Rules

### URL generation
- **Always use `relURL`** for `<script>` and `<link>` tags referencing files in `static/`. Example: `{{ "js/map.js" | relURL }}`.
- **Never use `absURL`** for local static assets — it generates production URLs (`https://scottvandenwarsen.com/...`) that 404 during local dev.
- `absURL` is only appropriate for canonical meta tags, `og:url`, and sitemap entries.

### Cache-busting
- CSS link in `head.html`: `?v={{ now.Unix }}` — already applied.
- JS scripts in `footer_custom.html`: `?v={{ now.Unix }}` — already applied.
- Despite cache-busting, the browser may still serve cached JS. If behavior looks stale, check with: `performance.getEntriesByType('resource').find(r => r.name.includes('filename.js'))` and look for `transferSize === 0`.

## Verification Workflow

When a preview server is running and code has been edited:

1. **Use `preview_snapshot` first** — returns accessibility tree (text, cheap). Use this to verify text content, element presence, and page structure.
2. **Use `preview_inspect`** — for CSS/style verification (color, font, spacing). More accurate than a screenshot.
3. **Use `preview_screenshot` sparingly** — only when you genuinely need to see visual layout. Screenshots are image data and cost significantly more tokens than text-based tools.
4. **Reload with cache-bust if JS looks stale:**
   ```js
   // In preview_eval:
   window.location.href = window.location.href.split('?')[0] + '?_bust=' + Date.now()
   ```

## Git Push Workflow

When local branch has diverged from origin:
```sh
git stash                      # shelve unstaged changes (e.g. .obsidian/)
git pull --rebase origin main  # replay local commits on top of remote
# resolve any conflicts, git add each file
git rebase --continue
git stash pop                  # restore unstaged changes
git push origin main
```

## Mistakes to Avoid

See `tasks/lessons.md` for the full accumulated list.
