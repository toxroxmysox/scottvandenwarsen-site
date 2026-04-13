## Claude Code Handoff — EXIF Photo Sort + Pre-Commit Hook

**Goal:** Automatically rename gallery photos in chronological
order based on EXIF data before each commit so Hugo's default
alphabetical sort equals chronological order at zero build cost.

**Context:** Author drags photos from Apple Photos into gallery
folders on Mac. Apple exports with inconsistent filenames.
A pre-commit git hook runs a local script that reads EXIF
DateTimeOriginal, renames files in place, and stages renames
before commit completes. Cloudflare Pages builds from already-
sorted filenames.

---

### RESOLVE BEFORE STARTING

- [ ] Confirm exact path where gallery image folders live
  (expected: `content/galleries/[gallery-name]/`)
- [ ] Check if npm/node setup exists in repo (package.json?)
- [ ] Check existing gallery images — list file extensions in use
- [ ] **HEIC decision (REQUIRED):** Apple Photos exports HEIC by
  default. Does the author convert to JPG before dragging into
  gallery folders? Options:
  - A) Author always converts to JPG first — script supports
    jpg, jpeg, png, webp only
  - B) Script handles HEIC for EXIF reading but author must
    still convert to JPG for Hugo rendering (HEIC is not
    web-renderable) — script reads EXIF from HEIC but does
    NOT convert format
  - C) Script converts HEIC to JPG automatically (scope creep,
    requires sharp or similar — not recommended for v1)
  - **Pick A or B before proceeding.**
- [ ] Should a one-time retroactive migration script be offered
  for existing gallery photos? Recommend yes — build as a
  separate `npm run sort-photos-migrate` that runs once.
- [ ] Confirm author uses GitHub Desktop — hooks need testing
  with GitHub Desktop specifically (see implementation notes)

---

### Script: scripts/sort-gallery-photos.js

- Scans all folders under content/galleries/
- For each image file (jpg, jpeg, png, webp — add heic only
  if RESOLVE decision is B):
  - Read EXIF DateTimeOriginal via `exifr` package
  - If found: rename to `YYYY-MM-DD-HHMMSS-NNN.ext`
    - NNN = zero-padded 3-digit sequence number (001, 002, etc.)
  - If not found: rename to `ZZZZ-NNN.ext` (sorts to end)
- Only renames files that don't already match the target
  pattern — idempotent
- Logs each rename to console: `old-name.jpg → 2025-03-10-143022-001.jpg`
- Does not touch non-image files (markdown, yaml, etc.)
- Does not touch files outside content/galleries/

**Dependencies:**

- `exifr` package — lightweight, handles HEIC EXIF reading
- Node.js (already required for Hugo ecosystem)

**Collision handling — deterministic tiebreaker:**

- Identical DateTimeOriginal timestamps (burst photos):
  sort by ORIGINAL filename alphabetically BEFORE assigning
  sequence numbers. This ensures re-running the script
  produces the same output — idempotency requires a stable
  tiebreaker, not arbitrary ordering.
- Sequence numbers: 001, 002, 003, etc.
- No EXIF photos (ZZZZ prefix): also sorted by original
  filename for stable ordering.

---

### Pre-Commit Hook via Husky

**Do NOT use raw .git/hooks/. Use Husky instead.**

Raw `.git/hooks/pre-commit` is not committed to the repo, breaks
on every clone, and has inconsistent behavior with GitHub Desktop.
Husky stores hook configuration in `.husky/` which IS committed
and works reliably across Git clients including GitHub Desktop.

**Setup:**

1. Install Husky: `npm install --save-dev husky`
2. Initialize: `npx husky init`
3. Create `.husky/pre-commit`:
   ```sh
   node scripts/sort-gallery-photos.js
   git add content/galleries/
   ```
4. Add to package.json scripts:
   ```json
   {
     "scripts": {
       "prepare": "husky",
       "sort-photos": "node scripts/sort-gallery-photos.js"
     }
   }
   ```

**Behavior:**

- On every commit, Husky runs the sort script
- Script renames files if needed, then `git add` stages changes
- If script errors: commit aborts, error message displayed
- Bypass if needed: `git commit --no-verify`
- New clones: `npm install` automatically activates Husky
  via the `prepare` script

**Post-implementation documentation Claude Code must provide:**

- What files were created and where
- How to verify hook is active (make a test commit)
- What GitHub Desktop shows when hook fires (brief delay
  before commit completes, renames appear in diff)
- How to bypass: `git commit --no-verify` (CLI) or
  uncheck "Run hooks" if GitHub Desktop exposes it
- What to do if a photo fails EXIF reading (it gets ZZZZ
  prefix, sorts to end — not an error)

---

### One-Time Migration Script (Optional)

If author confirms, build `scripts/sort-gallery-photos-migrate.js`:

- Same logic as main script
- Runs against all existing galleries
- Outputs a summary: X files renamed, Y files already sorted,
  Z files with no EXIF
- Run manually: `npm run sort-photos-migrate`
- Author reviews changes in git diff before committing

---

### Files Likely Involved

- scripts/sort-gallery-photos.js — new script
- .husky/pre-commit — new hook file, committed to repo
- package.json — add dependencies (husky, exifr), add scripts

**Constraints:**

- Script must be idempotent — running twice produces same result
- Must not rename non-image files
- Must not touch files outside content/galleries/
- Deterministic output: same input files always produce same
  renamed output regardless of filesystem ordering
- Renames must be staged automatically via `git add`
