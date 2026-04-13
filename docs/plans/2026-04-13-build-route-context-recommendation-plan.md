# Build-Route Context Recommendation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade build-facing shrine recommendations from static loadout checks to contextual why-now guidance, then carry that reason through routed room-3 feedback.

**Architecture:** Extend the shared recommendation helper to require both loadout fit and live combat-state fit for `压阵 / 离弦 / 余烬 / 血痕`, then keep room-3 feedback on the existing shared encounter ladder. Lock the new contract with regression coverage first, then sync TODO/README copy.

**Tech Stack:** JavaScript, shared pure logic in `shared/game-core.js`, CLI regression checks in `scripts/regression-checks.mjs`

---

### Task 1: Re-prioritize the heartbeat TODO

**Files:**
- Modify: `TODO.md`

**Step 1: Update the active TODO**

Promote the build-route contextual recommendation item to `## Active`, rewrite it with the new why-now reasons, and move the older resource-route refinement back under `## Next Up`.

### Task 2: Write the failing regression coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add failing recommendation assertions**

Add regression cases that prove:

- melee + pressure-fit => `建议 1：压阵修习 · 近战更宜压线`
- ranged + windfall-fit => `建议 2：离弦修习 · 远程更宜追赏`
- burn + stabilize-fit => `建议 1：余烬修习 · 灼烧更宜稳场`
- bleed + pressure-fit => `建议 2：血痕修习 · 挂血更宜抢势`
- matching loadout without the right live-state fit stays silent

**Step 2: Verify RED**

Run: `node scripts/regression-checks.mjs`

Expected: FAIL in the build-route recommendation assertions because the helper still returns the old loadout-only reasons.

### Task 3: Implement the shared recommendation upgrade

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Add contextual build-route heuristics**

Use the existing recommendation action-state helper plus weapon/status checks to gate the four build routes behind high-confidence live-state conditions.

**Step 2: Keep routed encounter feedback aligned**

Allow the new persisted reasons to map to the existing build-route room-3 feedback, while preserving older persisted reasons as a fallback.

**Step 3: Verify GREEN**

Run: `node scripts/regression-checks.mjs`

Expected: PASS

### Task 4: Sync player-facing docs

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`

**Step 1: Update README copy**

Replace the old loadout-only build recommendation wording with the new contextual why-now reason contract.

**Step 2: Mark the TODO complete**

Move the active build-route item into `## Completed` with the heartbeat timestamp and leave the resource-route refinement in `## Next Up`.

### Task 5: Verify and close the heartbeat

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run the required verification command**

Run exactly:

`node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`

**Step 2: Commit and merge**

Create a focused feature commit on `feat/auto-build-route-context-recommendation`, fast-forward merge it into `main`, and attempt to push `main` while keeping the feature branch.

**Step 3: Append the heartbeat audit line**

Record the task, branch, checks, merge status, push status, and any blockers/fallbacks in `PROGRESS.log`.
