## Claude Code Handoff — Travel Page (Map + Timeline + Flight Lines)

**Goal:** Evolve existing map page into a Travel page with
persistent horizontal timeline, connected map interaction,
flight lines between trips, gallery sidebar, and responsive
mobile tab layout.

**Context:** Map already implemented with country highlighting
and gallery sidebar. Rename to Travel. Introduce trips.yaml
as source of truth. Galleries optionally reference trips.
Timeline and map connected — interacting with one updates other.
Mobile gets two tabs: Map and Timeline.

---

### RESOLVE BEFORE STARTING (CRITICAL — DO NOT SKIP)

These are blocking items. Several affect the data schema used
by this feature AND iOS Shortcut Phase 4. Resolve all before
writing any code.

- [ ] **Inspect existing map implementation fully:**
  - What library? (D3, Leaflet, custom SVG, TopoJSON?)
  - How are country codes stored? (ISO alpha-2 or alpha-3?)
  - How is the sidebar triggered? (JS event, URL hash, data attr?)
  - What projection is used? (Mercator, Natural Earth, etc.)
  - Can SVG elements be overlaid on the map? (Needed for flight
    lines — if not, flight lines may need to be deferred or
    built as a separate canvas/SVG layer)
  - Document: library name, country code format, sidebar trigger
    mechanism, and overlay feasibility
- [ ] **Country code format decision (REQUIRED):** Once you
  confirm what the existing map uses (alpha-2 or alpha-3),
  ALL of the following must use that same format:
  - trips.yaml `country_codes` field
  - Flight line coordinate lookups
  - iOS Shortcut Phase 4 Claude API prompt
  - **State this decision explicitly in the session before
    writing any data files**
- [ ] Check current URL structure for map page
- [ ] **Audit all existing gallery frontmatter for date
  inconsistencies** — Spain 2025 was flagged (Jan 3 date
  vs November trip). Fix content before building timeline.
- [ ] List all existing trips to populate trips.yaml — timeline
  needs real data to test against. Provide the list.
- [ ] Should future trips (trip_start after today) display
  differently on timeline? Recommend: yes, muted/dashed style.
  Decide now.
- [ ] Should clicking a flight line select the earlier or later
  of the two connected trips? Recommend: earlier. Decide now.
- [ ] What is the file path and function signature of the existing
  mobile bottom sheet component? Document before building mobile
  tab layout.

---

### Data Layer

**New file: data/trips.yaml**

```yaml
- id: switzerland-2026
  title: Switzerland 2026
  description: Skiing in Veysonnaz and Zermatt, city days in Zurich
  country_codes: [CHE]  # USE WHATEVER FORMAT MAP USES — see RESOLVE
  trip_start: 2026-03-05
  trip_end: 2026-03-16
  gallery: galleries/switzerland-2026

- id: spain-2025
  title: Spain 2025
  description: Family trip to Andalusia
  country_codes: [ESP]
  trip_start: 2025-11-01
  trip_end: 2025-11-14
  gallery: galleries/spain-2025

- id: egypt-2025
  title: Egypt 2025
  country_codes: [EGY]
  trip_start: 2025-03-10
  trip_end: 2025-03-20
```

- `gallery` field omitted entirely (not null, not empty string)
  if no gallery exists
- `description` field omitted if empty
- `country_codes` is an array — multi-country trips have multiple
  codes. Format MUST match existing map implementation.
- Entries ordered chronologically by trip_start (maintained by
  iOS Shortcut Phase 4 insertion logic)

**Gallery frontmatter addition:**

- Add optional `trip_id` field to existing gallery index.md
- Galleries without `trip_id` remain fully functional
- Map and timeline read from trips.yaml only — `trip_id` in
  gallery is for future cross-referencing, not required for v1

---

### Page Rename

- Rename page title and nav label from "Map" to "Travel"
- Update all internal references from /map/ to /travel/
- Add Hugo alias in frontmatter for redirect:
  ```yaml
  aliases: ["/map/"]
  ```
  This handles /map/ → /travel/ redirect natively in Hugo
  without server config.

---

### State Management (CRITICAL)

All interactive elements share a single state:

```javascript
const travelState = {
  activeTripId: null,  // string or null
};
```

**All of these update `activeTripId`:**
- Timeline entry click
- Map country click (lookup trip by country code)
- Flight line click
- Sidebar prev/next navigation
- Mobile bottom sheet prev/next navigation

**All of these READ `activeTripId` and update their display:**
- Map country highlighting
- Timeline scroll position + active indicator
- Sidebar content (or bottom sheet on mobile)
- Flight line active state

Implement as a simple pub/sub or event emitter pattern.
Do not build a framework — a 20-line observer is sufficient.

---

### Country Coordinate Lookup

