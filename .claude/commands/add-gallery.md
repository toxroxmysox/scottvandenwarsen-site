# /add-gallery — Add a New Gallery Album

Create a new photo album for the site. Takes the album name and location as arguments.

Usage: `/add-gallery "Japan 2026" JP`

## Steps

1. **Create the album directory**
   ```sh
   mkdir -p "content/gallery/$ALBUM_NAME"
   ```

2. **Create index.md** with frontmatter:
   ```yaml
   ---
   title: "$ALBUM_NAME"
   date: YYYY-MM-DD
   draft: false
   summary: ""
   tags: ["travel"]
   cover: "cover.jpg"
   location: "$LOCATION_CODE"
   ---
   ```
   - `location` must be an ISO 3166-1 alpha-2 code for countries (e.g., `JP`, `FR`, `EG`)
   - For US states: `US-CA`, `US-NY`, etc.

3. **Confirm** the gallery will appear on the map:
   - Country/state will auto-highlight on `/map/` once `galleries.json` rebuilds
   - The mini-map on the homepage will also update

4. **Remind the user** to:
   - Add photos to `content/gallery/$ALBUM_NAME/` alongside index.md
   - Set `cover:` to match the filename of the cover photo
   - Run `hugo server` to preview before pushing

## Location code reference
Countries: ISO 3166-1 alpha-2 (EG=Egypt, FR=France, ES=Spain, JP=Japan, US=United States)
US states: ISO 3166-2 (US-CA=California, US-NY=New York, US-TX=Texas)
