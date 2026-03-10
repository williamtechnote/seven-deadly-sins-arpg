# Challenge Square Mixed Decorators Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend the explicit challenge-label cleanup contract so square/full-width-square and square/ASCII-square nested wrappers are verified, documented, and reflected in the active TODO queue.

**Architecture:** Keep label cleanup centralized in `shared/game-core.js` and use `scripts/regression-checks.mjs` as the red-green driver. Because the helper already strips nested decorator pairs recursively, expected production changes are limited to docs/help copy unless the new regression cases expose a parser gap.

**Tech Stack:** Plain JavaScript, Phaser 3 UI copy, Node-based regression checks

---

### Task 1: Prioritize the square-wrapper queue

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-11-challenge-square-mixed-design.md`
- Create: `docs/plans/2026-03-11-challenge-square-mixed-plan.md`

**Step 1: Update the active list**

- Keep the existing `nested square/full-width square` item first.
- Promote `nested square/ASCII square` as the second active item.
- Queue `nested full-width square/ASCII square` as the next follow-up.

### Task 2: Write the failing regression/doc assertions

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions for:
- `【［挑战］】击败 30 个敌人` -> `击败 30 个敌人`
- `［【本局挑战】］挑战：本局` -> `未知挑战`
- `【[挑战]】击败 30 个敌人` -> `击败 30 个敌人`
- `[【本局挑战】]挑战：本局` -> `未知挑战`
- README/help overlay text explicitly mentioning both nested square-wrapper combinations

**Step 2: Run test to verify it fails**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: syntax checks pass, regression checks fail on the new square mixed-wrapper assertions

### Task 3: Implement the minimal passing change

**Files:**
- Modify: `README.md`
- Modify: `game.js`
- Modify: `shared/game-core.js` (only if red state exposes a real parsing gap)

**Step 1: Write minimal implementation**

- Sync the README/help overlay grouped decorator text with the new examples.
- If needed, patch the shared helper minimally rather than adding a new parsing path.

**Step 2: Run test to verify it passes**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: the new square mixed-wrapper cases and the updated docs/help assertions all pass

### Task 4: Close the heartbeat cycle

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Finalize bookkeeping**

- Mark the first two active TODO items complete with timestamps.
- Leave the third queued square-wrapper item active.
- Run the required verification command, then commit and attempt the requested branch/merge/push flow.
- If git ref/index locks still block local branch creation or local `main` checkout, use the documented remote-push fallback and record it explicitly in `PROGRESS.log`.
