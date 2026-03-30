# /add-video — Add a YouTube Video to a Gallery Album

Add a YouTube video to an existing gallery album's frontmatter. Fully interactive — no arguments needed.

Usage: `/add-video`

## Steps

1. **List available albums**
   Find all gallery albums:
   ```
   content/gallery/*/index.md
   ```
   Present the album names as a numbered list. Ask the user to pick one.

2. **Ask for the YouTube URL**
   Prompt: "Paste the YouTube URL:"
   Accept any format:
   - `https://www.youtube.com/watch?v=VIDEO_ID`
   - `https://youtu.be/VIDEO_ID`
   - `https://youtube.com/shorts/VIDEO_ID?feature=share`

3. **Extract the video ID**
   Parse the URL to get just the video ID:
   - `watch?v=` → take the `v` parameter value
   - `youtu.be/` → take the path segment
   - `shorts/` → take the path segment after `shorts/`
   Strip any query parameters (`?feature=share`, `&t=30`, etc.) from the ID.

4. **Ask for the video title**
   Prompt: "Video title:"

5. **Ask for an optional caption**
   Prompt: "Caption (or press Enter to skip):"

6. **Read the album's index.md**
   Read the frontmatter of the selected album's `index.md`.

7. **Add the video entry**
   - If `videos:` key already exists in frontmatter → append the new entry to the array
   - If no `videos:` key → add it with the new entry

   Entry format:
   ```yaml
   videos:
     - id: "VIDEO_ID"
       title: "Video Title"
       caption: "Caption text"    # omit this line if no caption
   ```

8. **Show the user what will be added**
   Display the video entry and ask for confirmation before writing.

9. **Verify the build**
   ```sh
   hugo server
   ```
   Check for warnings or errors.

## Notes
- Video IDs are YouTube IDs only — never full URLs in frontmatter
- The `caption` field should be omitted entirely (not set to empty string) when the user skips it
- This skill only modifies frontmatter — it does not touch the album's body text
