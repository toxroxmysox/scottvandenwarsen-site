# /warmup — Session Start: Load Context & Clarify Task

Load all accumulated knowledge, then help the user sharpen their request into a specific, actionable task before any code is written.

## Phase 1: Load Context

1. **Read lessons learned** (highest priority)
   Read `tasks/lessons.md` in the current working directory. Summarize key rules grouped by category.

2. **Read project memory**
   Check for memory files in the Claude project memory directory. Look for:
   - `~/.claude/projects/*/memory/MEMORY.md` (any project memory matching this repo)
   Use a subagent to scan for all matching memory files and return their contents.

3. **Read task history**
   Read `tasks/todo.md` to understand what was recently worked on and what's pending.

4. **Check git state**
   Run:
   ```sh
   git log --oneline -10
   git status
   git branch -a
   ```
   Report: current branch, recent commits, any uncommitted changes.

5. **Check for open PRs**
   ```sh
   gh pr list --state open
   ```

6. **Summarize findings**
   Present a concise briefing:
   - **Top rules to remember** (from lessons.md) — the ones most likely to trip you up
   - **Recent context** — what was last worked on, any pending tasks
   - **Git state** — branch, uncommitted work, open PRs
   - **Key patterns** — design tokens, URL rules, content access rules

## Phase 2: Clarify Task

7. **Ask what we're working on today.**

8. **When the user responds, refine their request before starting work:**
   - **Restate** the request in specific, concrete terms
   - **Identify ambiguities** — ask 2-4 targeted questions with concrete options:
     - Scope: which pages/components?
     - Behavior: what should happen on interaction?
     - Design: colors, spacing, typography preferences?
     - Breakpoints: desktop only, or mobile/tablet too?
   - **Propose the minimal version** — smallest change that satisfies the intent
   - **Confirm the refined spec** before writing any code

9. **If the request is already clear and specific**, skip the refinement questions and proceed directly. Don't over-clarify obvious tasks.
