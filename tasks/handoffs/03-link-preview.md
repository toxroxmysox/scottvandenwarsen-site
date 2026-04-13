## Claude Code Handoff — External Link Preview (Favicon + Popover)

**Goal:** Enrich the existing "View Source" button on single post
pages with favicon and source name, plus a hover/tap popover
showing OG title, description, and image.

**Context:** Each feed post has one primary external URL in
frontmatter. Currently a plain "View Source" button. Enriched
to show [favicon] View on [Site Name] ↗ with a popover on
hover. Feed card "External ↗" links unchanged.

---

### RESOLVE BEFORE STARTING

- [ ] Inspect frontmatter field name for external URL across
  all content types — confirm consistency (expected: `external_url`)
- [ ] Count posts with external URLs — affects JSON file size
- [ ] Confirm single post template file path
- [ ] Check if npm/node setup exists in repo (package.json present?)
- [ ] Should preview appear on product recommendation posts too?
  Likely yes — confirm.
- [ ] Should existing View Source button be kept as a no-JS fallback
  below the enhanced button, or replaced entirely?

---

### Data Enrichment Script

**New script: scripts/enrich-previews.js at repo root**

- Reads all content markdown files with external URL frontmatter
- Fetches OG metadata per URL:
  - og:title
  - og:description
  - og:image
  - og:site_name (fallback: parse domain from URL)
- Writes to data/link-previews.json keyed by content path:

```json
{
  "posts/newsroom": {
    "url": "https://...",
    "title": "OG title",
    "description": "OG description",
    "image": "https://og-image-url",
    "site_name": "Netflix",
    "domain": "netflix.com"
  }
}
```

- Only re-fetches URLs not already in JSON (cache-friendly)
- Degrades gracefully — always writes URL and domain at minimum
- Small delay between fetches (500ms) to respect rate limits
- Run manually: `npm run enrich-previews`
- **Not part of Cloudflare Pages build command** — run locally
  before committing
- data/link-previews.json committed to repo

**NOTE: This script requires outbound network access. Claude Code
cannot test it in sandboxed environments. Claude Code writes and
validates the script structure. Author tests locally.**

---

### Button Enhancement

- Button renders as: [favicon] View on [Site Name] ↗
- Favicon source: Google's service as primary —
  `https://www.google.com/s2/favicons?domain=[domain]&sz=16`
- **Favicon fallback:** If Google service fails (undocumented,
  intermittently unreliable), show a generic external link icon
  via CSS. Implement as: `<img>` with `onerror` handler that
  hides the image and shows a CSS fallback icon (e.g., a small
  SVG link/arrow icon inline).
- Alternative favicon source if Google proves unreliable:
  `https://icons.duckduckgo.com/ip3/[domain].ico`
- No local favicon storage required

---

### Hover Popover

- Triggers on hover (desktop) and tap (mobile)
- Shows: OG image if available, OG title, OG description
  truncated to ~120 chars
- **Positioning: always render below the button.** If below
  would clip viewport, render above. Use a simple JS check
  on trigger: `getBoundingClientRect().bottom + popoverHeight
  > window.innerHeight` — if true, position above. Do NOT
  build a full positioning library.
- Dismisses on mouse leave (desktop) or tap outside (mobile)
- Pure CSS/JS — no external library
- Dark theme consistent styling
- OG image: max-height 120px, object-fit: cover, full width
  of popover

---

### Files Likely Involved

- scripts/enrich-previews.js — new script
- data/link-previews.json — generated, committed to repo
- layouts/partials/link-preview.html — new partial
- layouts/_default/single.html — inject partial, replace or
  enhance existing View Source button
- package.json — add `enrich-previews` npm script

**Constraints:**

- Do not modify theme files directly
- Preview renders nothing if no external URL in frontmatter
- If link-previews.json has no entry for a post, fall back to
  plain "View Source ↗" button — never break
- External links always open in new tab with
  rel="noopener noreferrer"
- data/link-previews.json committed to repo — will grow with
  content, accept noisy diffs
