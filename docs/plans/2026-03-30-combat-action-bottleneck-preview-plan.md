# Combat Action Bottleneck Preview Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Teach the action HUD to preview whether an action will still be stamina-gated after its cooldown ends.

**Architecture:** Extend the shared combat-action formatter in `shared/game-core.js` so the browser HUD and CLI regression checks continue to use one source of truth. Cover the new combined-gating cases in `scripts/regression-checks.mjs`, then refresh README/help copy to describe the new label.

**Tech Stack:** Phaser 3, plain JavaScript, Node assert-based regression checks

---

### Task 1: Add failing regression coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions for:

- cooldown active + enough stamina by cooldown end => still show short cooldown
- cooldown active + not enough stamina by cooldown end => show `0.3s后差8体/0.5s`
- cooldown active + no regen timing => show `0.3s后差8体`

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL in combat action HUD summary assertions because combined gating preview is not implemented yet.

### Task 2: Implement the shared formatter

**Files:**
- Modify: `shared/game-core.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write minimal implementation**

Teach `formatCombatActionReadyLabel(...)` to:

- estimate stamina at cooldown end
- keep the current cooldown label if estimated stamina is enough
- otherwise compute remaining stamina gap after cooldown end and format `Xs后差Y体[/Zs]`

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new combat action HUD assertions.

### Task 3: Update player-facing docs

**Files:**
- Modify: `README.md`
- Modify: `game.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Update copy**

Document that cooldown-gated actions can now preview a post-cooldown stamina shortage such as `0.3s后差8体/0.5s`.

**Step 2: Run full verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS
