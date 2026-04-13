# Hub Portal Target Cues Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the hub `选门参考` card frame the next portal decision with one compact boss-target posture cue.

**Architecture:** Extend the shared portal summary helper to understand a richer target payload and derive a boss-specific cue from shared data. Keep runtime wiring thin in `game.js`, update the panel sizing to fit the extra line, and lock the behavior with regression coverage plus README/docs updates.

**Tech Stack:** Plain JavaScript, Phaser 3 scene glue, `shared/game-core.js`, Node regression script

---

### Task 1: Add the failing regression slice

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions that:
- `buildHubPortalChoiceSummary(null, { label, bossKey })` returns a visible `目标 + 门前 cue` card
- `buildHubPortalChoiceSummary(summary, { label, bossKey })` keeps the old recap lines and inserts the cue
- the legacy string payload still behaves as before

**Step 2: Run test to verify it fails**

Run: `node --input-type=module -e "import assert from 'node:assert/strict'; import { buildHubPortalChoiceSummary } from './shared/game-core.js'; assert.equal(buildHubPortalChoiceSummary(null, { label: '色欲 幻梦花园', bossKey: 'lust' }).visible, true);"`

Expected: FAIL because the helper currently hides when no last-run summary exists and ignores `bossKey`.

### Task 2: Implement shared portal target framing

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Write minimal implementation**

- Add a compact boss-to-cue map
- Normalize portal target input from either string or object
- Update `buildHubPortalChoiceSummary` to inject the cue and allow target-only visibility when boss-aware data exists

**Step 2: Run targeted verification**

Run: `node --input-type=module -e "import assert from 'node:assert/strict'; import { buildHubPortalChoiceSummary } from './shared/game-core.js'; const summary = buildHubPortalChoiceSummary(null, { label: '色欲 幻梦花园', bossKey: 'lust' }); assert.deepEqual(summary.lines, ['目标 色欲 幻梦花园', '门前 稳拍反制']);"`

Expected: PASS

### Task 3: Wire runtime and docs

**Files:**
- Modify: `game.js`
- Modify: `README.md`
- Modify: `TODO.md`

**Step 1: Update runtime**

- Pass `{ label, bossKey }` from hub portal focus into the shared helper
- Resize the portal panel from line count so the extra cue fits cleanly

**Step 2: Update docs**

- Add the new heartbeat item to `TODO.md`
- Document the portal target cue in `README.md`

**Step 3: Run full verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`

Expected: PASS
