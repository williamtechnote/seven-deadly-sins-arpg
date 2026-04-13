# Upgrade Success Spend Anchor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Preserve a compact later-upgrade spend anchor alongside cumulative forge success anchors before the receipt falls back to payoff-only copy.

**Architecture:** Extend the shared forge success-message variant ladder in `shared/game-core.js`, then update regression checks and lightweight documentation so every surface describes the same width-aware contract. No scene-level behavior change is required beyond existing helper consumption.

**Tech Stack:** Vanilla JS, shared helper utilities in `shared/game-core.js`, repo-specific regression script in `scripts/regression-checks.mjs`

---

### Task 1: Lock the new contract with failing tests

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add later-upgrade assertions for:

- `强化成功! Lv.2→Lv.3 · 本次伤害+5 / 特攻-0.2s / 体耗-1 · 累计+9 / 特攻-0.3s · 消耗2个暴怒`
- `强化成功! Lv.2→Lv.3 · 本次伤害+5 / 特攻-0.2s / 体耗-1 · 累计伤害+9 · 消耗2个暴怒`

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new later-upgrade spend-anchor assertions.

### Task 2: Implement the minimal shared-helper change

**Files:**
- Modify: `shared/game-core.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write minimal implementation**

Insert compact cumulative-plus-spend variants into `buildWeaponUpgradeSuccessMessage` before the existing cumulative-only fallbacks.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS on the new assertions with no regression failures.

### Task 3: Update docs to match the new ladder

**Files:**
- Modify: `README.md`
- Modify: `game.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Update docs/help text**

Describe that later-upgrade success toasts now preserve a compact cumulative+spend anchor before falling back to cumulative-only or payoff-only copy.

**Step 2: Run regression script**

Run: `node scripts/regression-checks.mjs`
Expected: PASS with README/help-overlay regex assertions updated.

### Task 4: Run required verification and integrate

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run required verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 2: Commit**

Run:

```bash
git add shared/game-core.js scripts/regression-checks.mjs README.md game.js TODO.md docs/methodology/arpg-upgrade-feedback-contract.md docs/plans/2026-04-13-upgrade-success-spend-anchor-design.md docs/plans/2026-04-13-upgrade-success-spend-anchor-plan.md PROGRESS.log
git commit -m "feat: preserve upgrade spend anchors in success receipts"
```
