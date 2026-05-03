# Gallery Image Optimization & Git History Cleanup

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace full-size gallery images (~4.3 MB avg) with web-optimized versions (~400 KB), add Hugo-based WebP thumbnail generation, delete the `public/` build artifact, and purge old large blobs from git history — reducing the repo from ~2.8 GB to under 200 MB.

**Architecture:** Three independent concerns: (1) delete ephemeral build output, (2) re-encode originals with `sips` and update the gallery template to also generate tiny WebP thumbnails at build time via Hugo image processing, (3) purge old blob versions from git history with `git-filter-repo` and force-push. Work happens in the main repo (`/Users/Scott/Website/scottvandenwarsen-site`), not the worktree — worktrees share the same `.git`, so filter-repo must run against the main checkout.

**Tech Stack:** `sips` (macOS built-in, no install), Hugo Extended v0.154.2 image processing, `git-filter-repo` (install via Homebrew), `gh` CLI

---

## Files

| File | Change |
|------|--------|
| `public/` | Delete entirely (ephemeral build output, gitignored, Cloudflare rebuilds from source) |
| `content/gallery/**/*.{jpg,jpeg,JPG,png}` | Re-encoded in-place at ≤2400px wide, JPEG quality 80 |
| `layouts/gallery/single.html` | Add Hugo image-processing step to generate 400px WebP thumbnails for the photo grid |

---

## Task 1: Delete `public/`

**Files:**
- Delete: `public/` (entire directory)

- [ ] **Step 1: Remove public/ from disk**

```bash
rm -rf /Users/Scott/Website/scottvandenwarsen-site/public/
```

Expected: command exits silently; `du -sh /Users/Scott/Website/scottvandenwarsen-site/public/` returns an error.

- [ ] **Step 2: Verify it's gone and gitignored**

```bash
cd /Users/Scott/Website/scottvandenwarsen-site
ls public/ 2>/dev/null && echo "EXISTS" || echo "GONE"
git status --short | grep public || echo "git: not tracking public/"
```

Expected: `GONE` and no git status output for `public/`.

---

## Task 2: Optimize gallery images with `sips`

**Files:**
- Modify in-place: `content/gallery/**/*.{jpg,jpeg,JPG,png}`

`sips` is macOS's built-in image processing CLI. We'll resize every gallery image so the longest edge is ≤ 2400px, re-encode as JPEG at quality 80. For already-small images (< 2400px), `sips` skips the resize. This replaces the originals — full-size copies are safe in your personal vault.

- [ ] **Step 1: Dry-run — list all gallery images and their current dimensions**

```bash
cd /Users/Scott/Website/scottvandenwarsen-site
find content/gallery -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) \
  | while read f; do
      dims=$(sips -g pixelWidth -g pixelHeight "$f" 2>/dev/null | awk '/pixelWidth/{w=$2} /pixelHeight/{h=$2} END{print w"x"h}')
      size=$(stat -f%z "$f" | awk '{printf "%.1f MB", $1/1024/1024}')
      echo "$size  $dims  $f"
    done | sort -rh | head -20
```

Expected: list of large images sorted by size. Review it — if anything looks surprising (e.g., a cover image you expected to be small), note it before proceeding.

- [ ] **Step 2: Optimize all gallery images in-place**

```bash
cd /Users/Scott/Website/scottvandenwarsen-site
find content/gallery -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) \
  | while read f; do
      sips --resampleHeightWidthMax 2400 \
           --setProperty formatOptions 80 \
           --setProperty format jpeg \
           "$f" --out "$f" 2>/dev/null
      echo "done: $f"
    done
```

Note: `sips --out "$f"` overwrites in place. `--resampleHeightWidthMax 2400` only downscales; it never upscales.

- [ ] **Step 3: Verify size reduction**

```bash
cd /Users/Scott/Website/scottvandenwarsen-site
du -sh content/gallery/*/
```

Expected: each album should be dramatically smaller — Egypt 2023 going from ~200 MB to ~10–20 MB, etc. Total gallery directory should be under 60 MB.

- [ ] **Step 4: Spot-check an image looks correct**

```bash
sips -g pixelWidth -g pixelHeight \
  "$(find content/gallery -iname "*.jpg" | head -1)"
```

Expected: longest edge ≤ 2400px.

---

## Task 3: Update gallery template to generate WebP thumbnails at build time

**Files:**
- Modify: `layouts/gallery/single.html:40-53`

Currently the template serves the same full image for both the grid thumbnail and the PhotoSwipe lightbox link. Hugo Extended's image processing can generate a compact 400px WebP thumbnail for the grid, keeping the (now-optimized) 2400px JPEG as the lightbox source. This further reduces page load on the gallery page.

