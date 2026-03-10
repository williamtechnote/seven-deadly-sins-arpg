# Challenge Ornamental/Bracket Mixed Decorators Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Explicitly support nested square + ornamental low double-prime and nested square + white tortoise-shell bracket challenge decorators across regression checks, README/help text, and TODO bookkeeping, while leaving nested square + white square brackets queued as the next active follow-up.

**Architecture:** Keep runtime behavior centralized in `shared/game-core.js` and treat the cycle as contract-first TDD. Add failing regression/doc assertions for the first two active TODO items, then make the minimal code/doc changes needed to satisfy them. Runtime code should change only if the shared decorator helper fails the new nested-wrapper cases.

**Tech Stack:** Plain JavaScript, Phaser 3 UI copy, Node-based regression checks

---

### Task 1: Prioritize the mixed-wrapper backlog

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-11-challenge-ornamental-bracket-mixed-design.md`
- Create: `docs/plans/2026-03-11-challenge-ornamental-bracket-mixed-plan.md`

**Step 1: Record the next three mixed-wrapper candidates**

- Keep `nested square/ornamental low double-prime mixed decorator wrappers` first.
- Promote `nested square/white tortoise-shell bracket mixed decorator wrappers` as the second active item.
- Leave `nested square/white square bracket mixed decorator wrappers` queued as the next follow-up.

### Task 2: Add the failing regression coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions for:
- `【〝挑战〟】击败 30 个敌人` -> `击败 30 个敌人`
- `〝［本局挑战］〟挑战：本局` -> `未知挑战`
- `【〘挑战〙】击败 30 个敌人` -> `击败 30 个敌人`
- `〘［本局挑战］〙挑战：本局` -> `未知挑战`
- regular/compact challenge summaries reusing the same cleanup path
- README/help-overlay text explicitly mentioning both nested wrapper families

**Step 2: Run test to verify it fails**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: syntax checks pass, regression checks fail on the new nested-wrapper/doc assertions while the docs still lack the promoted examples.

### Task 3: Implement the minimal fix

**Files:**
- Modify: `README.md`
- Modify: `game.js`
- Modify: `shared/game-core.js` (only if the new assertions reveal a runtime gap)

**Step 1: Write minimal implementation**

- If the shared helper already passes the new runtime assertions, leave `shared/game-core.js` unchanged.
- Sync README/help-overlay grouped wrapper documentation so both promoted nested families are documented explicitly.

**Step 2: Run test to verify it passes**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: runtime assertions and README/help-overlay contract assertions all pass for the two promoted mixed wrapper families.

### Task 4: Close the cycle

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Mark completed backlog items**

- Mark the first two active TODO items complete with the current timestamp.
- Leave the white square mixed wrapper item active.

**Step 2: Delivery bookkeeping**

- Attempt `git switch -c feat/auto-challenge-ornamental-bracket-mixed`.
- If local branch creation is blocked by git ref-lock permissions, keep working on the current branch, push `HEAD` to `origin/feat/auto-challenge-ornamental-bracket-mixed`, and record the blocker in `PROGRESS.log`.
- After verification, commit changes, attempt merge/push to `main`, and append the mandatory audit line with exact tests, merge, push, and blocker status.
