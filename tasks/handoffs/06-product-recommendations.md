## Claude Code Handoff — Product Recommendations Section

**Goal:** Build a filterable searchable product recommendations
section with one markdown file per product, stacking category
and price tier filters, and AI-assisted file generation support.

**Context:** Separate from reading/watching/listening
recommendations. No prose — products defined entirely by
frontmatter. Filters stack. Default groups by category, ordered
low to high price. Dozen products to start.

---

### RESOLVE BEFORE STARTING

- [ ] Confirm URL structure: `/products/` or `/gear/`?
- [ ] Nav label: "Gear" recommended — author to confirm
- [ ] Should individual product pages exist at
  `/products/[slug]/`? Recommend no — no prose means no
  value. List page only to start. But Hugo will generate
  single pages by default — either add `_build: {render: never}`
  to each product or use `layouts/products/single.html` that
  redirects to list page.
- [ ] Confirm Fuse.js is already in the repo or needs adding
- [ ] Check existing recommendations structure for naming
  consistency

---

### Content Structure

**Location:** content/products/[product-slug]/index.md

**Frontmatter schema:**

```yaml
---
title: "Anker 737 Power Bank"
category: "Electronics"
price: 85
price_tier: "50-100"
buy_url: "https://..."
endorsement: "love it"
date: 2025-11-01
draft: false
---
```

- price: numeric, for sorting
- price_tier: one of "0-25", "25-50", "50-100", "100-150", "150+"
- **Price tier boundaries (inclusive-exclusive):**
  - "0-25" = $0.00 to $24.99
  - "25-50" = $25.00 to $49.99
  - "50-100" = $50.00 to $99.99
  - "100-150" = $100.00 to $149.99
  - "150+" = $150.00 and above
  - Claude API prompt (Phase 2 Shortcut) must implement these
    same boundaries when calculating price_tier
- endorsement: exactly "love it" or "like it" — no other values
- No body content — empty below frontmatter
- No image required initially (future enhancement)

---

### Build-Time Category Index

**File: data/product-categories.yaml** (generated)

To support iOS Shortcut Phase 2 without N+1 GitHub API calls,
generate a category index at build time or via npm script:

```yaml
categories:
  - Electronics
  - Kitchen
  - Travel
```

**Script: scripts/build-product-categories.js**

- Reads all content/products/*/index.md files
- Extracts unique categories, sorts alphabetically
- Writes to data/product-categories.yaml
- Add to pre-commit hook (Husky) or run manually
- Add npm script: `npm run build-product-categories`

This file is committed to repo. iOS Shortcut Phase 2 reads
this single file instead of fetching every product individually.

---

### Page Layout & Behavior

**Progressive enhancement:** Page must work with zero JS.
No-JS state: all products shown, ungrouped, alphabetical by
title. JS enhances with filters, grouping, and search.

**Filter bar (JS-enhanced):**

- Two filter groups: Category and Price Tier
- Toggle pills — values derived dynamically from frontmatter
  at page render (Hugo generates the pill markup, JS handles
  toggle behavior)
- Price tier pills always in fixed order: 0-25, 25-50,
  50-100, 100-150, 150+
- Filters stack — selecting Electronics AND 50-100 shows
  only electronics in that price range
- Active filters visually distinct (filled vs outlined)
- Clear all filters button — hidden when no filters active
- Fuse.js search input alongside filters — searches title
  and category fields

**State machine for grouping (4 states):**

| Category filter | Price filter | Sections are    | Sort within section |
|----------------|-------------|-----------------|-------------------|
| None           | None        | Categories (A-Z)| Low → high price  |
| None           | Selected    | Categories (A-Z)| Low → high price  |
| Selected       | None        | Price tiers (order)| Low → high price |
| Selected       | Selected    | Flat list (no sections)| Low → high price |

- Empty sections hidden in all states
- Implement as explicit state machine, not nested conditionals

**Product card:**

- Name (primary text)
- Category label (small, muted)
- Price (formatted with $ sign)
- Endorsement badge: "love it" gets a subtle heart or star
  indicator, "like it" gets no badge
- Buy link button — opens in new tab with
  rel="noopener noreferrer"
- No image initially

---

### Files Likely Involved

- content/products/ — new section with product files
- data/product-categories.yaml — generated category index
- scripts/build-product-categories.js — category extraction
- layouts/products/list.html — filter UI and grouping logic
- layouts/products/single.html — redirect to list or minimal
  page (per RESOLVE decision above)
- static/js/products-filter.js — filter, grouping state
  machine, and Fuse.js search
- static/css/products.css — pill toggle and card styles
- config/hugo.toml — nav addition

**Constraints:**

- Do not modify theme files directly
- All filtering client-side, no page reload
- No-JS fallback: ungrouped alphabetical list, no errors
- Must handle 1 product or 100 products without layout issues
- Buy links always new tab with rel="noopener noreferrer"