PhotoSwipe v4 requires `data-size="WxH"` on the `<a>` tag — those dimensions must match the image that PhotoSwipe will actually display (the `href` target). So `data-size` stays on the original `$img` dimensions, not the thumbnail.

- [ ] **Step 1: Replace the photo loop in `layouts/gallery/single.html`**

Find this block (lines 40–54 approximately):

```html
  <div class="row pswp-gallery" itemscope itemtype="http://schema.org/ImageGallery">
    {{ $imgs := .Resources.Match "*.{jpg,jpeg,png,webp}" }}
    {{ range $i, $img := $imgs }}
      <div class="col-sm-4 album-photo-col">
        <a href="{{ $img.RelPermalink }}"
           data-size="{{ $img.Width }}x{{ $img.Height }}"
           itemprop="contentUrl">
          <img src="{{ $img.RelPermalink }}"
               alt="{{ $.Title }} — photo {{ add $i 1 }}"
               class="album-thumb"
               loading="lazy"
               itemprop="thumbnail">
        </a>
      </div>
    {{ end }}
  </div>
```

Replace it with:

```html
  <div class="row pswp-gallery" itemscope itemtype="http://schema.org/ImageGallery">
    {{ $imgs := .Resources.Match "*.{jpg,jpeg,png,webp}" }}
    {{ range $i, $img := $imgs }}
      {{ $thumb := $img.Resize "400x webp q80" }}
      <div class="col-sm-4 album-photo-col">
        <a href="{{ $img.RelPermalink }}"
           data-size="{{ $img.Width }}x{{ $img.Height }}"
           itemprop="contentUrl">
          <img src="{{ $thumb.RelPermalink }}"
               alt="{{ $.Title }} — photo {{ add $i 1 }}"
               class="album-thumb"
               loading="lazy"
               itemprop="thumbnail">
        </a>
      </div>
    {{ end }}
  </div>
```

The only changes: add `{{ $thumb := $img.Resize "400x webp q80" }}` and change `img src` from `$img.RelPermalink` to `$thumb.RelPermalink`. The lightbox `href` and `data-size` still point to `$img` (the 2400px JPEG).

- [ ] **Step 2: Verify Hugo build succeeds**

```bash
cd /Users/Scott/Website/scottvandenwarsen-site
hugo 2>&1 | tail -5
```

Expected: `Built in Xs` with no WARN or ERROR lines.

- [ ] **Step 3: Check that generated thumbnails exist in resources/_gen**

```bash
find /Users/Scott/Website/scottvandenwarsen-site/resources/_gen/images \
  -name "*.webp" 2>/dev/null | wc -l
```

Expected: count equal to number of gallery photos (89).

- [ ] **Step 4: Confirm resources/_gen is gitignored**

```bash
cd /Users/Scott/Website/scottvandenwarsen-site
git check-ignore -v resources/_gen/images/ 2>/dev/null || \
  grep -n "resources" .gitignore
```

Expected: gitignore rule for `resources/` is present. If not, add `/resources/_gen/` to `.gitignore`.

---

## Task 4: Commit optimized images and template change

**Files:**
- Stage: `content/gallery/` (all modified images)
- Stage: `layouts/gallery/single.html`

- [ ] **Step 1: Check what's staged**

```bash
cd /Users/Scott/Website/scottvandenwarsen-site
git status --short | head -20
git diff --stat HEAD | tail -5
```

Expected: all gallery images show as modified (`M`), plus `layouts/gallery/single.html`.

- [ ] **Step 2: Confirm total working tree is now smaller**

```bash
du -sh /Users/Scott/Website/scottvandenwarsen-site/content/gallery/
```

Expected: under 60 MB total (down from 715 MB).

- [ ] **Step 3: Stage and commit**

```bash
cd /Users/Scott/Website/scottvandenwarsen-site
git add content/gallery/ layouts/gallery/single.html
git commit -m "$(cat <<'EOF'
optimize gallery images and add WebP thumbnails

Replace full-size originals (avg 4.3 MB) with 2400px-wide JPEG at q80
(avg ~350 KB). Add Hugo image processing to generate 400px WebP thumbnails
for the gallery grid at build time; lightbox still uses the full-quality source.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

Expected: commit succeeds, shows number of changed files.

---

## Task 5: Install git-filter-repo and purge old large blobs from history

**Context:** git-filter-repo rewrites the entire commit graph to remove blobs matching a path pattern. It is destructive and irreversible — old SHAs are gone. This is intentional: we want to reclaim the ~715 MB of old full-size images stored in git history. Full-size originals are safely stored in your personal vault.

**Important:** `git-filter-repo` must run against the **main checkout** at `/Users/Scott/Website/scottvandenwarsen-site`, not a worktree. It also removes the `origin` remote as a safety measure — you'll re-add it afterward.

**Files:**
- Rewrites: `.git/` pack objects (removes old gallery image blobs)

- [ ] **Step 1: Install git-filter-repo**

```bash
brew install git-filter-repo
git filter-repo --version
```

Expected: version string printed, e.g. `git filter-repo==2.x.x`.

- [ ] **Step 2: Confirm the current main repo state is clean**

```bash
cd /Users/Scott/Website/scottvandenwarsen-site
git status
git log --oneline -3
```

Expected: clean working tree; most recent commit is the one from Task 4.

- [ ] **Step 3: Run filter-repo to purge old gallery blobs**

This uses SHA-based targeting: collect all gallery blob SHAs currently in HEAD (safe to keep), then identify every other gallery blob from the full history (old versions), and strip exactly those. No size threshold — surgical precision.

```bash
cd /Users/Scott/Website/scottvandenwarsen-site

