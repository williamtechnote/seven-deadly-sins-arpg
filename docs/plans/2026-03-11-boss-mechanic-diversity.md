# Boss Mechanic Diversity Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add two concrete boss mechanics that expand phase variety for Wrath and Pride, then queue a third follow-up TODO.

**Architecture:** Extend existing boss attack metadata and reuse the current `HAZARD` and `SPECIAL` execution hooks inside `Boss`. Verify with regression tests that lock the new attack keys, telegraph metadata, and implementation branches into place.

**Tech Stack:** Phaser 3, plain JavaScript, CLI regression checks

---

### Task 1: Reprioritize the Boss TODO

**Files:**
- Modify: `TODO.md`
- Modify: `README.md`
- Create: `docs/plans/2026-03-11-boss-mechanic-diversity-design.md`

**Step 1: Write the design split**

Document three concrete sub-items derived from the broad Boss diversity TODO.

**Step 2: Update TODO ordering**

Put `熔火围城` first, `圣剑环阵` second, and the queued `魅影连舞` follow-up third.

### Task 2: Add failing regression checks

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add regression checks that expect:
- `wrath` phase lists include `magmaRing`
- `pride` phase lists include `bladeOrbit`
- attack metadata contains display names, counter hints/windows, and execution branches

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`

Expected: FAIL because the new attack keys and execution branches do not exist yet.

### Task 3: Implement `熔火围城`

**Files:**
- Modify: `data.js`
- Modify: `game.js`
- Modify: `README.md`

**Step 1: Write minimal implementation**

- Add `magmaRing` to Wrath phase attack lists
- Add display name, telegraph hint/window, attack type, and on-hit burn metadata
- Implement the shrinking ring hazard branch in `_execHazard`

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`

Expected: remaining failures should be limited to `bladeOrbit`.

### Task 4: Implement `圣剑环阵`

**Files:**
- Modify: `data.js`
- Modify: `game.js`
- Modify: `README.md`

**Step 1: Write minimal implementation**

- Add `bladeOrbit` to Pride phase attack lists
- Add display name, telegraph hint/window, and attack type metadata
- Implement orbit-then-launch blades in `_execSpecial`

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`

Expected: PASS.

### Task 5: Verify and deliver

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run required verification**

Run:

```bash
node --check game.js
node --check data.js
node --check shared/game-core.js
node scripts/regression-checks.mjs
```

**Step 2: Attempt git delivery**

- Try local feature branch workflow first
- If ref locks still block it, use the repo’s established fallback and record the blocker explicitly

**Step 3: Append audit log**

Record timestamp, tasks, branch, tests, merge status, push status, and blocker state in `PROGRESS.log`.
