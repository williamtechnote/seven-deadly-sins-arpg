# Encounter Bounty Payoff Receipt Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the routed bounty target in `淘金战` confirm itself at kill-time with a distinct payoff receipt and brighter gold burst, without making every room's gold feedback equally loud.

**Architecture:** Add a shared payoff-presentation helper that derives receipt text and pickup visuals from encounter-slot reward metadata plus actual gold dropped. Have `Enemy.takeDamage()` attach that contract to the drop payload, then let `LevelScene` consume it when spawning pickups and kill-time feedback.

**Tech Stack:** Vanilla JavaScript, Phaser 3 runtime scenes, `shared/game-core.js`, repo regression script

---

### Task 1: Lock the backlog and design trail

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-04-13-encounter-bounty-payoff-receipt-design.md`
- Create: `docs/plans/2026-04-13-encounter-bounty-payoff-receipt-plan.md`

**Step 1: Update the active TODO**

Keep `遭遇赏金兑现回执` as the active systemic follow-up so the backlog points at kill-time reward legibility, not another routing variant.

**Step 2: Save the design + plan docs**

Capture the rejected alternatives, chosen direction, and shared-helper-first implementation approach.

### Task 2: Write the failing regression coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add shared-helper assertions**

Write failing tests for a new helper that proves:

- ordinary encounter slots do not synthesize a loud bounty receipt
- a marked `淘金战` slot with real gold returns `赏金+X` style receipt data
- the same marked slot also returns brighter pickup presentation data without altering drop totals

**Step 2: Add runtime-hook assertions**

Extend source checks so they fail until:

- `Enemy.takeDamage()` attaches the shared payoff contract onto the drop payload
- `_spawnDropPickups()` consumes that contract to show a receipt and apply brighter gold-pickup presentation

**Step 3: Run the regression script and confirm failure**

Run: `node scripts/regression-checks.mjs`

Expected: FAIL because the payoff helper and runtime hook do not exist yet.

### Task 3: Implement the shared payoff contract

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`

**Step 1: Add the shared helper**

Export a deterministic helper that converts encounter reward metadata plus actual gold amount into receipt/pickup presentation data.

**Step 2: Attach payoff data on enemy death**

Update `Enemy.takeDamage()` so the computed gold drop also carries the shared payoff contract when relevant.

**Step 3: Consume the payoff data in runtime**

Update `_spawnDropPickups()` and pickup creation so bounty targets emit a short receipt and brighter gold burst while other profiles keep stable feedback.

### Task 4: Sync docs and verify

**Files:**
- Modify: `README.md`

**Step 1: Update README**

Document that `淘金战` 的高赏金目标 now confirms itself on kill with a short receipt / brighter gold burst, while other routed encounters keep steadier gold feedback.

**Step 2: Run the required commands**

Run exactly:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

Expected: PASS

### Task 5: Close out the heartbeat cycle

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Append the audit line**

Record task, branch, checks, merge status, push status, blocker, and fallback.

**Step 2: Attempt git integration**

Re-attempt commit / merge / push only if the sandboxed git locks no longer block safe delivery; otherwise record the explicit blocker and keep the verified worktree plus any patch/export fallback.
