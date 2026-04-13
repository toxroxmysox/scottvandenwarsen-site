## Claude Code Handoff — Now Playing Widget

**Goal:** A contextual "now playing" widget that shows what Scott
is currently reading, watching, and listening to. Appears in full
on the homepage, filtered to one category on individual feed
section pages.

**Context:** Edited via iOS Shortcut (Phase 1 of shortcut
publishing interface — separate handoff). Data lives in a single
YAML file. Widget is not a standalone page — embedded only.

---

### RESOLVE BEFORE STARTING

- [ ] Confirm template paths for homepage and feed section pages
- [ ] Check if reading/watching/listening use separate list
  templates or a shared one with a parameter
- [ ] Confirm how Hugo accesses data files in current setup
  (expected: `.Site.Data.now`)
- [ ] Decide placement on homepage: above or below existing feed
  section previews — do not proceed without a decision
- [ ] Should the `updated` date display in the widget? Decide now.

---

### Data Source

**File: data/now.yaml**

```yaml
reading: "Atomic Habits — James Clear"
watching: "Severance S2"
listening: "Huberman Lab"
updated: 2026-03-19
```

- All fields optional — if a field is empty or missing, that
  item is not rendered in the widget
- updated field optional — show only if present and author
  confirms display preference above
- If all three content fields are empty or missing, widget
  renders nothing — no empty container, no whitespace

---

### Widget Behavior

**Homepage (now-widget.html):**

- Shows all populated items (reading, watching, listening)
- If only 1 of 3 is populated, renders just that one — no
  empty slots, no placeholder text
- Each item: category label + content string
- Compact — single line per item, not a card layout
- "Last updated [date]" if updated field present — absolute
  date format (e.g., "March 19, 2026"), no JS required

**Individual feed section pages (now-inline.html):**

- Shows only the matching now field for that section
- Pass section name as partial parameter to filter:
  `{{ partial "now-inline.html" (dict "field" "reading") }}`
- Renders as a subtle banner or inline note above post list
- Not the full widget — single line only

**Styling:**

- Understated — supporting element, not hero content
- Consistent with existing dark theme
- Small text, muted color, clear label
- Text labels: Now Reading / Now Watching / Now Listening
- Visually subordinate to surrounding content

---

### Files Likely Involved

- data/now.yaml — new data file
- layouts/partials/now-widget.html — full multi-item version
- layouts/partials/now-inline.html — single item contextual,
  accepts field parameter
- layouts/index.html — inject now-widget partial at decided
  position
- layouts/reading/list.html (and watching, listening) —
  inject now-inline partial filtered to matching field

**Constraints:**

- Widget must render nothing if data/now.yaml is missing
  or all fields are empty — use `with .Site.Data.now` guard
- Do not modify theme files directly
- Must be visually subordinate to surrounding content
- No JavaScript required for this feature
