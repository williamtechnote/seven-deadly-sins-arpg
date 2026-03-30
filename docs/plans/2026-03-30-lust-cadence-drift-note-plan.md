# Lust Cadence Drift Note Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Inline a drift/match note into each Lust phase 3 cadence checklist row so cadence artifact review immediately shows whether checkpoint return targets still agree with the shared recovery snapshot.

**Architecture:** Tighten the existing markdown-report regression fixture first so it requires both `match` and `drift` variants, then add one small formatter in `scripts/e2e-report.mjs` that compares each checkpoint `expectedReturnLabel` against `shared-recovery-snapshot.json` and appends the result inline.

**Tech Stack:** JavaScript, Node.js

---

### Task 1: Add the failing regression expectation

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Expand the markdown report fixture so it renders at least two checkpoint rows:
- one row where checkpoint and recovery snapshot labels match
- one row where they drift

Require the report output to include:
- `回切校验: match`
- `回切校验: drift checkpoint=... recovery=...`

**Step 2: Run test to verify it fails**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: FAIL on the updated markdown cadence report assertions.

### Task 2: Implement the formatter change

**Files:**
- Modify: `scripts/e2e-report.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write minimal implementation**

Add one helper that compares checkpoint and recovery labels and returns either:
- `回切校验: match`
- `回切校验: drift checkpoint=\`...\` recovery=\`...\``

Append that note to each cadence checklist row only when both labels are available.

**Step 2: Re-run verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS.

### Task 3: Sync backlog and docs

**Files:**
- Modify: `TODO.md`
- Modify: `README.md`
- Modify: `PROGRESS.log`

**Step 1: Update TODO**

Mark item 一百零六 complete and add the next follow-up item as the new active task.

**Step 2: Update README**

Document that the markdown `Phase 3 录屏复盘清单` now shows both the recovery snapshot short note and the checkpoint-vs-recovery drift/match note inline.

**Step 3: Append the audit line**

Log the heartbeat cycle, including the local branch/merge blocker and the fallback used for delivery if the sandbox still blocks `.git` lock creation.
