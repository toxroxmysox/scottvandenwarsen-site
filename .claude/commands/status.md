# /status — Quick Project Health Check

Get a fast snapshot of the project's current state. Useful mid-session or when resuming work.

## Steps

1. **Git state** (run in parallel):
   ```sh
   git branch --show-current
   git status --short
   git log --oneline -5
   git stash list
   ```

2. **Check for running servers**
   Use `preview_list` to see if a dev server is already running.

3. **Check remote sync**
   ```sh
   git fetch origin --dry-run 2>&1
   git log --oneline HEAD..origin/main 2>/dev/null   # remote commits not in local
   git log --oneline origin/main..HEAD 2>/dev/null   # local commits not pushed
   ```

4. **Open PRs**
   ```sh
   gh pr list --state open --limit 5
   ```

5. **Report** — concise summary:
   ```
   Branch:     claude/vibrant-varahamihira
   Uncommitted: 2 files modified
   Ahead/Behind: 3 ahead, 0 behind origin/main
   Server:     hugo-dev running on :1313
   Open PRs:   #5 "Add dark mode toggle"
   Stashes:    1 stash (WIP on main: abc1234)
   ```
