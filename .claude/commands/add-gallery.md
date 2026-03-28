# /add-gallery — Add a New Gallery Album

Create a new photo gallery album, optionally linked to a trip on the Travel page. Fully interactive — no arguments needed.

Usage: `/add-gallery`

## Steps

1. **Ask for the album name**
   Prompt: "Album name (e.g., 'Japan 2026'):"

2. **Ask for the location code**
   Prompt: "Location code (e.g., JP, FR, EG):"
   - Validate it exists in `data/country_flags.json`
   - If invalid, show available codes and ask again

3. **Ask for the album date**
   Prompt: "Album date (YYYY-MM-DD, or press Enter for today):"
   - Default to today's date if skipped

4. **Create the gallery folder and index.md**
   ```sh
   mkdir -p "content/gallery/$ALBUM_NAME"
   ```
   Create `content/gallery/$ALBUM_NAME/index.md` with frontmatter:
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

5. **Ask: "Link this to a trip on the Travel page?"**
   - If **yes**:
     - Ask for trip start date
     - Ask for trip end date
     - Ask for trip description (optional)
     - Ask if there are additional country codes (for multi-country trips)
     - Append a new entry to `data/trips.yaml`:
       ```yaml
       - id: album-name-slugified
         title: "Album Name"
         description: "Trip description"
         country_codes: ["LOCATION_CODE"]
         trip_start: YYYY-MM-DD
         trip_end: YYYY-MM-DD
         gallery: "/gallery/album-name-slugified/"
       ```
     - Generate `id` from album name (lowercase, hyphenated)
     - Verify the id doesn't already exist in trips.yaml
     - Omit `description` if empty
   - If **no**: skip. Gallery appears on `/gallery/` page only.

6. **Verify the build**
   ```sh
   hugo server
   ```
   Check for warnings or errors.

7. **Remind the user to:**
   - Add photos to `content/gallery/$ALBUM_NAME/` alongside index.md
   - Set `cover:` in frontmatter to match the cover photo filename
   - Write body text in Obsidian

## Location code reference
Countries: ISO 3166-1 alpha-2 (EG=Egypt, FR=France, ES=Spain, JP=Japan, CH=Switzerland, IT=Italy, DE=Germany, GB=United Kingdom, US=United States)

## Data model notes
- Gallery `location` = single alpha-2 string (for flag badge on gallery card)
- Trip `country_codes` = array of alpha-2 strings (for map highlighting — supports multi-country trips)
- Trip `gallery` = URL path to gallery (e.g., `/gallery/japan-2026/`)
- Omit `description` and `gallery` fields from trips.yaml when empty (not set to empty string)