**New file: data/country-coords.json**

Flight lines need start/end coordinates per country. Hardcode
a JSON lookup of countries the author has visited or plans to
visit. Do NOT include all 195 countries — only those in
trips.yaml. Add new countries as trips are added.

```json
{
  "CHE": { "lat": 46.8182, "lng": 8.2275 },
  "ESP": { "lat": 40.4637, "lng": -3.7492 },
  "EGY": { "lat": 26.8206, "lng": 30.8025 }
}
```

Use approximate geographic center, not capital. Good enough for
decorative arcs. Author can adjust coordinates if an arc looks
wrong.

Country code keys MUST match format in trips.yaml and existing
map implementation.

---

### Desktop Layout (1024px and above)

**Map:** Full viewport minus timeline strip height.
Existing country highlight and sidebar behavior preserved.

**Timeline strip:** Fixed horizontal bar at bottom.

- Fixed position, not scrolling with page
- Scrollable horizontally (overflow-x: auto)
- Each entry: trip title, year, optional country flag emoji
  or country code text
- Active trip visually distinct (highlight color, underline,
  or filled background)
- Clicking entry updates `activeTripId` → triggers:
  - Country highlight on map
  - Gallery sidebar opens (or shows trip info if no gallery)
  - Timeline centers on selected entry (smooth scroll)
- Chronological order, left (oldest) to right (newest)
- Future trips (if RESOLVE decision is yes): muted/dashed style

**Gallery sidebar additions:**

- Prev/next trip navigation arrows at top of sidebar
- Prev/next updates `activeTripId` — full state sync
- **No gallery state:** title, dates, description text only
- **Gallery state:** existing thumbnail + link behavior preserved

**Flight lines:**

- Static arcs between consecutive trips chronologically
- Connect countries using coordinates from country-coords.json
- **Implementation depends on map library (see RESOLVE):**
  - If SVG-based map (D3/custom): render arcs as SVG `<path>`
    elements in the same SVG
  - If Leaflet: use Leaflet's polyline/curve plugin or an SVG
    overlay pane
  - If overlay not feasible: defer flight lines to a future
    iteration — do not force an incompatible approach
- Visual style: thin line (1-2px), low opacity (~0.3), subtle
  curve (quadratic bezier with control point above midpoint)
- Always visible in default state (no trip selected)
- When a trip is selected: that trip's incoming flight line
  highlighted (higher opacity), others remain muted
- Clicking a line: selects the earlier of the two connected
  trips (per RESOLVE decision)
- **Multi-country trips:** if a trip has multiple country_codes,
  draw flight line to the FIRST country code in the array
  (primary destination)
- **Single trip edge case:** no flight lines rendered, no errors

---

### Mobile Layout (below 1024px)

**Two tabs at top: Map (default) and Timeline**

Tab bar: fixed at top below nav, simple two-button toggle.

**Map tab:**

- Full screen map below tab bar
- Existing country highlight behavior preserved
- Tapping country opens bottom sheet — **reuse existing bottom
  sheet component. Do not rebuild.** File path and trigger
  mechanism documented in RESOLVE section.
- Bottom sheet content: trip title, dates, description,
  gallery thumbnail (if gallery exists), gallery link,
  prev/next trip navigation
- Prev/next in bottom sheet updates `activeTripId` — same
  state sync as desktop
- Flight lines visible, styled thinner (1px) than desktop

**Timeline tab:**

- Reverse chronological trip cards (newest first)
- Each card: title, date range, country code(s), thumbnail
  if gallery exists, link to gallery if exists
- Tapping a card: switches to Map tab and selects that trip
  (updates `activeTripId`)

---

### Files Likely Involved

- data/trips.yaml — new, populate with all existing trips
- data/country-coords.json — new coordinate lookup
- content/travel/ — page rename from content/map/
- layouts/travel/ or layouts/_default/ — page template
- layouts/partials/timeline.html — horizontal strip (desktop)
- layouts/partials/timeline-cards.html — card list (mobile)
- layouts/partials/flightlines.html — SVG arc rendering
- layouts/partials/trip-sidebar.html — extend existing sidebar
- static/js/travel.js — state management, timeline/map sync,
  flight line interaction
- config/hugo.toml — nav label update

**Constraints:**

- Do not break existing map functionality during migration —
  map must work before timeline/flight lines are added
- Existing galleries must work without trip_id
- Flight lines degrade gracefully: 0 trips = nothing, 1 trip =
  no lines, 2+ trips = lines rendered
- Reuse existing mobile bottom sheet — do not rebuild
- Do not modify theme files directly
- Build incrementally: (1) rename + trips.yaml, (2) timeline,
  (3) state sync, (4) flight lines, (5) mobile tabs.
  Each step should be independently testable.
