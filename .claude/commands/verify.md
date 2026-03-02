# /verify — Preview Verification Workflow

Verify that the preview server reflects the latest edits. Follow this order (cheapest first):

## Steps

1. **Get the running server ID**
   Use `preview_list` to find the active server.

2. **Snapshot first** (text, cheap)
   Use `preview_snapshot` to confirm element presence, headings, and text content.
   Only read the specific section you changed — don't dump the whole tree.

3. **Inspect for styles** (if CSS was edited)
   Use `preview_inspect` with the changed selector and the specific CSS properties to check.
   Example: `selector: ".feed-card-title"`, `styles: ["font-family", "color", "font-size"]`

4. **Check for stale JS** (if JS was edited)
   Use `preview_eval`:
   ```js
   performance.getEntriesByType('resource').find(r => r.name.includes('map.js'))
   ```
   If `transferSize === 0`, the file is cached. Force a fresh load:
   ```js
   window.location.href = window.location.href.split('?')[0] + '?_bust=' + Date.now()
   ```

5. **Screenshot only if layout changed**
   Use `preview_screenshot` sparingly — it costs significantly more tokens than text tools.
   Use it when the visual arrangement of elements is what you're verifying.

## What to report

After verification, summarize:
- What was checked
- Whether it passed or failed
- If failed: what the actual vs. expected state was
