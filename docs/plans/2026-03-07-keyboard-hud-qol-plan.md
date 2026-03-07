# Keyboard HUD QoL Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add keyboard combat cooldown readability and compact quick-slot HUD labels/counts for the first two heartbeat TODO items.

**Architecture:** Add two pure formatting helpers in `shared/game-core.js`, consume them in the HUD code inside `game.js`, and extend `scripts/regression-checks.mjs` to verify helper output plus source-level hooks.

**Tech Stack:** Phaser 3, browser-side JavaScript, shared CommonJS helpers, Node regression script

---

### Task 1: Lock the cooldown HUD line with failing regression coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `shared/game-core.js`
- Modify: `game.js`

**Step 1: Write the failing test**

Add checks for a new combat-action readiness helper and source hooks for a dedicated HUD cooldown line.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the helper export and HUD line do not exist yet.

**Step 3: Write minimal implementation**

Add the helper in `shared/game-core.js` and wire a short cooldown line into `UIScene`.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/regression-checks.mjs shared/game-core.js game.js TODO.md README.md PROGRESS.log docs/plans/2026-03-07-keyboard-hud-qol-design.md docs/plans/2026-03-07-keyboard-hud-qol-plan.md
git commit -m "feat: improve keyboard HUD readability"
```

### Task 2: Lock the quick-slot compact labels/counts with failing regression coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `shared/game-core.js`
- Modify: `game.js`
- Modify: `README.md`
- Modify: `TODO.md`

**Step 1: Write the failing test**

Add checks for a compact quick-slot label helper and source hooks that render the helper output inside the HUD.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the helper output and HUD integration do not exist yet.

**Step 3: Write minimal implementation**

Render compact slot text with counts, update README wording, and mark the first two Active TODO items complete.

**Step 4: Run test to verify it passes**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/regression-checks.mjs shared/game-core.js game.js README.md TODO.md PROGRESS.log docs/plans/2026-03-07-keyboard-hud-qol-design.md docs/plans/2026-03-07-keyboard-hud-qol-plan.md
git commit -m "feat: improve keyboard HUD readability"
```
