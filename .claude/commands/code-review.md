# /code-review — Comprehensive Code Review

Perform a thorough code review at staff/principal engineer level. Covers quality, simplicity, security, and implementation strategy.

## Scope

Determine what to review:
- If recent changes exist (uncommitted or in the latest few commits), review **those changes**.
- If the user specifies files, a feature, or a PR — review **that scope**.
- If nothing is specified and the tree is clean, ask before reviewing the entire codebase.

## Phase 1: Gather Context

1. Run `git diff` and `git diff --cached` to see uncommitted changes.
2. If clean, run `git log --oneline -5` and `git diff HEAD~1` to review the latest commit.
3. Read every changed file in full — don't review code you haven't read.
4. Identify the **intent** of the changes: bug fix, new feature, refactor, etc.

## Phase 2: Code Quality (Staff/Principal Engineer Review)

Review each changed file. For every issue found, cite the file and line number.

### Correctness
- Does the code do what it claims to do?
- Are there edge cases that aren't handled?
- Are there off-by-one errors, null checks, or type mismatches?
- Would this break existing functionality?

### Readability
- Can a new team member understand this code without extra context?
- Are names (variables, functions, files) clear and descriptive?
- Is the control flow easy to follow?

### Simplicity (the "simplify" check)
- **Could this be simpler?** Flag any over-engineering, premature abstraction, or unnecessary indirection.
- Are there existing utilities or patterns in the codebase that could replace new code?
- Could any multi-step logic be reduced to fewer steps?
- Are there unnecessary wrappers, helpers, or config options for things that only happen once?
- Three similar lines of code > a premature abstraction. Flag abstractions that don't earn their complexity.
- Flag any code that solves hypothetical future requirements instead of the current task.

### Consistency
- Does the code follow the patterns already established in this project?
- Are naming conventions, file structure, and code style consistent with the rest of the codebase?
- Does it use existing design tokens, CSS variables, and template patterns?

## Phase 3: Security Review

Check for common vulnerabilities (OWASP Top 10 and beyond):

- **Injection:** SQL injection, command injection, template injection, XSS (reflected, stored, DOM-based)
- **Authentication/Authorization:** Missing auth checks, privilege escalation, insecure session handling
- **Data Exposure:** Secrets in code (API keys, tokens, passwords), sensitive data in logs or error messages, `.env` files committed
- **Input Validation:** Untrusted input used without sanitization, missing bounds checks, path traversal
- **Dependencies:** Known vulnerable packages, outdated dependencies with CVEs
- **Configuration:** Debug mode left on, permissive CORS, missing security headers
- **Hugo/static-site specific:** Unsafe template functions (`safeHTML`, `safeJS`), user-controlled content rendered without escaping

For each finding, rate severity: **Critical** / **High** / **Medium** / **Low**.

## Phase 4: Implementation Strategy Review

Step back from line-by-line and evaluate the approach as a whole:

- **Is this the right approach?** Would a staff engineer solve this problem the same way?
- **Completeness:** Are there gaps? Missing error states, unhandled breakpoints, accessibility issues?
- **Performance:** Any unnecessary DOM queries, layout thrashing, N+1 patterns, or large file loads?
- **Maintainability:** Will this be easy to change in 6 months? Would a new contributor understand the architecture?
- **Testing:** Is the change verifiable? What's the test plan?
- **Scope creep:** Does this change do more than what was asked? Flag anything that wasn't part of the original task.

## Phase 5: Report

Present findings in this format:

### Summary
One paragraph: what was reviewed, overall assessment (ship it / needs changes / needs rethink).

### Critical Issues (must fix)
Numbered list. Each item: file:line, what's wrong, why it matters, suggested fix.

### Recommendations (should fix)
Numbered list. Same format. Things that aren't blocking but would improve the code.

### Observations (nice to have)
Brief bullets. Minor style or optimization notes.

### What's Good
Call out things done well — good patterns, clean abstractions, solid decisions. Code review isn't just about finding problems.

---

**Principle:** Review like you're mentoring, not gatekeeping. Explain *why* something matters, not just *what* to change.
