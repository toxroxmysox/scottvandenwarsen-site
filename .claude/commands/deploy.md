# /deploy — Git Pull + Push Workflow

Sync local branch with origin and push. Handles the common case where branches have diverged.

## Steps

1. **Check current state**
   ```sh
   git status
   git log --oneline -5
   git fetch origin
   git log --oneline HEAD..origin/main   # commits on remote not in local
   git log --oneline origin/main..HEAD   # commits local but not on remote
   ```

2. **Stash unstaged changes** (e.g. .obsidian/workspace.json)
   ```sh
   git stash
   ```

3. **Rebase onto remote**
   ```sh
   git pull --rebase origin main
   ```

4. **If conflicts appear:**
   - Resolve each file (keep CSS variables over hardcoded values; keep our new features)
   - `git add <resolved-file>` for each
   - `git rebase --continue`

5. **Restore unstaged changes**
   ```sh
   git stash pop
   ```

6. **Push**
   ```sh
   git push origin main
   ```

7. **Confirm**
   Report: commit SHA pushed, Cloudflare Pages will auto-deploy from this push.

## Conflict resolution guidelines

- `hugo.toml`: keep ALL sections from both sides (remote params + our output formats)
- `layouts/index.html`: keep our layout additions (mini-map, etc.), pick up remote class renames
- `static/css/main.css`: keep CSS `var(--token)` versions over hardcoded hex values; our new CSS sections go at the end
