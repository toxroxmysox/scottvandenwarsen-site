# /add-shortcut — Build a New iOS Shortcut

Author a new iOS Shortcut using Cherri (compile → patch → sign). Embodies the lessons from update-now and add-gallery-video.

Usage: `/add-shortcut`

## Steps

1. **Ask what the shortcut should do.**
   Don't dive into syntax — first establish:
   - What user inputs are needed? (text prompt? photo? share-sheet input? multi-select list?)
   - What is the shortcut writing to? (specific file in the repo? new file? frontmatter modification?)
   - Does it need to trigger a Cloudflare rebuild?
   - One-shot per run, or should it batch multiple updates into one commit?

   **Surface the structural question explicitly:** "If the natural design grows complex (state tracking, multiple branches), would running the shortcut multiple times be simpler than batching?" The user has feedback memory `feedback_step_back_structure.md` — honor it.

2. **Read existing reference shortcuts before writing anything.**
   - `shortcuts/update-now.cherri` — multi-select chooseFromList, regex-replace YAML, single commit
   - `shortcuts/add-gallery-video.cherri` — share-sheet input, list-from-API, frontmatter modification
   - Memory: `cherri_workflow.md` — full gotcha table

3. **Pick a name and create `shortcuts/<name>.cherri`.**
   Required headers:
   ```cherri
   #include 'actions/web'
   #include 'actions/text'
   #include 'actions/scripting'
   #include 'actions/crypto'
   // Add 'actions/photos' or 'actions/calendar' only if needed

   #define name <Display Name>
   #define color <blue|red|green|orange|purple|...>
   ```

   Hardcode credentials inline (file is gitignored):
   ```cherri
   @ghToken = "github_pat_..."
   @deployHookURL = "https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/..."
   ```

4. **Write the cherri body.** Follow these patterns:

   **GitHub read + write pattern:**
   ```cherri
   // Fetch via raw URL — Shortcuts can't decode API base64 reliably
   const rawContent = downloadURL("https://raw.githubusercontent.com/{owner}/{repo}/main/{path}")
   @working = "{rawContent}"

   // ... modify @working ...

   // Fetch SHA via API — getValue NOT ['sha']
   const fileInfo = downloadURL("https://api.github.com/repos/{owner}/{repo}/contents/{path}", {"Authorization": "Bearer {ghToken}", "Accept": "application/vnd.github.v3+json"})
   @fileSHA = getValue(fileInfo, "sha")

   const encoded = base64Encode(working)
   const result = jsonRequest("https://api.github.com/repos/{owner}/{repo}/contents/{path}", "PUT", {"message": "...", "content": "{encoded}", "sha": "{fileSHA}"}, {"Authorization": "Bearer {ghToken}", "Accept": "application/vnd.github.v3+json"})

   const deploy = jsonRequest(deployHookURL, "POST")
   showNotification("Done.", "Shortcut Name")
   ```

   **Regex replace pattern (YAML, frontmatter, etc.):**
   ```cherri
   @findPattern = "{key}:[\\s\\S]*?value: \"[^\"]*\"[\\s\\S]*?updated: \\S+"
   @replacement = "{key}:\n  value: \"{newValue}\"\n  updated: {today}"
   @working = replaceText(findPattern, replacement, working, true, true)
   ```

   Use `[\\s\\S]*?` to span newlines without putting literal `\n` in the pattern (iOS Shortcuts mishandles literal newlines in regex).

   **Multi-select pattern:**
   ```cherri
   @options: array
   @options += "alpha"
   @options += "beta"
   @selected = chooseFromList(options, "Pick:", true)
   for x in selected { ... }
   ```

5. **Compile + patch + sign with the build script:**
   ```sh
   cd shortcuts && ./build.sh <name>
   ```

   The script handles everything: cherri compile → WFBase64LineBreakMode patch → binary plist → sign with `--mode people-who-know-me`. Output is `<Display Name>.shortcut` (~33KB AEA bundle).

6. **Test on the user's iPhone.**
   AirDrop the `.shortcut` file. They install + run.

   **If the run reports success but no GitHub commit lands** (the silent-failure mode), add debug `quicklook(value)` calls and rebuild:
   - `quicklook(working)` after regex replace → did pattern match?
   - `quicklook(fileInfo)` after API GET → raw response shape
   - `quicklook(fileSHA)` after extraction → 40-char hex if good, empty if extraction broke
   - `quicklook(putResult)` after PUT → `"commit"` on success, `"message"` on error

   Strip the `quicklook` calls and rebuild once it works.

7. **Update todo + memory if you discover a new gotcha.**
   Add it to `cherri_workflow.md` so the next session benefits.

## Critical Gotchas (Don't Forget)

- **`getValue(const, "key")` not `const['key']`** — the bracket syntax compiles to property aggrandizement which doesn't auto-parse JSON. SHA comes back empty → 409 Conflict from GitHub. Use `getValue(...)` for `const`-bound dictionaries; `['key']` only for `@`-bound dicts.
- **Single-line regex** — pattern containing literal `\n` won't match in iOS Shortcuts. Use `[\\s\\S]*?` and `\\S+`.
- **`\\d{4}` panics cherri** — `{4}` is parsed as variable interpolation. Use `\\d+` or `\\d\\d\\d\\d`.
- **No nested action calls as params** — `formatDate(currentDate(), ...)` panics. Extract: `const now = currentDate(); formatDate(now, ...)`.
- **`stop()` not `exitShortcut()`** — early termination.
- **`quicklook(value)` not `showResult(value)`** — debug display.
- **`#question` doesn't run on file install** — hardcode credentials inline.
- **`shortcuts sign --mode anyone` fails network DNS** — use `--mode people-who-know-me`.

## Notes

- All `.cherri` files contain credentials and are gitignored. The compiled `.shortcut` and intermediate `.plist`/`_unsigned.shortcut`/`_patched.shortcut` files are also gitignored.
- HTTP errors in `Get Contents of URL` / `JSON Request` are SILENT. The shortcut continues even on 4xx/5xx. Always add `quicklook` debugging when something seems to "succeed" but produces no result.
- The user prefers walkthrough over heavy docs (`feedback_no_workflow_docs.md`). Guide interactively step-by-step rather than dumping a long plan upfront.
