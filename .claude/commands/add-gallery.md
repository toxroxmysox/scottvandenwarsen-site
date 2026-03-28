# /add-gallery — Add a New Gallery Album

Create a new photo gallery album, optionally linked to a trip on the Travel page.

Usage: `/add-gallery "Album Name" LOCATION_CODE`

Examples:
- `/add-gallery "Japan 2026" JP` — gallery + trip
- `/add-gallery "Cottage Visits" CA` — gallery only, no trip
- `/add-gallery "Italy 2026" IT` — prompts whether to add a trip

## Steps

1. **Parse arguments**
   - First arg: album name (quoted string)
   - Second arg: ISO 3166-1 alpha-2 location code

2. **Validate the location code**
   - Check it exists in `data/country_flags.json`
   - If invalid, show the user available codes and ask for correction

3. **Create the gallery folder and index.md**
   ```sh
   mkdir -p "content/gallery/$ALBUM_NAME"
   ```
   Then create `content/gallery/$ALBUM_NAME/index.md` with frontmatter:
   ```yaml
   ---
   title: "$ALBUM_NAME"
   date: YYYY-MM-DD
   draft: false
   summary: ""
   tags: []
   cover: "cover.jpg"
   location: "$LOCATION_CODE"
   ---
   ```
   - Set `date:` to today (or ask user)
   - Leave `summary:`, `tags:`, `cover:` for user to fill after adding photos

4. **Ask: "Should this gallery be linked to a trip on the Travel page?"**
   - If **yes**: append a new entry to `data/trips.yaml`:
     ```yaml
     - id: album-name-slugified
       title: "Album Name"
       description: ""
       country_codes: ["LOCATION_CODE"]
       trip_start: YYYY-MM-DD
       trip_end: YYYY-MM-DD
       gallery: "/gallery/album-name-slugified/"
     ```
     - Prompt for trip start/end dates and description
     - Generate `id` from album name (lowercase, hyphenated)
     - Verify the id doesn't already exist in trips.yaml
     - For multi-country trips, ask for additional country codes
   - If **no**: skip. Gallery appears on `/gallery/` page only (not on travel map/timeline).

5. **Verify the build**
   ```sh
   hugo server
   ```
   Check for warnings or errors. If a `warnf` fires about a bad gallery path, fix the trips.yaml entry.

6. **Remind the user to:**
   - Add photos to `content/gallery/$ALBUM_NAME/` alongside index.md
   - Set `cover:` in frontmatter to match the cover photo filename
   - Write body text in the index.md (or in Obsidian)

## Location code reference
Countries: ISO 3166-1 alpha-2 (EG=Egypt, FR=France, ES=Spain, JP=Japan, CH=Switzerland, IT=Italy, DE=Germany, GB=United Kingdom, US=United States)

## Data model notes
- Gallery `location` = single alpha-2 string (for flag badge on gallery card)
- Trip `country_codes` = array of alpha-2 strings (for map highlighting — supports multi-country trips)
- Trip `gallery` = URL path to gallery (e.g., `/gallery/japan-2026/`)
- Omit `description` and `gallery` fields from trips.yaml when empty (don't set to empty string)
