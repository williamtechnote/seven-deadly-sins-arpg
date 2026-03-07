# Keyboard HUD Readability Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add HUD/help readability for keyboard controls and lock the touchpad-style keyboard combat loop with regression coverage.

**Architecture:** Reuse the existing angle-based facing system. Add a pure aim-direction label helper in `shared/game-core.js`, consume it in `game.js` HUD code, and extend `scripts/regression-checks.mjs` to prove both the helper behavior and the visible control-copy hooks.

**Tech Stack:** Phaser 3, browser-side JavaScript, shared CommonJS helpers, Node regression script

---

### Task 1: Add failing regression checks for keyboard readability

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add coverage for a shared aim-direction label helper plus source-level checks that the HUD/help overlay render the keyboard-only combat guidance.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the helper export and new HUD/help copy do not exist yet.

**Step 3: Write minimal implementation**

Add the helper export in `shared/game-core.js` and wire the UI copy in `game.js`.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/regression-checks.mjs shared/game-core.js game.js README.md TODO.md PROGRESS.log docs/plans/2026-03-07-keyboard-hud-readability-design.md docs/plans/2026-03-07-keyboard-hud-readability-plan.md
git commit -m "feat: improve keyboard control readability"
```

### Task 2: Update docs and audit trail for the heartbeat cycle

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Write the failing test**

The regression checks from Task 1 cover the user-visible guidance that these docs must describe.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL before implementation.

**Step 3: Write minimal implementation**

Document the live aim-direction HUD hint and the keyboard-only control loop in `README.md`, mark the two active TODO items complete, and append the mandatory audit line to `PROGRESS.log`.

**Step 4: Run test to verify it passes**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add README.md TODO.md PROGRESS.log shared/game-core.js game.js scripts/regression-checks.mjs docs/plans/2026-03-07-keyboard-hud-readability-design.md docs/plans/2026-03-07-keyboard-hud-readability-plan.md
git commit -m "feat: improve keyboard control readability"
```
