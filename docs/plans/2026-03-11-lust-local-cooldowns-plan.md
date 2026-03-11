# Lust Local Cooldowns Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reduce `魅惑女妖` phase 3 repeat pressure after a full attack loop by adding opt-in phase-local cooldowns for the first two high-pressure specials.

**Architecture:** Extend the existing boss phase selector with optional per-phase cooldown metadata keyed by attack name. Track cooldown expiry inside `Boss`, assert the new hooks in regression checks first, then wire Lust phase 3 for `reverseControl` and `illusion` only.

**Tech Stack:** Phaser 3 runtime in `game.js`, static boss data in `data.js`, CLI regression hooks in `scripts/regression-checks.mjs`, docs in Markdown.

---

### Task 1: Add reverseControl cooldown coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `data.js`
- Modify: `game.js`

**Step 1: Write the failing test**

Add assertions that:
- `BOSSES.lust.phases[2].phaseLocalCooldownMs.reverseControl` exists with the chosen cooldown.
- `Boss` reads `phase.phaseLocalCooldownMs` in `_pickPhaseAttack`.
- `_finishAttack` records cooldown expiry for configured attacks.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on missing phase-local cooldown hooks.

**Step 3: Write minimal implementation**

Add per-phase cooldown metadata and the selector/finish hooks needed to honor it.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new reverseControl assertions.

### Task 2: Add illusion cooldown coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `data.js`
- Modify: `README.md`
- Modify: `TODO.md`

**Step 1: Write the failing test**

Add assertions that:
- `BOSSES.lust.phases[2].phaseLocalCooldownMs.illusion` exists with the chosen cooldown.
- README mentions the new phase-local cooldown behavior for Lust phase 3.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on missing `illusion` cooldown metadata / doc wording.

**Step 3: Write minimal implementation**

Wire the `illusion` cooldown metadata, then update README/TODO wording to match the new pacing contract.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new `illusion` cooldown assertions.
