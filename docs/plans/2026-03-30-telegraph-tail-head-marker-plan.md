# Telegraph Tail Head Marker Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a thin warm progress-head marker during the telegraph tail-afterglow phase so the remaining countdown stays legible after the main fill has been dimmed.

**Architecture:** Keep the behavior centered in `shared/game-core.js` so the HUD decision stays testable in one place, then let `game.js` render from those summary fields. Update README/help copy and regression checks to lock the contract.

**Tech Stack:** Phaser 3, plain JavaScript, Node regression script

---

### Task 1: Add failing coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

- Extend the telegraph summary assertions to require:
  - `currentCountdownHeadMarkerVisible === false` before the tail-afterglow becomes active
  - `currentCountdownHeadMarkerVisible === true` once active
  - `currentCountdownHeadMarkerRatio === progressRatio` in the active case
- Extend the source-hook assertions to require a dedicated graphics node clear/draw block for the marker.
- Extend README/help-copy assertions to require `当前倒计时头标`.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on missing telegraph head-marker summary/render/docs contracts.

### Task 2: Implement the shared summary

**Files:**
- Modify: `shared/game-core.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write minimal implementation**

- Add `currentCountdownHeadMarkerVisible` and `currentCountdownHeadMarkerRatio` to the empty and visible return objects.
- Gate visibility on active tail-afterglow + dimmed fill + remaining progress.

**Step 2: Run test to verify progress**

Run: `node scripts/regression-checks.mjs`
Expected: summary assertions move closer to green while render/docs still fail.

### Task 3: Implement the Boss HUD render path

**Files:**
- Modify: `game.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write minimal implementation**

- Create a dedicated graphics node for the new marker.
- Clear it with the other telegraph graphics.
- Draw a thin warm marker at `progressRatio` when the shared summary says it is visible.

**Step 2: Run test to verify progress**

Run: `node scripts/regression-checks.mjs`
Expected: render assertions pass; docs assertions may still fail.

### Task 4: Update docs and TODO

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`
- Test: `scripts/regression-checks.mjs`

**Step 1: Update docs**

- Mention the new `当前倒计时头标` in README and help copy expectations.
- Mark the completed TODO item and promote one follow-up active item.

**Step 2: Run final verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

### Task 5: Integrate

**Files:**
- Modify: `.git` state indirectly through git commands only

**Step 1: Commit**

```bash
git add TODO.md PROGRESS.log README.md shared/game-core.js game.js scripts/regression-checks.mjs docs/plans/2026-03-30-telegraph-tail-head-marker-design.md docs/plans/2026-03-30-telegraph-tail-head-marker-plan.md
git commit -m "feat: add telegraph tail countdown head marker"
```

**Step 2: Merge / push with fallback**

- Prefer local feature-branch merge back to `main`.
- If local branch / merge is blocked by git lock permissions, use the documented heartbeat fallback and report the exact blocker.
