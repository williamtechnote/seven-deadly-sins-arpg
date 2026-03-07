# Event Room Healing Prefix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Finish the remaining healing-room HUD prefix work and sync its documentation and regression coverage.

**Architecture:** Reuse the existing shared resolved-prefix helper in `shared/game-core.js` so both browser HUD rendering and Node regression checks read the same derived strings. Keep unknown room types on the generic fallback.

**Tech Stack:** Plain JavaScript, Phaser 3 HUD rendering, Node CLI regression checks

---

### Task 1: Reprioritize the remaining heartbeat work

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-07-event-room-healing-prefix-design.md`
- Create: `docs/plans/2026-03-07-event-room-healing-prefix-plan.md`

**Step 1: Replace the single active TODO with three concrete ordered items**

**Step 2: Put the healing prefix behavior and doc/test sync first**

**Step 3: Leave the generic fallback note as the third active item for auditability**

### Task 2: Write the failing regression first

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Change resolved healing summary expectations from `已选:` to `治疗:`**

**Step 2: Add/adjust resolved healing HUD line expectations to use the merged healing prefix line**

**Step 3: Run `node scripts/regression-checks.mjs` and confirm the new expectation fails before implementation**

### Task 3: Implement the shared prefix mapping

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Extend the resolved-prefix helper with a `healing -> 治疗` mapping**

**Step 2: Keep all other existing mappings unchanged**

**Step 3: Preserve the generic fallback for unknown room types**

### Task 4: Sync docs, verify, and publish

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Document the healing prefix alongside the existing event-room HUD prefix behavior**

**Step 2: Mark the first two active TODO items complete and leave the fallback audit item active**

**Step 3: Run `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`**

**Step 4: Commit, create/keep `feat/auto-event-room-healing-prefix` via remote fallback if local branch creation stays blocked, merge to `main`, push `main`, and append the audit line**
