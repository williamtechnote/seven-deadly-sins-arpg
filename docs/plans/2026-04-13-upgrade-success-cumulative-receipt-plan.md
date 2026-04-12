# Upgrade Success Cumulative Receipt Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let later blacksmith upgrade success receipts expose the weapon's cumulative post-upgrade state on wider widths without weakening the existing payoff-first fallback ladder.

**Architecture:** Extend the shared upgrade-success helper in `shared/game-core.js` so it can derive both the current-step payoff and a cumulative `累计...` summary from the same benefit-summary contract. Keep `game.js` consuming that helper unchanged except for help-overlay copy, then lock the contract with regression assertions plus README/TODO/PROGRESS updates.

**Tech Stack:** Vanilla JavaScript, Phaser 3 help overlay text, shared game-core helpers, Node regression script

---

### Task 1: Record the heartbeat scope

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-04-13-upgrade-success-cumulative-receipt-design.md`
- Create: `docs/plans/2026-04-13-upgrade-success-cumulative-receipt-plan.md`

**Step 1: Reprioritize the backlog**

Promote `铁匠强化成功回执累计总览` to `Active`, move the already-landed encounter entry preview into `Completed`, and queue one non-blacksmith follow-up in `Next Up`.

**Step 2: Save the design and plan docs**

Document the rejected options, chosen cumulative-tail ladder, and the TDD-first implementation path.

### Task 2: Write failing regression coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add helper assertions**

Add a failing unit-style assertion proving that a wide `Lv.2→Lv.3` receipt returns:

```text
强化成功! Lv.2→Lv.3 · 本次伤害+5 / 特攻-0.2s / 体耗-1 · 累计伤害+9 / 特攻-0.3s / 体耗-3 · 消耗2个暴怒之精华
```

and that the ladder still falls back cleanly when width only fits the payoff-first variants.

**Step 2: Add source-hook and doc assertions**

Update the shared-helper regex plus README/help-overlay wording checks so they fail until the cumulative receipt contract is documented and implemented.

**Step 3: Run the exact required command to verify RED**

Run:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

Expected: FAIL because the success helper does not yet derive or prefer the cumulative receipt variant.

### Task 3: Implement the shared cumulative receipt ladder

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Derive the cumulative summary**

Inside `buildWeaponUpgradeSuccessMessage`, compute a `累计` benefit summary for `1 -> nextLevel` and skip it when it adds no new information beyond the current-step payoff.

**Step 2: Insert the wider variants**

Order the receipt ladder so very wide widths can keep:

1. level transition + current payoff + cumulative total + material anchor
2. level transition + current payoff + cumulative total
3. level transition + current payoff + material anchor
4. existing payoff-first fallbacks

**Step 3: Preserve narrow contracts**

Keep the existing `Lv.X→Lv.Y · 本次...`, first-segment, and level-only fallbacks intact after the new wider variants.

### Task 4: Sync player-facing docs

**Files:**
- Modify: `README.md`
- Modify: `game.js`

**Step 1: Update README**

Explain that wider upgrade success receipts can now append a cumulative post-upgrade summary after the current-step payoff, especially on later upgrades, while narrow widths still keep the success/level/payoff anchors first.

**Step 2: Update help overlay**

Mirror the same contract in the blacksmith help text without inventing a divergent wording path.

### Task 5: Verify and audit the heartbeat

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run the exact required command**

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

If it fails, fix and rerun once more.

**Step 2: Attempt delivery and append the audit line**

Attempt the required git flow, then record the requested branch, actual branch state, checks, merge status, push status, blocker, and fallback in `PROGRESS.log`.
