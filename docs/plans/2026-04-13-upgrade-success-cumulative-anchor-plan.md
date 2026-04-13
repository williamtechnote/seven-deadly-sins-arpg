# Upgrade Success Cumulative Anchor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Preserve a compact cumulative post-upgrade anchor in medium-width blacksmith success receipts before they collapse to payoff-only copy.

**Architecture:** Extend `buildWeaponUpgradeSuccessMessage` in `shared/game-core.js` so later upgrades can derive a medium-width cumulative anchor from the existing cumulative benefit summary and insert it between the current full cumulative receipt and the older payoff-only ladder. Keep runtime wiring unchanged, then lock the new contract in regression coverage and sync README/help/TODO/PROGRESS.

**Tech Stack:** Vanilla JavaScript, shared game-core helpers, Phaser 3 help overlay text, Node regression script

---

### Task 1: Record the heartbeat scope

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-04-13-upgrade-success-cumulative-anchor-design.md`
- Create: `docs/plans/2026-04-13-upgrade-success-cumulative-anchor-plan.md`

**Step 1: Re-prioritize the backlog**

Promote `铁匠强化成功回执累计首段压缩` to `Active`, mark the already-landed event-room recommendation work complete, and add one new non-blacksmith follow-up item to keep the roadmap balanced.

**Step 2: Save the design and plan docs**

Document the rejected payoff-only and cumulative-only approaches, the medium-width compact-anchor ladder, and the TDD-first implementation path.

### Task 2: Write the failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add helper assertions**

Add failing coverage for a `Lv.2→Lv.3` receipt at medium width, expecting an intermediate fallback such as:

```text
强化成功! Lv.2→Lv.3 · 本次伤害+5 / 特攻-0.2s / 体耗-1 · 累计+9 / 特攻-0.3s
```

or, if width is tighter again, a first-segment fallback such as:

```text
强化成功! Lv.2→Lv.3 · 本次伤害+5 / 特攻-0.2s / 体耗-1 · 累计伤害+9
```

**Step 2: Add source/doc assertions**

Update the shared-helper regex and README/help wording checks so they fail until the new medium-width cumulative-anchor contract is implemented and documented.

**Step 3: Run RED**

Run:

```bash
node scripts/regression-checks.mjs
```

Expected: FAIL because the intermediate cumulative-anchor variants do not exist yet.

### Task 3: Implement the shared helper change

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Derive compact cumulative variants**

Inside `buildWeaponUpgradeSuccessMessage`, split the cumulative benefit summary into segments and derive one or two compact cumulative anchors from the leading segment(s).

**Step 2: Insert the new ladder**

Order the later-upgrade variants so the helper tries:

1. full cumulative receipt + material anchor
2. full cumulative receipt
3. medium-width compact cumulative anchor
4. tighter first-segment cumulative anchor
5. existing payoff-only fallbacks

**Step 3: Preserve existing behavior**

Leave first-upgrade receipts, material-only fallbacks, and the narrow level/payoff ladder unchanged.

### Task 4: Sync surfaced docs

**Files:**
- Modify: `README.md`
- Modify: `game.js`

**Step 1: Update README**

Document that later upgrade success receipts now keep a compact cumulative anchor at medium widths before falling back to payoff-only variants.

**Step 2: Update help overlay**

Mirror the same contract in the blacksmith help copy without diverging from README wording.

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
