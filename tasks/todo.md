# Current Tasks

_No active tasks._

## Completed

- [x] Homepage redesign: Moody Slate colors, glassy feed cards, overlay gallery grid (PR #1, merged)
- [x] Set up CLAUDE.md, tasks/lessons.md, tasks/todo.md
- [x] Code cleanup: CSS design tokens, variablize Moody Slate, template hygiene (PR #2, merged)
  - CSS `:root` design token block — all colors, fonts, radii, transitions in one place
  - All Moody Slate hex values replaced with `var(--token)` references
  - Dead legacy CSS removed (old link colors, empty media query, duplicate nav block)
  - `gallery/single.html` rewritten — 7 inline styles → named CSS classes
  - `feed/single.html`, `index.html` inline styles removed
  - Duplicate `<title>` in `head_custom.html` deleted
  - `feedItemLimit` and `galleryAlbumLimit` params added to `hugo.toml`
