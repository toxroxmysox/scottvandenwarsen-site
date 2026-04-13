## Claude Code Handoff — Comments (Cusdis)

**Goal:** Add no-login comments to feed posts and photo gallery
pages via Cusdis.

**Context:** Chosen for minimal commenter friction — name optional,
no account required, comment goes live immediately. Moderation via
Cusdis dashboard with email notification to site owner on new
comments.

---

### RESOLVE BEFORE STARTING

- [ ] **Verify Cusdis is still operational.** Last meaningful
  update was 2022-2023. Go to cusdis.com, confirm signup works,
  confirm embed script loads. If service is down or abandoned,
  alternatives to evaluate:
  - Giscus (GitHub Discussions — requires GitHub login, conflicts
    with no-login requirement)
  - Isso (self-hosted, requires server — conflicts with static
    site model unless hosted separately)
  - Remark42 (self-hosted, same server concern)
  - If all alternatives conflict, defer this feature.
- [ ] Author must create Cusdis account and provide App ID
  before implementation begins
- [ ] Confirm whether galleries use a distinct single template
  or inherit _default/single.html
- [ ] Check existing partial injection patterns for consistency
- [ ] Decide: should comments appear on product recommendation
  pages too, or only feed posts and galleries?

---

### Scope

- Add Cusdis embed partial to Hugo
- Inject partial into feed post single template and gallery
  single template
- App ID stored as Hugo site param in config

---

### Implementation

- Cusdis provides a standard JS embed snippet with data
  attributes for page URL, title, and App ID
- Hugo populates data attributes dynamically per page:
  - `data-host`: cusdis.com (or self-hosted URL)
  - `data-app-id`: from site config
  - `data-page-id`: `.RelPermalink`
  - `data-page-url`: `.Permalink`
  - `data-page-title`: `.Title`
- Embed appears below post/gallery content, above footer
- Cusdis script loaded async — `<script async ...>`
- Email notifications configured in Cusdis dashboard after
  account creation, no code required
- Wrap embed in a "Comments" section heading for clarity

---

### Files Likely Involved

- layouts/partials/comments.html — new partial
- layouts/_default/single.html — inject comments partial
- layouts/galleries/single.html — inject if separate template
  (confirm in RESOLVE section above)
- hugo.toml — add Cusdis App ID as site param:
  ```toml
  [params]
    cusdisAppId = "your-app-id-here"
  ```

**Constraints:**

- Do not modify theme files directly
- App ID must not be hardcoded in partial — read from
  `.Site.Params.cusdisAppId`
- Cusdis script must be loaded async
- Partial must render nothing if App ID is not configured
- No GDPR consent banner in scope — but note that Cusdis
  loads third-party JS. If privacy becomes a concern later,
  the partial can be wrapped in a click-to-load pattern.
