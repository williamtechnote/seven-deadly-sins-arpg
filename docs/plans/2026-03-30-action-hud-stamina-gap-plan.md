# Action HUD Stamina Gap Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the combat HUD show the exact missing stamina for gated actions so players can judge when they can attack, use specials, or dodge again.

**Architecture:** Reuse the existing shared combat HUD helper in `shared/game-core.js` so the browser HUD and regression checks stay aligned. Drive the change test-first inside `scripts/regression-checks.mjs`, then update the README wording to document the new HUD semantics.

**Tech Stack:** JavaScript, shared pure helpers, Node regression script

---

### Task 1: Add regression coverage for stamina-gap labels

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `shared/game-core.js`
- Modify: `README.md`
- Modify: `TODO.md`

**Step 1: Write the failing test**

Add a regression assertion that `buildCombatActionHudSummary()` renders exact stamina deficits when cooldowns are clear but stamina is insufficient.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new combat HUD stamina-gap assertion because the helper still returns the generic `体力不足` label.

**Step 3: Write minimal implementation**

Update the shared combat HUD helper to return a compact missing-stamina label while preserving existing cooldown and ready behavior.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the updated combat HUD assertions and the existing regression suite.

**Step 5: Commit**

```bash
git add TODO.md README.md docs/plans/2026-03-30-action-hud-stamina-gap-plan.md scripts/regression-checks.mjs shared/game-core.js
git commit -m "feat: show action HUD stamina gaps"
```
