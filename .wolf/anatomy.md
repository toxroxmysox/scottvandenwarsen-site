# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-05-02T16:39:07.589Z
> Files: 321 tracked | Anatomy hits: 0 | Misses: 0

> **2026-06-07 architecture change (theme deletion):** `themes/beautifulhugo/`
> is DELETED. All `themes/beautifulhugo/**` entries below are stale until the
> next daemon scan. The 3 live theme files were vendored into `layouts/`:
> `layouts/partials/seo/` (main, schema, twitter, opengraph, structured/*) and
> `layouts/partials/load-photoswipe-theme.html`. New: `static/js/country-codes.js`
> (shared `window.SVW` lookup tables, dedup'd out of travel.js + mini-map.js).
> Deleted: `layouts/partials/now-playing.html` (dead). See `docs/adr/0001`.

## ./

- `.DS_Store` (~7096 tok)
- `.gitignore` — Git ignore rules (~90 tok)
- `CLAUDE.md` — OpenWolf (~2741 tok)
- `hugo.toml` (~491 tok)
- `README.md` — Project documentation (~13 tok)

## .claude/

- `launch.json` (~72 tok)
- `settings.json` (~518 tok)
- `settings.local.json` (~168 tok)

## .claude/commands/

- `add-gallery.md` — /add-gallery — Add a New Gallery Album (~642 tok)
- `add-shortcut.md` — /add-shortcut — Build a New iOS Shortcut (~1478 tok)
- `add-video.md` — /add-video — Add a YouTube Video to a Gallery Album (~477 tok)
- `code-review.md` — /code-review — Comprehensive Code Review (~1145 tok)
- `deploy.md` — /deploy — Git Pull + Push Workflow (~326 tok)
- `recap.md` — /recap — Session End: Capture Lessons & Summarize (~385 tok)
- `warmup.md` — /warmup — Session Start: Load Context & Clarify Task (~672 tok)

## .claude/rules/

- `openwolf.md` (~313 tok)

## .obsidian/

- `app.json` (~8 tok)
- `appearance.json` (~8 tok)
- `community-plugins.json` (~14 tok)
- `core-plugins.json` (~199 tok)
- `workspace.json` (~2027 tok)

## .obsidian/plugins/obsidian-custom-file-extensions-plugin/

- `main.js` — extends: _copy, settings, useMobile (~4459 tok)
- `manifest.json` (~91 tok)

## .obsidian/themes/Minimal/

- `manifest.json` (~57 tok)
- `theme.css` — Styles: 262 vars, 1 media queries (~70940 tok)

## archetypes/

- `default.md` (~26 tok)

## content/

- `_index.md` (~23 tok)
- `.DS_Store` (~5463 tok)

## content/about/

- `.DS_Store` (~1640 tok)
- `index.md` (~315 tok)

## content/feed/

- `_index.md` (~18 tok)

## content/gallery/

- `_index.md` (~16 tok)
- `.DS_Store` (~4915 tok)

## content/gallery/Chengdu 2024/

- `.DS_Store` (~1640 tok)
- `index.md` (~130 tok)

## content/gallery/Egypt 2023/

- `.DS_Store` (~2732 tok)
- `index.md` (~305 tok)

## content/gallery/French Polynesia 2024/

- `index.md` (~253 tok)

## content/gallery/Paris 2025/

- `.DS_Store` (~1640 tok)
- `index.md` (~127 tok)

## content/gallery/Spain 2025/

- `.DS_Store` (~1640 tok)
- `index.md` (~102 tok)

## content/gallery/Switzerland 2026/

- `index.md` (~136 tok)

## content/listening/

- `_index.md` (~19 tok)
- `.DS_Store` (~1640 tok)

## content/listening/2025-01-08 - AI Slop Inevitability/

- `index.md` (~520 tok)

## content/listening/2026-01-31 - No Easy Fix/

- `index.md` (~191 tok)

## content/listening/2026-03-06 - Bruno Mars/

- `index.md` (~157 tok)

## content/listening/2026-04-14 - Self-Driving Cars/

- `index.md` (~322 tok)

## content/now/

- `.DS_Store` (~1640 tok)
- `index.md` (~25 tok)

## content/reading/

- `_index.md` (~19 tok)

## content/reading/2025-01-03 - Algorithm Bias/

- `index.md` (~390 tok)

## content/reading/2026-03-05 - Claude Code and HA/

- `index.md` (~281 tok)

## content/reading/2026-03-12 - Red Rising/

- `index.md` (~225 tok)

## content/reading/2026-04-14 - Community Disruption/

- `index.md` (~333 tok)

## content/travel/

- `_index.md` (~18 tok)

## content/watching/

- `_index.md` (~19 tok)
- `.DS_Store` (~2186 tok)

## content/watching/2026-02-01 - Newsroom/

- `index.md` (~425 tok)

## content/watching/2026-02-26 - The Pitt/

- `index.md` (~130 tok)

## content/watching/2026-04-14 - Project Hail Mary/

- `index.md` (~174 tok)

## data/

- `country_flags.json` (~800 tok)
- `now.yaml` (~121 tok)
- `trips.yaml` (~431 tok)

## docs/shortcuts/

- `trip-logging.md` — iOS Shortcut: Log Trip (~1693 tok)

## layouts/

- `.DS_Store` (~2186 tok)
- `404.html` (~196 tok)
- `index.galleries.json` (~151 tok)
- `index.html` (~217 tok)
- `index.tripsjson.json` (~226 tok)
- `robots.txt` (~16 tok)

## layouts/_default/

- `list.html` (~113 tok)

## layouts/about/

- `baseof.html` (~172 tok)
- `single.html` (~435 tok)

## layouts/feed/

- `list.html` (~39 tok)
- `single.html` (~829 tok)

## layouts/gallery/

- `list.html` (~39 tok)
- `single.html` (~1126 tok)

## layouts/now/

- `baseof.html` (~171 tok)
- `single.html` (~819 tok)

## layouts/partials/

- `.DS_Store` (~2186 tok)
- `comments.html` — Declares toggleComments (~514 tok)
- `footer_custom.html` — so: getVisibility, update, onScroll, openVideo, closeVideo (~1909 tok)
- `footer.html` (~1198 tok)
- `head_custom.html` (~107 tok)
- `head.html` — {{- if .IsHome -}}
    {{ $siteTitle }}
  {{- else -}}
    {{- $pageTitle := (.Scratch.Get "Title") | default .Title -}}
    {{ $pageTitle }}{{ wit... (~2088 tok)
- `nav.html` (~1318 tok)
- `now-playing.html` (~246 tok)
- `subscribe-form.html` (~175 tok)

## layouts/partials/home/

- `card.html` (~150 tok)
- `feed-columns.html` (~288 tok)
- `gallery-albums.html` (~81 tok)
- `gallery-card.html` (~300 tok)

## layouts/travel/

- `list.html` (~329 tok)

## public/

- `.DS_Store` (~3278 tok)
- `404.html` — 404 Page not found - Scott Vanden Warsen (~3023 tok)
- `galleries.json` (~418 tok)
- `index.html` — Scott Vanden Warsen (~4947 tok)
- `index.xml` (~1938 tok)
- `robots.txt` (~17 tok)
- `site.webmanifest` (~71 tok)
- `sitemap.xml` (~1044 tok)
- `trips.json` (~437 tok)

## public/about/

- `about-me_hu_3552e1535de414a7.webp` (~6170 tok)
- `about-me_hu_480cdc050b3bff45.webp` (~6170 tok)
- `about-me_hu_8454d71316ce471a.webp` (~7127 tok)
- `about-me_hu_ae9137ec5d166fb5.webp` (~6170 tok)
- `index.html` — Scott Vanden Warsen - Scott Vanden Warsen (~3926 tok)

## public/css/

- `codeblock.css` — Styles: 6 rules (~171 tok)
- `fonts.css` — Styles: 14 rules (~3231 tok)
- `hugo-easy-gallery.css` — Styles: 33 rules, 3 media queries (~1056 tok)
- `main-minimal.css` — Styles: 1 rules (~61 tok)
- `main.css` — Styles: 46 rules, 72 vars, 13 media queries (~23722 tok)
- `mermaid.css` — Section styling (~1134 tok)
- `mermaid.dark.css` — Section styling (~1200 tok)
- `staticman.css` — Styles: 14 rules, 1 vars (~425 tok)
- `syntax.css` (~1146 tok)

## public/data/

- `country-coords.json` (~28 tok)
- `us-states-10m.json` (~32730 tok)
- `world-110m.json` (~30789 tok)

## public/feed/

- `index.html` — Feed - Scott Vanden Warsen (~4643 tok)
- `index.xml` (~138 tok)

## public/fontawesome/css/

- `all.css` — Styles: 121 rules, 50 vars, 1 media queries, 7 animations (~31462 tok)
- `brands.css` — Styles: 327 rules, 326 vars (~5852 tok)
- `fontawesome.css` — Styles: 121 rules, 50 vars, 1 media queries, 7 animations (~24778 tok)
- `regular.css` — Styles: 4 rules, 7 vars (~232 tok)
- `solid.css` — Styles: 4 rules, 7 vars (~231 tok)
- `svg-with-js.css` — Styles: 60 rules, 31 vars, 1 media queries (~4436 tok)
- `svg.css` — Styles: 26 rules, 28 vars (~1554 tok)
- `v4-font-face.css` — Styles: 4 rules (~483 tok)
- `v4-shims.css` — Styles: 226 rules, 147 vars (~11004 tok)
- `v5-font-face.css` — Styles: 3 rules (~200 tok)

## public/gallery/

- `index.html` — Gallery - Scott Vanden Warsen (~4560 tok)
- `index.xml` (~721 tok)

## public/gallery/chengdu-2024/

- `index.html` — Pandas in Chengdu - Scott Vanden Warsen (~7660 tok)

## public/gallery/egypt-2023/

- `index.html` — Egypt 2023 - Scott Vanden Warsen (~10096 tok)

## public/gallery/french-polynesia-2024/

- `index.html` — Honeymoon in French Polynesia - Scott Vanden Warsen (~9980 tok)

## public/gallery/paris-2025/

- `index.html` — Anniversary in Paris - Scott Vanden Warsen (~7281 tok)

## public/gallery/spain-2025/

- `index.html` — Spain 2025 - Scott Vanden Warsen (~8500 tok)

## public/gallery/switzerland-2026/

- `index.html` — Switzerland 2026 - Scott Vanden Warsen (~8859 tok)

## public/js/

- `load-photoswipe.js` — Declares work (~660 tok)
- `main.js` — Add copy button to code block (~2163 tok)
- `map.js` — Interactive World Map Gallery (~5584 tok)
- `mermaid.js` — Zustand store (~177426 tok)
- `mini-map.js` — Static Mini-Map for Homepage (~1288 tok)
- `recaptcha.js` (~200 tok)
- `staticman.js` — Static comments (~396 tok)
- `travel.js` — Travel Page — Interactive Map + Timeline + Flight Lines (~10424 tok)

## public/listening/

- `index.html` — Listening - Scott Vanden Warsen (~4648 tok)
- `index.xml` (~529 tok)

## public/listening/2025-01-08---ai-slop-inevitability/

- `index.html` — AI Slop Inevitability - Scott Vanden Warsen (~4906 tok)

## public/listening/2026-01-31---no-easy-fix/

- `index.html` — No Easy Fix - Docu-Podcast on Homelessness and Addiction - Scott Vanden Warsen (~4604 tok)

## public/listening/2026-03-06---bruno-mars/

- `index.html` — The Romantic - Bruno Mars - Scott Vanden Warsen (~4273 tok)

## public/map/

- `index.html` — http://localhost:1313/travel/ (~76 tok)
- `index.xml` (~137 tok)

## public/now/

- `index.html` — Now - Scott Vanden Warsen (~4923 tok)

## public/reading/

- `index.html` — Reading - Scott Vanden Warsen (~4645 tok)
- `index.xml` (~500 tok)

## public/reading/2025-01-03---algorithm-bias/

- `index.html` — Hidden Bias in Algorithms - Scott Vanden Warsen (~4469 tok)

## public/reading/2026-03-05---claude-code-and-ha/

- `index.html` — Claude Code - So Much Potential - Scott Vanden Warsen (~4491 tok)

## public/reading/2026-03-12---red-rising/

- `index.html` — Red Rising Books 1-3 - Scott Vanden Warsen (~4317 tok)

## public/tags/

- `index.html` — Overview of all pages with the tag #Tags - Scott Vanden Warsen (~5059 tok)
- `index.xml` (~580 tok)

## public/tags/ai/

- `index.html` — AI - Scott Vanden Warsen (~3418 tok)
- `index.xml` (~280 tok)

## public/tags/album/

- `index.html` — Album - Scott Vanden Warsen (~3420 tok)
- `index.xml` (~274 tok)

## public/tags/asia/

- `index.html` — Asia - Scott Vanden Warsen (~3413 tok)
- `index.xml` (~254 tok)

## public/tags/book/

- `index.html` — Book - Scott Vanden Warsen (~3416 tok)
- `index.xml` (~266 tok)

## public/tags/oceania/

- `index.html` — Oceania - Scott Vanden Warsen (~3424 tok)
- `index.xml` (~266 tok)

## public/tags/podcast/

- `index.html` — Podcast - Scott Vanden Warsen (~3465 tok)
- `index.xml` (~417 tok)

## public/travel/

- `index.html` — Travel - Scott Vanden Warsen (~3135 tok)
- `index.xml` (~140 tok)

## public/watching/

- `index.html` — Watching - Scott Vanden Warsen (~4647 tok)
- `index.xml` (~388 tok)

## public/watching/2026-02-01---newsroom/

- `index.html` — Newsroom - Where do you get your news? - Scott Vanden Warsen (~4542 tok)

## public/watching/2026-02-26---the-pitt/

- `index.html` — The Pitt - Gripping Medical Drama - Scott Vanden Warsen (~4158 tok)

## resources/_gen/images/about/

- `about-me_hu_3552e1535de414a7.webp` (~6170 tok)
- `about-me_hu_480cdc050b3bff45.webp` (~6170 tok)
- `about-me_hu_8454d71316ce471a.webp` (~7127 tok)
- `about-me_hu_ae9137ec5d166fb5.webp` (~6170 tok)

## shortcuts/

- `add-gallery-video.cherri` — Add Gallery Video — iOS Shortcut (~974 tok)
- `build.sh` — Cherri shortcut build pipeline: compile → patch base64 → binary plist → sign. (~825 tok)
- `Update Now_patched.shortcut` (~3345 tok)
- `Update Now_unsigned.shortcut` (~19753 tok)
- `Update Now.plist` (~19788 tok)
- `update-now_processed.cherri` — Declares of (~3593 tok)
- `update-now.cherri` — Update Now — iOS Shortcut (multi-select, single commit + single build) (~1182 tok)

## static/

- `.DS_Store` (~3278 tok)
- `site.webmanifest` (~71 tok)

## static/css/

- `main.css` — Styles: 46 rules, 72 vars, 13 media queries (~23722 tok)

## static/data/

- `us-states-10m.json` (~32730 tok)
- `world-110m.json` (~30789 tok)

## static/js/

- `mini-map.js` — Static Mini-Map for Homepage (~1288 tok)
- `travel.js` — Travel Page — Interactive Map + Timeline + Flight Lines (~10424 tok)

## tasks/

- `lessons.md` — Lessons Learned (~4658 tok)
- `todo.md` — Current Tasks (~1728 tok)

## tasks/handoffs/

- `01-now-playing-widget.md` — Claude Code Handoff — Now Playing Widget (~764 tok)
- `02-comments-cusdis.md` — Claude Code Handoff — Comments (Cusdis) (~703 tok)
- `03-link-preview.md` — Claude Code Handoff — External Link Preview (Favicon + Popover) (~1023 tok)
- `04-youtube-galleries.md` — Claude Code Handoff — YouTube Videos in Photo Galleries (~897 tok)
- `05-exif-photo-sort.md` — Claude Code Handoff — EXIF Photo Sort + Pre-Commit Hook (~1351 tok)
- `06-product-recommendations.md` — Claude Code Handoff — Product Recommendations Section (~1276 tok)
- `07-site-search-related.md` — Claude Code Handoff — Site Search + Related Content (~1460 tok)
- `08-travel-page.md` — Claude Code Handoff — Travel Page (Map + Timeline + Flight Lines) (~2398 tok)
- `09-shortcut-now-playing.md` — Claude Code Handoff — iOS Shortcut Phase 1: Now Playing Update (~1258 tok)
- `11-shortcut-feed-post.md` — Claude Code Handoff — iOS Shortcut Phase 3: Feed Quick Post (~1434 tok)
- `12-shortcut-trip-logging.md` — Claude Code Handoff — iOS Shortcut Phase 4: Trip Logging (~1715 tok)
- `handoff-email-subscription.md` — Claude Code Handoff — Email Subscription (Buttondown) (~1668 tok)

## themes/beautifulhugo/

- `.gitattributes` — Git attributes (~122 tok)
- `.gitignore` — Git ignore rules (~219 tok)
- `go.mod` — Go module definition (~14 tok)
- `LICENSE` — Project license (~304 tok)
- `netlify.toml` (~56 tok)
- `README.md` — Project documentation (~2273 tok)
- `theme.toml` (~274 tok)

## themes/beautifulhugo/.github/workflows/

- `ci.yml` — Based on the sample workflow for building and deploying a Hugo site to GitHub Pages (~305 tok)
- `hugo.yml` — Based on the sample workflow for building and deploying a Hugo site to GitHub Pages (~569 tok)

## themes/beautifulhugo/archetypes/

- `default.md` (~31 tok)

## themes/beautifulhugo/data/beautifulhugo/

- `social.toml` (~1231 tok)

## themes/beautifulhugo/exampleSite/

- `hugo.toml` (~937 tok)

## themes/beautifulhugo/exampleSite/content/

- `_index.md` — Front Page Content (~49 tok)

## themes/beautifulhugo/exampleSite/content/page/

- `about.md` (~114 tok)

## themes/beautifulhugo/exampleSite/content/post/

- `2015-01-04-first-post.md` (~21 tok)
- `2015-01-15-pirates.md` (~123 tok)
- `2015-01-19-soccer.md` (~329 tok)
- `2015-01-27-dear-diary.md` (~110 tok)
- `2015-02-13-hamlet-monologue.md` (~391 tok)
- `2015-02-20-test-markdown.md` — Here is a secondary heading (~235 tok)
- `2015-02-26-flake-it-till-you-make-it.md` (~658 tok)
- `2016-03-08-code-sample.md` (~346 tok)
- `2017-03-05-math-sample.md` (~326 tok)
- `2017-03-07-bigimg-sample.md` — Declares for (~423 tok)
- `2017-03-20-photoswipe-gallery-sample.md` — Example (~573 tok)

## themes/beautifulhugo/exampleSite/layouts/partials/

- `footer_custom.html` (~99 tok)
- `head_custom.html` (~204 tok)

## themes/beautifulhugo/exampleSite/static/

- `.gitkeep` (~0 tok)

## themes/beautifulhugo/i18n/

- `br.yaml` — Content (~524 tok)
- `de.yaml` — Content (~527 tok)
- `dk.yaml` — Content (~521 tok)
- `en.yaml` — Content (~524 tok)
- `eo.yaml` — Content (~522 tok)
- `es.yaml` — Content (~542 tok)
- `fr.yaml` — Content (~561 tok)
- `hr.yaml` — Content (~540 tok)
- `it.yaml` — Content (~532 tok)
- `ja.yaml` — Content (~473 tok)
- `ko.yaml` — Content (~472 tok)
- `lmo.yaml` — Content (~922 tok)
- `nb.yaml` — Content (~523 tok)
- `nl.yaml` — Content (~528 tok)
- `pl.yaml` — Content (~522 tok)
- `ru.yaml` — Content (~531 tok)
- `tr.yaml` — Content (~548 tok)
- `zh-CN.yaml` — Content (~464 tok)
- `zh-TW.yaml` — Content (~466 tok)

## themes/beautifulhugo/layouts/

- `404.html` (~182 tok)
- `index.html` (~306 tok)

## themes/beautifulhugo/layouts/_default/

- `baseof.html` (~127 tok)
- `list.html` (~283 tok)
- `single.html` (~1088 tok)
- `terms.html` (~479 tok)

## themes/beautifulhugo/layouts/partials/

- `disqus-wrapper.html` (~73 tok)
- `footer_custom.html` (~68 tok)
- `footer.html` (~1989 tok)
- `head_custom.html` (~67 tok)
- `head.html` — {{ . }} (~1964 tok)
- `header.html` (~952 tok)
- `load-photoswipe-theme.html` — Declares pswp (~594 tok)
- `nav.html` (~1015 tok)
- `page_meta.html` (~82 tok)
- `post_meta.html` (~550 tok)
- `post_preview.html` (~377 tok)
- `share-links.html` (~450 tok)
- `staticman-comments.html` (~822 tok)
- `translation_link.html` (~27 tok)

## themes/beautifulhugo/layouts/partials/seo/

- `main.html` (~25 tok)
- `opengraph.html` (~174 tok)
- `schema.html` (~54 tok)
- `twitter.html` (~169 tok)

## themes/beautifulhugo/layouts/partials/seo/structured/

- `article.html` (~288 tok)
- `breadcrumb.html` (~123 tok)
- `organization.html` (~134 tok)
- `post.html` (~456 tok)
- `website.html` (~69 tok)

## themes/beautifulhugo/layouts/shortcodes/

- `column.html` (~7 tok)
- `columns.html` (~11 tok)
- `details.html` (~25 tok)
- `endcolumns.html` (~12 tok)
- `figure.html` (~500 tok)
- `gallery.html` (~739 tok)
- `mermaid.html` (~84 tok)

## themes/beautifulhugo/static/css/

- `codeblock.css` — Styles: 6 rules (~171 tok)
- `fonts.css` — Styles: 14 rules (~3231 tok)
- `hugo-easy-gallery.css` — Styles: 33 rules, 3 media queries (~1056 tok)
- `main-minimal.css` — Styles: 1 rules (~61 tok)
- `main.css` — Styles: 97 rules, 23 media queries (~5551 tok)
- `mermaid.css` — Section styling (~1134 tok)
- `mermaid.dark.css` — Section styling (~1200 tok)
- `staticman.css` — Styles: 14 rules, 1 vars (~425 tok)
- `syntax.css` (~1146 tok)

## themes/beautifulhugo/static/fontawesome/css/

- `all.css` — Styles: 121 rules, 50 vars, 1 media queries, 7 animations (~31462 tok)
- `brands.css` — Styles: 327 rules, 326 vars (~5852 tok)
- `fontawesome.css` — Styles: 121 rules, 50 vars, 1 media queries, 7 animations (~24778 tok)
- `regular.css` — Styles: 4 rules, 7 vars (~232 tok)
- `solid.css` — Styles: 4 rules, 7 vars (~231 tok)
- `svg-with-js.css` — Styles: 60 rules, 31 vars, 1 media queries (~4436 tok)
- `svg.css` — Styles: 26 rules, 28 vars (~1554 tok)
- `v4-font-face.css` — Styles: 4 rules (~483 tok)
- `v4-shims.css` — Styles: 226 rules, 147 vars (~11004 tok)
- `v5-font-face.css` — Styles: 3 rules (~200 tok)

## themes/beautifulhugo/static/js/

- `load-photoswipe.js` — Declares work (~660 tok)
- `main.js` — Add copy button to code block (~2163 tok)
- `mermaid.js` — Zustand store (~177426 tok)
- `recaptcha.js` (~200 tok)
- `staticman.js` — Static comments (~396 tok)
