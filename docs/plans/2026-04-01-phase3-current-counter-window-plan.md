# Phase 3 Current Counter Window Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Surface the live Lust phase 3 counter-window length directly in the markdown summary so report readers do not need to scan the full checkpoint list.

**Architecture:** Reuse the existing `telegraphSnapshot` cadence artifact and add one small summary formatter in `scripts/e2e-report.mjs`. Lock the behavior with a regression expectation in `scripts/regression-checks.mjs`, then update README/TODO/PROGRESS to keep the heartbeat trail auditable.

**Tech Stack:** Node.js, plain JavaScript, markdown docs

---

### Task 1: Red Test For Summary Output

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Expect the `Phase 3 汇总` line to include `当前反制窗口: \`1.7s (130.8% telegraph)\``.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the summary does not yet include the new field.

### Task 2: Minimal Report Implementation

**Files:**
- Modify: `scripts/e2e-report.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write minimal implementation**

Add a helper that formats the live `counterWindowMs` and `telegraphDurationMs`, then append it to `buildCadenceCheckpointSummaryLine`.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS.

### Task 3: Heartbeat Metadata

**Files:**
- Modify: `TODO.md`
- Modify: `README.md`
- Modify: `PROGRESS.log`

**Step 1: Update heartbeat docs**

Mark the active TODO done, add one new follow-up TODO item, and document the summary change in README.

**Step 2: Run required verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS.

### Task 4: Git Delivery

**Files:**
- Modify: git history only

**Step 1: Commit on feature branch**

Run: `git add TODO.md README.md PROGRESS.log scripts/e2e-report.mjs scripts/regression-checks.mjs docs/plans/2026-04-01-phase3-current-counter-window-design.md docs/plans/2026-04-01-phase3-current-counter-window-plan.md && git commit -m "feat: surface phase 3 counter window summary"`

**Step 2: Merge and push**

Run: `git checkout main && git merge --ff-only feat/auto-phase3-current-counter-window && git push origin feat/auto-phase3-current-counter-window && git push origin main`
Expected: Merge and push succeed, or record the exact blocker and fallback in `PROGRESS.log`.
