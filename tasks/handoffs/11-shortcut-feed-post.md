## Claude Code Handoff — iOS Shortcut Phase 3: Feed Quick Post

**Goal:** iOS Shortcut that creates a complete feed post from
prose written in Obsidian or Notes, with optional external URL,
Claude-generated title and subtitle, manual date with today
prefilled.

**Context:** Phase 3. Author writes prose elsewhere, copies it,
triggers Shortcut. Clipboard used as prose body. Shortcut
triggered from share sheet (with URL) or directly (no URL).
Full post committed to correct section. Phase 1 must be complete.

---

### RESOLVE BEFORE STARTING

- [ ] Phase 1 must be complete and tested
- [ ] Inspect existing feed post frontmatter schema exactly —
  list every field used across reading, watching, listening posts
- [ ] Confirm folder structure for each section:
  - content/reading/[slug]/index.md?
  - content/watching/[slug]/index.md?
  - content/listening/[slug]/index.md?
  - Or flat: content/reading/[slug].md?
- [ ] Confirm: is section determined by folder path or by a
  frontmatter field (e.g., `type` or `categories`)?
- [ ] Does existing frontmatter use `external_url` or a different
  field name for the source link? Confirm exact field name.
- [ ] Does existing frontmatter include `subtitle`? If not, this
  Shortcut introduces it — confirm the single template renders it.

---

### Clipboard Timing — CRITICAL

**On iOS 16+, clipboard access triggers a system permission
dialog.** If the user denies or dismisses it, the Shortcut breaks
silently (empty clipboard).

**Rule: Read clipboard as the VERY FIRST action in the Shortcut.**

Before any menus, prompts, or API calls. Store in a variable
immediately. This ensures:
1. The permission dialog appears at launch, not mid-flow
2. No other Shortcut actions can overwrite the clipboard
3. If clipboard is empty, warn the user before they waste
   time on prompts

---

### Shortcut Flow

1. **Read clipboard immediately** — store in `proseBody` variable
   - Display first 100 characters as confirmation:
     "Clipboard starts with: [preview]..."
   - If empty: show alert "Clipboard is empty. Copy your post
     text first." with options: Continue Anyway / Cancel
   - Continue Anyway proceeds with empty body (edge case —
     maybe they want a link-only post)

2. **Determine URL source:**
   - If triggered from share sheet: URL passed in automatically,
     store in `externalURL` variable
   - If opened directly: "Is there an external URL?" Yes / No
     - If yes: text input for URL, store in `externalURL`
     - If no: `externalURL` = empty

3. **Section prompt:** Reading / Watching / Listening

4. **Date prompt:** "Post date?" prefilled with today YYYY-MM-DD
   - Author can edit for backdating
   - Store as `postDate`

5. **Claude API call:**
   ```
   POST https://api.anthropic.com/v1/messages
   Body: { model: "claude-sonnet-4-20250514", max_tokens: 500,
     messages: [{ role: "user", content: "Section: {section}\nURL: {externalURL or 'none'}\nPost opening: {first 500 chars of proseBody}" }],
     system: "{system prompt below}" }
   ```
   - Parse JSON from response `content[0].text`
   - Extract: title, subtitle, slug

6. **Confirmation prompts (optional — controlled by boolean
   variable at top of Shortcut, default ON):**
   - "Use this title: {title}?" → Yes / Edit
     - If Edit: text input prefilled with generated title
   - "Use this subtitle: {subtitle}?" → Yes / Edit
     - If Edit: text input prefilled with generated subtitle

7. **Construct markdown file as plain text:**
   ```
   ---
   title: "{title}"
   subtitle: "{subtitle}"
   date: {postDate}
   external_url: "{externalURL}"
   draft: false
   ---

   {proseBody}
   ```
   - **If no external URL:** omit the `external_url` line entirely.
     Do not include `external_url: ""` — omit the field.
   - Construct as string concatenation, same pattern as Phase 1.

8. **PUT content/{section}/{slug}/index.md via GitHub API:**
   - Commit message: "New {section} post: {title} via iOS Shortcut"
   - New file: no SHA required

9. **POST Cloudflare deploy hook**

10. **Notification:** "{Title} published to {Section}.
    Site rebuilding."

---

### Claude API System Prompt

```
You are a formatter for a Hugo static site feed. The user will
provide a section (reading, watching, or listening), optional
external URL, and the opening of their post prose. Return only
a JSON object with no markdown formatting, no backticks, no
explanation:

{
  "title": "compelling title, properly capitalized, no trailing punctuation, not clickbait",
  "subtitle": "one sentence under 120 characters describing what the reader gets from the post",
  "slug": "url-friendly lowercase hyphenated max 5 words"
}

If a URL is provided, use the source context to inform the title
but reflect the author's perspective, not just the source title.
```

---

### Frontmatter Schema (must match existing posts)

```yaml
---
title: ""
subtitle: ""
date: YYYY-MM-DD
external_url: ""  # field omitted entirely if no URL
draft: false
---

[prose body from clipboard]
```

---

### What Claude Code Builds

- docs/shortcuts/feed-quick-post.md — detailed construction
  docs covering both trigger methods (share sheet and direct)
- Includes: clipboard timing warning, confirmation toggle
  documentation, both URL paths

**Constraints:**

- Clipboard read MUST be first action — before any prompts
- Empty clipboard must warn clearly — not fail silently
- `draft` always false — drafting workflow uses Obsidian, not
  Shortcuts
- `external_url` field omitted (not empty string) when no URL
- Slug collision: note in docs that collisions are possible
  but not detected. Author should check if unsure.
- No prose validation — whatever is on clipboard goes in
- All credentials reused from Phase 1