# Save remote URL since filter-repo removes it as a safety measure
REMOTE_URL=$(git remote get-url origin)
echo "Remote: $REMOTE_URL"

# Collect blob SHAs for the current HEAD gallery images — these are never touched
git ls-tree -r HEAD -- content/gallery/ | awk '{print $3}' > /tmp/current-gallery-blobs.txt
echo "Current HEAD gallery blobs: $(wc -l < /tmp/current-gallery-blobs.txt)"

# Collect ALL gallery blobs from entire history, subtract the current ones
git rev-list --objects --all -- content/gallery/ | \
  git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | \
  awk '/^blob/{print $2}' | \
  grep -vxFf /tmp/current-gallery-blobs.txt > /tmp/old-gallery-blobs.txt
echo "Old gallery blobs to remove: $(wc -l < /tmp/old-gallery-blobs.txt)"

# Strip exactly the old blobs — rewrites full commit history
git filter-repo --strip-blobs-with-ids /tmp/old-gallery-blobs.txt --force
```

Expected: output showing commits rewritten; ends with a summary. May take 1–3 minutes.

- [ ] **Step 4: Verify pack size has shrunk**

```bash
cd /Users/Scott/Website/scottvandenwarsen-site
git count-objects -vH
```

Expected: `size-pack` is dramatically smaller — from ~715 MB down to under 50 MB.

- [ ] **Step 5: Re-add origin remote (filter-repo removes it for safety)**

```bash
cd /Users/Scott/Website/scottvandenwarsen-site
git remote add origin https://github.com/toxroxmysox/scottvandenwarsen-site.git
git remote -v
```

Expected: origin fetch/push URLs shown.

- [ ] **Step 6: Force-push rewritten history to GitHub**

```bash
cd /Users/Scott/Website/scottvandenwarsen-site
git push origin main --force
```

Expected: `main` branch pushed. GitHub will accept the force push since history was rewritten with filter-repo.

- [ ] **Step 7: Verify on GitHub that the push landed**

```bash
gh repo view toxroxmysox/scottvandenwarsen-site --json pushedAt,defaultBranchRef \
  --jq '"pushed: \(.pushedAt) | branch: \(.defaultBranchRef.name)"'
```

Expected: `pushedAt` timestamp matches now.

---

## Task 6: Verify Cloudflare Pages build succeeds

- [ ] **Step 1: Watch the Cloudflare Pages build trigger**

Cloudflare Pages builds automatically on push to `main`. Check the build status:

```bash
# Give it ~30 seconds to register, then check
gh run list --repo toxroxmysox/scottvandenwarsen-site 2>/dev/null || \
  echo "No GH Actions; check Cloudflare Pages dashboard manually at: https://dash.cloudflare.com"
```

- [ ] **Step 2: Confirm site is live and gallery loads**

Open `https://scottvandenwarsen.com/gallery/` in a browser and verify:
- Album cards load
- Clicking an album shows the photo grid (thumbnails are WebP, should load fast)
- Clicking a photo opens PhotoSwipe lightbox at full 2400px quality
- No broken images

- [ ] **Step 3: Final size accounting**

```bash
du -sh /Users/Scott/Website/scottvandenwarsen-site/content/gallery/
du -sh /Users/Scott/Website/scottvandenwarsen-site/.git/
```

Expected: gallery content < 60 MB, `.git/` pack < 50 MB. Total repo on disk should be under 200 MB.

---

## Summary of expected savings

| Component | Before | After |
|-----------|--------|-------|
| Gallery images (content/) | 715 MB | ~50 MB |
| Git pack (.git/) | 715 MB | ~40 MB |
| public/ (ephemeral) | 735 MB | 0 (deleted) |
| Claude worktree | 726 MB | 726 MB (ephemeral, auto-cleaned) |
| **Total** | **~2.8 GB** | **~200 MB** |
