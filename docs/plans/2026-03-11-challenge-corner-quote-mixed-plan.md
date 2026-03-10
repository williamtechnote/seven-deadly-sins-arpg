# Challenge Corner-Quote Mixed Decorators Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Explicitly support nested square+corner-quote and nested square+half-width corner-quote challenge decorators across regression checks, README/help text, and TODO bookkeeping while reusing the existing recursive label stripper.

**Architecture:** Keep runtime behavior centralized in `shared/game-core.js` and treat the work as a contract-first red/green cycle. New regression cases should prove the two promoted wrapper families first; if the helper already passes them, implementation stays focused on syncing grouped docs and backlog state instead of changing parsing logic unnecessarily.

**Tech Stack:** Plain JavaScript, Phaser 3 UI copy, Node-based regression checks

---

### Task 1: Reprioritize the wrapper backlog

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-11-challenge-corner-quote-mixed-design.md`
- Create: `docs/plans/2026-03-11-challenge-corner-quote-mixed-plan.md`

**Step 1: Record the next three mixed-wrapper candidates**

- Keep `nested square/corner-quote mixed decorator wrappers` first.
- Promote `nested square/half-width corner-quote mixed decorator wrappers` as the second active item.
- Leave `nested square/presentation-form mixed decorator wrappers` queued as the next follow-up.

### Task 2: Add failing regression coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions for:
- `【『挑战』】击败 30 个敌人` -> `击败 30 个敌人`
- `『［本局挑战］』挑战：本局` -> `未知挑战`
- `【｢挑战｣】击败 30 个敌人` -> `击败 30 个敌人`
- `｢［本局挑战］｣挑战：本局` -> `未知挑战`
- regular/compact sidebar summaries reusing the same cleanup path
- README/help overlay text explicitly mentioning both nested wrapper families

**Step 2: Run test to verify it fails**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: syntax checks pass, regression checks fail on the new nested corner-quote contract assertions while docs are still missing the new examples.

### Task 3: Implement the minimal fix

**Files:**
- Modify: `README.md`
- Modify: `game.js`
- Modify: `shared/game-core.js` (only if the new assertions reveal a runtime gap)

**Step 1: Write minimal implementation**

- If the shared helper already strips both nested wrapper families, keep runtime code unchanged and only sync the grouped wrapper documentation strings.
- If any new runtime assertion fails, extend the decorator logic minimally in `shared/game-core.js` rather than adding special handling in multiple UI call sites.

**Step 2: Run test to verify it passes**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: helper, README assertions, and help-overlay assertions all pass for the two promoted nested wrapper families.

### Task 4: Close the cycle

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Mark completed backlog items**

- Mark the first two active TODO items complete with the current timestamp.
- Leave the presentation-form mixed wrapper item active.

**Step 2: Delivery bookkeeping**

- Attempt `git switch -c feat/auto-challenge-corner-quote-mixed`.
- If local branch creation is blocked by git lock permissions, keep working on the current branch, push `HEAD` to `origin/feat/auto-challenge-corner-quote-mixed`, and record the blocker in `PROGRESS.log`.
- After verification, commit changes, attempt merge/push to `main`, and append the mandatory audit line with exact test, merge, push, and blocker status.
