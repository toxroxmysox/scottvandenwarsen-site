# /recap — Session End: Capture Lessons & Summarize

Wrap up a work session by capturing what was learned and updating persistent memory. Prevents knowledge loss between sessions.

## Steps

1. **Review what was done this session**
   Scan the conversation for:
   - Tasks completed
   - Bugs encountered and how they were fixed
   - User corrections or preference signals
   - Patterns discovered
   - Mistakes made (even small ones)

2. **Update lessons.md**
   Read `tasks/lessons.md`. Append any new rules learned this session. Follow the existing format:
   - Group by category (CSS, Hugo, Git, JS, etc.)
   - Write rules as imperative statements ("Always X", "Never Y", "When X happens, do Y")
   - Include the *why* — what went wrong that prompted the rule

3. **Update project memory**
   Read the current MEMORY.md in the Claude project memory directory. Update it with:
   - New stable patterns confirmed during this session
   - Key file paths or architectural decisions
   - User preferences observed
   - Do NOT add session-specific temporary details

4. **Update tasks/todo.md**
   Mark completed items. Add any follow-up tasks discovered but not addressed.

5. **Summarize for the user**
   ```
   ## Session Recap

   ### Completed
   - [What was built/fixed]

   ### Lessons Captured
   - [New rules added to lessons.md]

   ### Open Items
   - [Anything left for next session]

   ### Memory Updated
   - [What was added to project memory]
   ```

6. **Ask the user** if there's anything else to capture before ending.
