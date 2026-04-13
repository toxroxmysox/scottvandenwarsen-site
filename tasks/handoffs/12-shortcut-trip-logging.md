## Claude Code Handoff — iOS Shortcut Phase 4: Trip Logging

**Goal:** iOS Shortcut that adds a new trip entry to
data/trips.yaml at any time — past, present, or future —
with Claude normalizing country names to ISO codes and
handling multi-country trips.

**Context:** Phase 4. Writes to data/trips.yaml — source of
truth for Travel page. Author always knows full trip details
when logging. No photo handling. Phase 1 must be complete.

---

### RESOLVE BEFORE STARTING

- [ ] Phase 1 must be complete and tested
- [ ] **Confirm ISO code format used by existing map (alpha-2
  vs alpha-3).** This was resolved in Travel Page handoff —
  use the SAME format here. If Travel Page hasn't been built
  yet, resolve it now. This will break the map if wrong.
- [ ] Inspect current data/trips.yaml structure — confirm
  it exists and matches expected schema
- [ ] Confirm gallery path format used in trips.yaml
  (e.g., `galleries/spain-2025` — relative to content/ root
  or absolute?)
- [ ] Does the author want Claude Code to also offer creating
  a gallery folder stub when gallery path is provided?

---

### Chronological Ordering — REDESIGNED

**PROBLEM WITH ORIGINAL APPROACH:** Inserting a YAML entry at
a specific chronological position via text manipulation in iOS
Shortcuts is extremely fragile. You'd need to split a YAML array,
find the right insertion point by comparing date strings, and
reassemble — one wrong newline and the YAML is invalid. Shortcuts
has no debugger, so a subtle break is hours of troubleshooting.

**SOLUTION:** Shortcut appends new entries to the END of
trips.yaml. A separate script sorts the file by `trip_start`
date. Two options for when sorting happens:

**Option A (recommended): Sort script in Husky pre-commit hook.**
Add to the existing Husky pre-commit hook (from EXIF Photo Sort
handoff):
```sh
node scripts/sort-gallery-photos.js
node scripts/sort-trips.js
git add content/galleries/
git add data/trips.yaml
```
This means trips.yaml is always sorted on commit. The Shortcut
doesn't need to care about order.

**Option B: Sort as part of Cloudflare build.**
Run sort before Hugo: `node scripts/sort-trips.js && hugo && npx pagefind --site public`
Trips display correctly on the live site but the repo file
stays unsorted. Less clean but works.

**Recommend Option A.** The Shortcut's job is simplified to:
append entry, commit, trigger build.

---

### Sort Script: scripts/sort-trips.js

- Reads data/trips.yaml
- Parses as YAML (use `js-yaml` package)
- Sorts array by `trip_start` date ascending (oldest first)
- Writes back to data/trips.yaml
- Idempotent — running on already-sorted file produces no change
- Add to package.json: `"sort-trips": "node scripts/sort-trips.js"`

---

### Shortcut Flow

1. **Opened directly** — no share sheet trigger

2. **Sequential prompts:**
   - "Trip name?" — text input
   - "Countries visited? (separate multiple with commas)"
     — text input (e.g., "Spain, Morocco" or "Switzerland")
   - "Start date?" — date picker, prefilled today
   - "End date?" — date picker, prefilled today
   - "Short description?" — text input (can be left empty)
   - "Is there a gallery?" — Yes / No
     - If yes: "Gallery path?" — text input
       (e.g., `galleries/spain-2025`)

3. **GET data/trips.yaml via GitHub Contents API:**
   - Decode base64, store full content as text
   - Store SHA for PUT
   - Extract existing trip IDs: scan for `- id: ` lines,
     collect values into a list

4. **Claude API call:**
   ```
   POST https://api.anthropic.com/v1/messages
   Body: { model: "claude-sonnet-4-20250514", max_tokens: 500,
     messages: [{ role: "user", content: "Trip: {name}\nCountries: {countries}\nStart: {start}\nEnd: {end}\nDescription: {description}\nGallery: {gallery or 'none'}" }],
     system: "{system prompt below}" }
   ```
   - Parse JSON from response
   - Check if generated `id` exists in extracted ID list
   - If collision: append `-2` to id

5. **Construct new YAML entry as plain text:**
   ```
   - id: {id}
     title: {title}
     description: {description}
     country_codes: [{codes}]
     trip_start: {start}
     trip_end: {end}
     gallery: {gallery}
   ```
   - **Omit `description` line entirely if empty** (not `description: ""`)
   - **Omit `gallery` line entirely if null/none** (not `gallery: ""`)
   - `country_codes` formatted as YAML inline array: `[ESP, MAR]`
     (no quotes needed for alpha-3 codes in YAML)

6. **Append new entry to end of existing trips.yaml content:**
   - Simple string concatenation: existing content + newline +
     new entry
   - **Do NOT attempt chronological insertion in Shortcuts.**
     The sort script handles ordering.

7. **PUT data/trips.yaml via GitHub API:**
   - Include SHA from step 3
   - Commit message: "Add trip: {title} via iOS Shortcut"

8. **POST Cloudflare deploy hook**

9. **Notification:** "{Trip title} logged. Site rebuilding."

---

### Claude API System Prompt

```
You are a formatter for a Hugo static site YAML data file.
The user will provide trip details. Return only a JSON object
with no markdown formatting, no backticks, no explanation:

{
  "id": "url-friendly lowercase hyphenated trip name including year, max 4 words, e.g. spain-2025",
  "title": "properly capitalized trip title",
  "description": "description as provided, or empty string if none",
  "country_codes": ["ISO 3166-1 {FORMAT} codes for each country, normalized from natural language input"],
  "trip_start": "YYYY-MM-DD",
  "trip_end": "YYYY-MM-DD",
  "gallery": "gallery path as provided, or null if none"
}

Country code examples: Spain=ESP, France=FRA, Morocco=MAR,
United States=USA, United Kingdom=GBR, Egypt=EGY, Japan=JPN,
Italy=ITA, Portugal=PRT, Switzerland=CHE, Germany=DEU,
Netherlands=NLD, Austria=AUT
```

**NOTE:** Replace `{FORMAT}` with "alpha-2" or "alpha-3" based
on the RESOLVE decision. Update the example codes accordingly
if alpha-2 (ES, FR, MA, US, GB, EG, JP, IT, PT, CH, DE, NL, AT).

---

### What Claude Code Builds

1. scripts/sort-trips.js — sort script
2. Update .husky/pre-commit — add sort-trips step (if Husky
   exists from EXIF handoff; if not, create Husky setup)
3. docs/shortcuts/trip-logging.md — detailed construction docs
4. **Optional:** If author confirms, offer to create a gallery
   folder stub at `content/galleries/{path}/index.md` with
   `trip_id` in frontmatter when gallery path is provided.
   Document this as a manual step, not automated.

**Constraints:**

- Country code format MUST exactly match map implementation
  and trips.yaml schema — confirmed in RESOLVE
- Shortcut appends to end — sorting handled by script
- SHA read fresh every time
- YAML must remain valid after append — test with multiple
  entries
- `gallery` and `description` fields omitted when empty,
  not set to empty string or null
- All credentials reused from Phase 1
