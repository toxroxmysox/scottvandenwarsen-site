# iOS Shortcut: Log Trip

Adds a new trip entry to `data/trips.yaml` via GitHub API, then triggers a Cloudflare Pages rebuild. User types country codes directly (no AI API needed).

---

## Prerequisites

Two secrets stored in the Shortcut:

1. **GitHub Personal Access Token (PAT)**
   - GitHub → your avatar → Settings → Developer settings → Personal access tokens → Fine-grained tokens
   - Repository: `toxroxmysox/scottvandenwarsen-site`
   - Permissions: Contents (Read and write)
   - Copy the token — it starts with `github_pat_`

2. **Cloudflare Deploy Hook URL**
   - Cloudflare Dashboard → Pages → your project → Settings → Builds & deployments → Deploy hooks
   - Create a hook named "iOS Shortcut"
   - Copy the URL

---

## Shortcut Construction — Step by Step

### Block 1: User Input

| # | Action | Configuration |
|---|--------|--------------|
| 1 | **Ask for Input** (Text) | Prompt: "Trip name?" |
| 2 | **Ask for Input** (Text) | Prompt: "Country codes? (e.g. ES or ES, MA)" |
| 3 | **Ask for Input** (Date) | Prompt: "Start date?" |
| 4 | **Ask for Input** (Date) | Prompt: "End date?" |
| 5 | **Ask for Input** (Text) | Prompt: "Short description? (or leave blank)" |
| 6 | **Choose from Menu** | Prompt: "Link a gallery?" — Options: "Yes", "No" |
| 7 | *(Yes branch)* **Ask for Input** (Text) | Prompt: "Gallery path? (e.g. /gallery/spain-2025/)" |
| 8 | *(No branch)* **Text** | Leave empty |

### Block 2: Format Dates

| # | Action | Configuration |
|---|--------|--------------|
| 9 | **Format Date** | Input: Start Date result — Format: Custom — String: `yyyy-MM-dd` |
| 10 | **Format Date** | Input: End Date result — Format: Custom — String: `yyyy-MM-dd` |

### Block 3: Fetch Current File from GitHub

Two requests — one for the raw YAML content, one for the SHA (needed for the PUT).

| # | Action | Configuration |
|---|--------|--------------|
| 11 | **Get Contents of URL** | URL: `https://raw.githubusercontent.com/toxroxmysox/scottvandenwarsen-site/main/data/trips.yaml` — Method: GET — No headers needed |
| 12 | **Get Contents of URL** | URL: `https://api.github.com/repos/toxroxmysox/scottvandenwarsen-site/contents/data/trips.yaml` — Method: GET — Headers: `Authorization: Bearer {PAT}`, `Accept: application/vnd.github.v3+json` |
| 13 | **Get Dictionary Value** | Key: `sha` from step 12 result |

**Why two requests?** The GitHub Contents API returns base64-encoded content, but Shortcuts' Decode Base64 action doesn't reliably decode it (known issue with newline-wrapped base64). The `raw.githubusercontent.com` URL returns plain text directly.

### Block 4: Generate Trip ID

| # | Action | Configuration |
|---|--------|--------------|
| 14 | **Text** | Insert the Trip Name variable |
| 15 | **Change Case** | To: lowercase |
| 16 | **Replace Text** | Find: ` ` (space) — Replace: `-` (hyphen) |

This turns "Spain 2025" → "spain-2025".

### Block 5: Build YAML Entry

| # | Action | Configuration |
|---|--------|--------------|
| 17 | **Text** | Build the YAML entry (see template below) |

**YAML template** — insert magic variables where shown:

```yaml
- id: {Replace Text result}
  title: "{Trip Name}"
  description: "{Description}"
  country_codes: [{Country Codes}]
  trip_start: {Formatted Date 1}
  trip_end: {Formatted Date 2}
  gallery: "{Gallery Path}"
```

All fields are always included. Empty description/gallery values produce `description: ""` and `gallery: ""` which Hugo handles fine.

**Important:** Use 2-space indentation (not tabs). YAML is whitespace-sensitive.

### Block 6: Combine and Push to GitHub

| # | Action | Configuration |
|---|--------|--------------|
| 18 | **Text** | Line 1: raw YAML result (step 11) — Line 2: new entry (step 17) |
| 19 | **Encode Base64** | Input: combined text. **Set Line Breaks to None** (expand action to find this option, or add a Replace Text after to strip `\n` via regex) |
| 20 | **Get Contents of URL** | URL: `https://api.github.com/repos/toxroxmysox/scottvandenwarsen-site/contents/data/trips.yaml` — Method: **PUT** — Headers: `Authorization: Bearer {PAT}`, `Accept: application/vnd.github.v3+json` — Request Body: **JSON** with 3 keys (see below) |

**PUT JSON body** (use Shortcuts' built-in JSON body editor, not a Text action):
- `message`: `Add trip: {Trip Name} via iOS Shortcut`
- `content`: the Base64 Encoded result (step 19)
- `sha`: the sha Dictionary Value (step 13)

### Block 7: Trigger Rebuild + Notify

| # | Action | Configuration |
|---|--------|--------------|
| 21 | **Get Contents of URL** | URL: `{CLOUDFLARE_DEPLOY_HOOK_URL}` — Method: POST |
| 22 | **Show Notification** | Title: "Trip Logged" — Body: "{Trip Name} logged. Site rebuilding." |

---

## Testing Checklist

- [x] Single-country trip with gallery — verified append + valid YAML
- [ ] Multi-country trip (e.g. `ES, MA`) — verify array format
- [ ] Trip with no gallery — verify `gallery: ""` doesn't break
- [ ] Trip with no description — verify `description: ""` doesn't break

## Troubleshooting

**"Not Found" on GitHub GET:** PAT doesn't have Contents read permission, or repo name is wrong.

**"Problems parsing JSON" on PUT:** Don't build the JSON body as a Text string — use Shortcuts' JSON body editor (set Request Body to "JSON" and add keys individually). Text-based JSON breaks when the base64 content contains special characters.

**"content is not valid Base64" on PUT:** The Encode Base64 action includes line breaks by default. Either set Line Breaks to None in the action settings, or add a Replace Text after encoding to strip `\n` (regex mode, replace with nothing).

**YAML is invalid after append:** Usually a newline issue between existing content and new entry. The raw GitHub fetch should end with a trailing newline. If not, add a blank line between the two variables in the combine Text action.

---

## Reusable Pattern for Future Shortcuts

This shortcut follows a pattern that works for any "edit a file on GitHub" shortcut:

1. **GET raw content** via `raw.githubusercontent.com/{owner}/{repo}/main/{path}`
2. **GET SHA** via GitHub Contents API (`/repos/{owner}/{repo}/contents/{path}`)
3. **Build new content** (append, replace, or transform)
4. **Encode Base64** (with line breaks stripped)
5. **PUT via Contents API** with `message`, `content` (base64), and `sha`
6. **POST deploy hook** to trigger rebuild

**Key gotchas for future shortcuts:**
- Always use `raw.githubusercontent.com` for reading file content — Shortcuts can't reliably decode the base64 from the Contents API
- Always use the JSON body editor for PUT requests — don't hand-craft JSON as Text
- Always strip line breaks from Base64 Encode output
- The SHA must be fresh — if someone else commits between your GET and PUT, the PUT will fail with a 409 conflict
