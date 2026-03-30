# Telegraph Tail Shadow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a dimmed telegraph tail after an early-closing frame-one counter window so the remaining cast bar no longer reads as still counterable.

**Architecture:** Keep the behavior driven by `shared/game-core.js` so the CLI regression contract and browser HUD use the same ratios. Render the new tail segment as a dedicated graphics layer in `game.js`, then mirror the user-facing explanation in `README.md` and the help overlay.

**Tech Stack:** JavaScript, Phaser 3, Node.js regression checks

---

### Task 1: Lock the new HUD contract

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Assert that an early-closing frame-one counter window exposes:
- `counterWindowTailAfterglowVisible`
- `counterWindowTailAfterglowStartRatio`
- `counterWindowTailAfterglowWidthRatio`

Also assert that the Boss HUD source clears and renders a dedicated `bossTelegraphTailAfterglow` layer.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the missing tail-afterglow summary/render contract.

### Task 2: Implement the shared summary and HUD layer

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write minimal implementation**

- In `buildBossTelegraphHudSummary`, derive the early-closure tail-afterglow ratios from `counterWindowEndMs`.
- In `BossScene`, add `bossTelegraphTailAfterglow`, clear it each frame, and draw a darker overlay from the closure point to the bar end.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS.

### Task 3: Update player-facing docs

**Files:**
- Modify: `README.md`
- Modify: `game.js`
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-30-telegraph-tail-shadow-design.md`

**Step 1: Document the behavior**

- Mention the new `尾段残影` in the README combat HUD description and Boss HUD feature summary.
- Mirror the same explanation in the help overlay text.
- Move the implemented TODO item to `Completed` and seed the next related active item.

**Step 2: Final verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS.
