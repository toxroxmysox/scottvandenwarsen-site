## Claude Code Handoff — Site Search + Related Content

**Goal:** Add Pagefind site-wide search and Hugo-native related
content links. Two distinct features sharing one handoff due to
overlapping infrastructure.

**Context:** Search via Pagefind (build-time indexing, zero
runtime cost). Related content via Hugo's `.Related` function
configured against consistent frontmatter fields. AI-enriched
related content (Claude API) is backlogged as a future upgrade
— do not build now.

---

### RESOLVE BEFORE STARTING

- [ ] Inspect current Cloudflare Pages build command — exact
  string currently configured
- [ ] **Audit frontmatter fields consistently present across ALL
  content types.** This is a hard prerequisite for Related Content.
  If fields are inconsistent across feed posts, galleries, and
  products, normalize the content FIRST before building related
  content. List all frontmatter fields per content type.
- [ ] Confirm BeautifulHugo base template pattern — does
  `baseof.html` have block definitions for head/footer injection?
  If not, you'll need to copy the entire `baseof.html` into
  `layouts/_default/` as an override — fragile on theme updates.
  Document this tradeoff.
- [ ] Check if Pagefind is already partially set up in repo
- [ ] Run `hugo config` — check if `related` block exists already
- [ ] Count total content items — affects `.Related` tuning
  (fewer than 20 items means sparse results)
- [ ] Search bar: always visible in header or /search page only?
  Recommend header input for discoverability — confirm.
- [ ] Should galleries be searchable by location name? If yes,
  `location` must be a consistent frontmatter field in galleries.
- [ ] Related content on product recommendation pages too, or only
  feed posts and galleries to start? Recommend feed+galleries only.

---

### Feature 1: Site Search (Pagefind)

**Scope:**

- Install and configure Pagefind to index built Hugo site
- Search UI: header search input + dedicated /search page
- Covers: feed posts, galleries, products (all content types)
- Results show: title, section label, excerpt, link
- Fully static — no server, no external API

**Build pipeline integration:**

Cloudflare Pages build command must run Pagefind AFTER Hugo:

```
hugo && npx pagefind --site public
```

Pagefind must be in package.json devDependencies — do NOT rely
on npx installing it fresh each build (slow, fragile):

```json
{
  "devDependencies": {
    "pagefind": "^1.0.0"
  }
}
```

**Template integration:**

- Add `data-pagefind-body` attribute to the main content wrapper
  in layout templates. This tells Pagefind what to index.
- If BeautifulHugo's baseof.html doesn't expose an injection
  point for this, copy baseof.html to `layouts/_default/baseof.html`
  and add the attribute. Note in a comment that this is an override
  and must be kept in sync with theme updates.
- Add Pagefind CSS and JS to head partial — Pagefind generates
  these into `public/pagefind/`

**Search page:**

- content/search.md — minimal frontmatter, `layout: search`
- layouts/search.html (or layouts/_default/search.html) —
  contains Pagefind UI div: `<div id="search"></div>`
- Pagefind UI initialized with `new PagefindUI({ element: "#search" })`

**Header search input (if confirmed in RESOLVE):**

- Small input in header/nav area
- On focus/enter: navigates to /search with query parameter
- Pagefind UI on /search page reads query from URL and executes
- No inline results in header — just a navigation trigger

---

### Feature 2: Related Content

**Scope:**

- Bottom of feed posts and gallery pages: up to 3 related items
- Cross-section — a gallery can relate to a post and vice versa
- Matching via Hugo `.Related` function on frontmatter fields
- No manual tagging required
- Degrades gracefully: fewer than 3 results shows fewer cards,
  zero results shows nothing (no empty container)

**Hugo configuration:**

Add to hugo.toml:

```toml
[related]
  includeNewer = true
  threshold = 80
  toLower = true

  [[related.indices]]
    name = "tags"
    weight = 100

  [[related.indices]]
    name = "categories"
    weight = 80

  [[related.indices]]
    name = "date"
    weight = 10
```

**Adjust field names based on frontmatter audit.** The above
assumes `tags` and `categories` are consistently present. If
they're not, either:
- Add them to content files first, OR
- Use whatever fields ARE consistent (e.g., `section`, `type`)

**Fallback:** If `.Related` returns fewer than 3 items, backfill
with recent posts from the same section. If still fewer than 3,
show what's available. Never show empty container.

**Display:**

- Minimal card row — horizontal on desktop, stacked on mobile
- Each card: title, section label (e.g., "Reading", "Gallery"),
  link
- No images, no excerpts — keep it lightweight
- "Related" heading above the row

---

### Files Likely Involved

**Search:**
- content/search.md — new page
- layouts/_default/search.html — search page template
- layouts/partials/head.html — Pagefind CSS/JS injection
- layouts/_default/baseof.html — may need override for
  data-pagefind-body (see RESOLVE section)
- package.json — add pagefind to devDependencies

**Related:**
- hugo.toml — related content config block
- layouts/partials/related.html — new partial
- layouts/_default/single.html — inject related partial
- layouts/galleries/single.html — inject if separate template

**Constraints (both features):**

- Do not modify theme files directly (override by copying
  to layouts/ if needed — document any overrides)
- Pagefind index must build as part of deploy pipeline —
  Cloudflare Pages build command must be updated
- Related partial must not error if no related content found
- Must work across content types
- Pagefind CSS must be compatible with existing dark theme —
  may need custom CSS overrides for Pagefind UI
