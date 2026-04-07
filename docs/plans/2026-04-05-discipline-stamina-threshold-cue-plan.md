# 游步修习资源条临界提示 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let the stamina bar briefly brighten when `游步修习` dodge-cost reduction truly pushes `闪避 Space` back across the ready threshold.

**Architecture:** Keep the existing `游步就绪` dodge-row cue untouched, but add a tighter stamina-threshold predicate on `Player` that compares reduced dodge cost against the base dodge cost. Reuse the shared stamina payoff pulse from `UIScene.updateHUD()` only when the ready edge comes from a stamina-related dodge state or post-roll preview and the reduced cost is what makes dodge affordable.

**Tech Stack:** Phaser 3, plain JavaScript, Node regression script

---

### Task 1: Lock the threshold cue with a failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions for:

- a player helper that proves `游步修习` makes dodge affordable only through reduced stamina cost
- `UIScene.updateHUD()` arming the shared stamina payoff pulse from the dodge ready edge only when that helper returns true
- README / help copy documenting the stamina-bar brighten alongside `游步就绪`

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on missing discipline stamina-threshold hook/docs

### Task 2: Implement the minimal runtime hook

**Files:**
- Modify: `game.js`

**Step 1: Add threshold helper**

Store the logic on `Player` so runtime and regression share one contract: reduced dodge cost must be affordable now, while the base cost would still be blocked.

**Step 2: Arm the bar pulse from the ready edge**

In `UIScene.updateHUD()`, keep the broader `游步就绪` cue gate, but only arm `armStaminaPayoffPulse(1)` when the previous dodge segment still showed a stamina-related/post-roll state and the new helper confirms the discount is what unlocked readiness.

**Step 3: Run regression to verify green**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

### Task 3: Sync docs and audit trail

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`
- Modify: `game.js`

**Step 1: Update player-facing copy**

Extend README and help-overlay discipline text so `游步修习` explicitly says the stamina bar also briefly brightens at the threshold.

**Step 2: Run required verification**

Run exactly:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

**Step 3: Commit**

Use a focused feature commit on `feat/auto-discipline-stamina-threshold-cue`.
