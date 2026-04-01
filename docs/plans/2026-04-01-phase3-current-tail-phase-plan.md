# Phase 3 Current Tail Phase Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Surface the live Lust phase 3 counter-window tail phase directly in the markdown summary so report readers do not need to infer the closure phase from a signed delta.

**Architecture:** Reuse the existing `telegraphSnapshot` cadence artifact plus the existing drift-only `counterWindowTailPhase` wording. Add one small summary formatter in `scripts/e2e-report.mjs`, lock it with a regression assertion in `scripts/regression-checks.mjs`, then update README/TODO/PROGRESS for heartbeat auditability.

**Tech Stack:** Node.js, plain JavaScript, markdown docs

---

### Task 1: Red Test For Summary Output

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Expect the `Phase 3 汇总` line to include `当前尾差相位: \`telegraph后收束\``.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the summary does not yet include the new field.

### Task 2: Minimal Report Implementation

**Files:**
- Modify: `scripts/e2e-report.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write minimal implementation**

Add a helper that formats the live `counterWindowTailPhase` label from `telegraphSnapshot`, then append it to `buildCadenceCheckpointSummaryLine`.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS.

### Task 3: Heartbeat Metadata

**Files:**
- Modify: `TODO.md`
- Modify: `README.md`
- Modify: `PROGRESS.log`

**Step 1: Update heartbeat docs**

Mark the active TODO done, add one new follow-up TODO item discovered from the E2E summary layout, and document the summary change in README.

**Step 2: Run required verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS.

### Task 4: Git Delivery

**Files:**
- Modify: git history only

**Step 1: Commit on feature branch**

Run: `git add TODO.md README.md PROGRESS.log scripts/e2e-report.mjs scripts/regression-checks.mjs docs/plans/2026-04-01-phase3-current-tail-phase-design.md docs/plans/2026-04-01-phase3-current-tail-phase-plan.md && git commit -m "feat: surface phase 3 tail phase summary"`

**Step 2: Merge and push**

Run: `git checkout main && git merge --ff-only feat/auto-phase3-current-tail-phase && git push origin feat/auto-phase3-current-tail-phase && git push origin main`
Expected: Merge and push succeed, or record the exact blocker and fallback in `PROGRESS.log`.
