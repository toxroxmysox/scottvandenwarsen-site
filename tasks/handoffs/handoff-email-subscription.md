## Claude Code Handoff — Email Subscription (Buttondown)

**Goal:** Add an email subscription form to the site footer
across all pages, powered by Buttondown, sending from a custom
domain, with weekly digest of new content driven by RSS.

**Context:** Free tier Buttondown, up to 100 subscribers.
Subscribers receive weekly digest of new content (posts,
galleries, trips) automatically via RSS-to-email — no manual
sending required. Custom sending domain via Cloudflare DNS.
Form is minimal, matches existing dark footer aesthetic.
Single subscription tier — content updates only.

---

### RESOLVE BEFORE STARTING

- [ ] Confirm footer partial file path — is it a theme file
  that needs overriding or already in layouts/partials/?
- [ ] Confirm existing footer layout: what elements are present
  (LinkedIn icon, RSS icon, copyright text)? How are they
  arranged on desktop and mobile?
- [ ] Decide form placement in footer: above the icon row as
  its own line, or alongside icons? Recommend: own line above
  icons — an email input next to small icon buttons will look
  awkward on mobile.
- [ ] Confirm RSS feed URL (expected: /index.xml). Verify it
  exists and check which content types it includes. If it only
  includes posts (Hugo default), the RSS template must be
  extended BEFORE Buttondown is configured — otherwise digest
  emails will be incomplete.
- [ ] Author must complete Buttondown account setup and provide
  the form action URL before the form can be tested.
- [ ] Should there be a /subscribe page for direct linking, or
  footer-only? Recommend footer-only to start.

---

### Author Setup Required (outside Claude Code)

These steps must be completed by the author. Claude Code cannot
do them. They can happen before or after the form embed is built,
but must be done before testing.

**1. Create Buttondown account**
- Sign up at buttondown.com (free tier, no credit card)

**2. Configure custom sending domain**
- Buttondown settings → Custom domain
- Buttondown provides SPF, DKIM, and DMARC DNS records
- Add all three records in Cloudflare DNS dashboard
- Wait 24-48 hours for propagation
- Verify in Buttondown settings before sending
- Author picks sending address (newsletter@ or no-reply@
  — no code impact)

**3. Configure RSS-to-email automation**
- Buttondown settings → Automation
- Point to site RSS feed URL
- Set frequency: weekly digest
- Buttondown aggregates new RSS entries since last send
  and formats digest automatically
- No manual sending required after setup

**4. Get form action URL**
- Buttondown settings → Forms
- Copy the form action URL (unique to your account)
- Provide to Claude Code for hugo.toml config

---

### Hugo Implementation

**Config — add to hugo.toml:**

```toml
[params]
  buttondownFormAction = "https://buttondown.com/api/emails/embed-subscribe/YOUR_USERNAME"
```

Form action URL stored as param — not hardcoded in template.

---

**New partial: layouts/partials/subscribe-form.html**

Form layout: single line on desktop (label + email input +
submit button), stacked on mobile (input full width, button
below).

```
[Your email__________________] [Subscribe]
```

- Form method POST, action from `.Site.Params.buttondownFormAction`
- Email input: type="email", required, placeholder "Your email"
- Submit button: "Subscribe"
- No marketing language — minimal, editorial tone

**Submission behavior — use redirect flow (Option A):**

Buttondown's free tier form is a standard HTML POST that
redirects to a Buttondown-hosted page. AJAX submission would
require exposing an API key client-side or hacky iframe tricks.
Neither is worth it for a v1.

- Form POSTs normally to Buttondown
- Buttondown shows its confirmation page
- Configure Buttondown to redirect back to your site after
  confirmation (Buttondown settings → Redirect URL →
  `https://scottvandenwarsen.com/?subscribed=true`)
- Optional: detect `?subscribed=true` query param in Hugo/JS
  and show a brief "You're subscribed" message in the footer.
  Low priority — the redirect-back alone is sufficient.

**No-JS fallback:** This IS the primary flow. Standard form POST
works with zero JavaScript. The optional query param detection
is progressive enhancement only.

**Bot protection:**

Add a honeypot field to reduce spam signups:

```html
<div style="position: absolute; left: -5000px;" aria-hidden="true">
  <input type="text" name="a_]password" tabindex="-1" autocomplete="off">
</div>
```

Hidden field that bots fill in, humans don't see. Buttondown
ignores submissions with this field populated. Use whatever
honeypot field name Buttondown's embed snippet specifies — check
their docs or default embed code.

---

**Inject into footer partial:**

- Locate existing footer partial
- If it's a theme file: copy to layouts/partials/ as override
- Add subscribe-form partial ABOVE existing icon row as its
  own section — not inline with icons
- Maintain spacing consistent with existing footer sections
- On mobile: form stacks (input full width, button below),
  icon row stays as-is beneath

---

### RSS Feed Verification and Extension

**This is likely a required build step, not just a check.**

Hugo's default RSS template typically only includes the site's
main section. If your feed at /index.xml doesn't include
galleries, products, or other content types, Buttondown's
digest will be incomplete.

**Check:** Fetch /index.xml and verify it contains entries from
all content types: feed posts (reading, watching, listening),
galleries, and any other sections you want in the digest.

**If incomplete:** Create a custom RSS template at
`layouts/_default/rss.xml` (or `layouts/index.xml` for the
home feed) that includes all desired content types. Hugo's
default template source is at:
https://github.com/gohugoio/hugo/blob/master/tpl/tplimpl/embedded/templates/_default/rss.xml

Copy it, extend the range to include additional sections.
This is standard Hugo — not a hack.

---

### Files Likely Involved

- layouts/partials/subscribe-form.html — new partial
- layouts/partials/footer.html — inject subscribe partial
  (may need to override theme footer)
- hugo.toml — add buttondownFormAction param
- layouts/_default/rss.xml — custom RSS template if feed
  is incomplete (likely needed)

**Constraints:**

- Do not modify theme files directly — override in layouts/
- Form must work on mobile — input full width on small screens
- Buttondown form action URL from hugo.toml param, not hardcoded
- Primary flow is standard form POST with redirect — no JS
  required
- Honeypot field for basic bot protection
- Partial renders nothing if buttondownFormAction param is
  missing or empty — guard with `{{ with }}`
