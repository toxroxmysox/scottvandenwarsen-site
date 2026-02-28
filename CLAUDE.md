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
│   └── gallery/           # Photo albums (page bundles with images)
├── layouts/               # Custom templates overriding the theme
│   ├── index.html         # Homepage (feed columns + gallery grid)
│   ├── _default/          # Default list layout
│   ├── feed/              # Feed list & single templates
│   ├── gallery/           # Gallery list & single templates
│   └── partials/          # Reusable components (cards, nav, head, etc.)
├── static/
│   ├── css/main.css       # All custom styles (Moody Slate, dark mode, layout)
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

- **Color scheme:** Moody Slate — dark blue-grey gradients (`#2c3e50` base), muted accents (`#64b5f6` links), full dark mode support via `prefers-color-scheme`
- **Feed cards:** Frosted-glass style (`.feed-card-link`) — translucent backgrounds, subtle borders, hover lift
- **Gallery cards:** Overlay style (`.gallery-card`) — full-bleed images with gradient text overlay, CSS grid (1/2/3 columns responsive)
- **Feed layout:** Bootstrap 3-column grid (`col-md-4`) for Reading/Watching/Listening
- **CSS cache-busting:** `?v={{ now.Unix }}` appended to main.css link in `layouts/partials/head.html`

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

## Mistakes to Avoid

See `tasks/lessons.md` for the full accumulated list.
