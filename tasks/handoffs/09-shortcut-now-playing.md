## Claude Code Handoff — iOS Shortcut Phase 1: Now Playing Update

**Goal:** iOS Shortcut that reads current now.yaml, shows existing
value as context, accepts new input, formats via Claude API,
commits update to GitHub, triggers Cloudflare rebuild.

**Context:** Phase 1 — proof of concept for full Shortcut
publishing pattern. Validates Shortcut → Claude API → GitHub
API → Cloudflare chain before more complex phases.

---

### RESOLVE BEFORE STARTING

- [ ] Confirm data/now.yaml exists or needs creating (created
  in Now Playing Widget handoff — verify it's done)
- [ ] Author must generate GitHub PAT with `contents: write`
  scope on the site repo
- [ ] Author must locate Cloudflare Pages deploy hook URL
  (Cloudflare dashboard → Pages → project → Settings →
  Builds & deployments → Deploy hooks)
- [ ] Author must have Anthropic API key ready
- [ ] Confirm the exact repo owner and repo name strings

---

### Shortcut Flow

1. **Menu prompt:** "What do you want to update?"
   Options: Reading / Watching / Listening

2. **GET data/now.yaml via GitHub Contents API:**
   ```
   GET https://api.github.com/repos/{owner}/{repo}/contents/data/now.yaml
   Headers: Authorization: Bearer {token}
   ```
   - Response includes `content` (base64) and `sha`
   - Decode base64 content
   - Parse as plain text — extract current value for selected
     field (e.g., grep for `reading: ` line and extract value)
   - Display to user: "Currently Reading: Atomic Habits — James Clear"
   - Store `sha` in variable for PUT step
   - **If GET returns 404:** file doesn't exist. Initialize with
     empty YAML and proceed — set sha to empty/null, use PUT
     to create new file.

3. **Text input:** "What are you [reading] now?"
   - User types freeform text

4. **Claude API call:**
   ```
   POST https://api.anthropic.com/v1/messages
   Headers: x-api-key: {key}, Content-Type: application/json
   Body: { model: "claude-sonnet-4-20250514", max_tokens: 200,
     messages: [{ role: "user", content: "{user input}" }],
     system: "{system prompt below}" }
   ```
   - Extract response text from `content[0].text`

5. **Reconstruct now.yaml as plain text string:**
   ```
   reading: "{reading value}"
   watching: "{watching value}"
   listening: "{listening value}"
   updated: "{YYYY-MM-DD today}"
   ```
   **IMPORTANT:** Reconstruct as plain text concatenation with
   line breaks. Do NOT attempt structured YAML parsing in
   Shortcuts. Four known fields, fixed order, simple
   `key: "value"` lines. Replace only the selected field's
   value; preserve other fields from the GET response.

6. **PUT data/now.yaml via GitHub Contents API:**
   ```
   PUT https://api.github.com/repos/{owner}/{repo}/contents/data/now.yaml
   Headers: Authorization: Bearer {token}
   Body: { message: "Update now playing: {field} via iOS Shortcut",
     content: "{base64 encoded yaml}", sha: "{sha from step 2}" }
   ```

7. **POST Cloudflare deploy hook:**
   ```
   POST {cloudflare_deploy_hook_url}
   ```
   - No body required, just POST to the URL

8. **iOS notification:** "Now [Reading] updated. Site rebuilding."

---

### Claude API System Prompt

```
You are a formatter for a Hugo static site YAML data file.
The user will provide a value for a now.yaml field — it may
be a book title, show name, podcast name, or similar. Return
only the cleaned, properly formatted string with correct
capitalization and punctuation. Author and title should be
separated by an em dash (—) if both are provided. No YAML
keys, no quotes, no explanation. Return the value only.
```

---

### Credentials (stored in Shortcut variables)

- GitHub personal access token — `contents: write` scope
- Anthropic API key
- Cloudflare Pages deploy hook URL
- GitHub owner string
- GitHub repo name string

All stored as text variables at the top of the Shortcut.
Never hardcoded inline in API call actions.

---

### data/now.yaml Starting State

```yaml
reading: ""
watching: ""
listening: ""
updated: ""
```

---

### What Claude Code Builds

1. data/now.yaml — initial empty file if not already created
   by Now Playing Widget handoff
2. docs/shortcuts/now-playing.md — **extremely detailed**
   step-by-step Shortcut construction instructions:
   - Every Shortcuts action listed in order with exact
     configuration
   - Variable names specified
   - API URL strings with placeholder tokens marked
   - Base64 encoding/decoding steps explicit
   - Error handling: what to do if GET 404, if PUT fails,
     if Claude API returns unexpected format
   - Screenshots not possible — compensate with precision
   - Testing checklist at the end
3. Comment in now-widget.html partial explaining YAML schema
4. End of session: Claude Code prints the step-by-step
   instructions to console for easy copying

**Constraints:**

- GitHub token minimum scope: `contents: write` only
- API keys never committed to repo
- SHA must be read fresh on every run — never cached across
  Shortcut executions
- YAML reconstruction is string concatenation, not parsing
