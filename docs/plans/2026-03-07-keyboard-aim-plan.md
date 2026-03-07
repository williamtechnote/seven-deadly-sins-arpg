# Keyboard Aim Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace pointer-driven facing with keyboard aim and support simultaneous `WASD` movement plus `IJKL` aiming for the first two active TODO items.

**Architecture:** Keep the current angle-based player combat model and insert a small keyboard-aim helper layer in `shared/game-core.js`. `game.js` reads those helpers inside `Player.update()` so attacks, specials, projectiles, and dodge inherit the new direction automatically.

**Tech Stack:** Phaser 3, browser-side JavaScript, shared CommonJS helper module, Node regression script

---

### Task 1: Add failing keyboard-aim regression tests

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add coverage for keyboard aim vector resolution, last-angle fallback, and source-level checks proving `game.js` uses `IJKL` aim keys instead of pointer-facing in `Player.update()`.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on missing keyboard aim helpers / old pointer-facing source.

**Step 3: Write minimal implementation**

Add the shared helpers and wire `game.js` to them.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/regression-checks.mjs shared/game-core.js game.js README.md TODO.md PROGRESS.log docs/plans/2026-03-07-keyboard-aim-design.md docs/plans/2026-03-07-keyboard-aim-plan.md
git commit -m "feat: add keyboard aim controls"
```

### Task 2: Wire player aim and documentation

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`
- Modify: `README.md`
- Modify: `TODO.md`

**Step 1: Write the failing test**

The regression checks from Task 1 cover this task.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL while pointer-facing is still active.

**Step 3: Write minimal implementation**

Add keyboard aim helpers, register `I/J/K/L` aim keys on `Player`, update `facingAngle` from keyboard aim, remap keyboard attack / special to `U / O`, and refresh help / README text.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add shared/game-core.js game.js README.md TODO.md scripts/regression-checks.mjs PROGRESS.log docs/plans/2026-03-07-keyboard-aim-design.md docs/plans/2026-03-07-keyboard-aim-plan.md
git commit -m "feat: add keyboard aim controls"
```
