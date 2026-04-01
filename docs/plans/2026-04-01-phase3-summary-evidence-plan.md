# Phase 3 Summary Evidence Shortcut Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restore first-screen artifact access for the Lust phase 3 cadence summary by adding a dedicated `evidence` short line even when the review has no drift.

**Architecture:** Extend the existing summary renderer in `scripts/e2e-report.mjs` with one extra line sourced from `buildCadenceSummaryEvidenceLinks`, then pin the behavior with a regression expectation and update the README/TODO/PROGRESS heartbeat trail.

**Tech Stack:** Node.js, plain JavaScript, markdown docs

---

### Task 1: Red Test For All-Match Evidence Access

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Expect the all-match `Phase 3 汇总` fixture to include an `evidence` short line with `[review] [recovery] [telegraph]`.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the summary currently omits the evidence line when `drift=0`.

### Task 2: Minimal Report Implementation

**Files:**
- Modify: `scripts/e2e-report.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write minimal implementation**

Append `  - evidence: ...` inside `buildCadenceCheckpointSummaryLines` whenever summary evidence links exist.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS.

### Task 3: Heartbeat Metadata

**Files:**
- Modify: `TODO.md`
- Modify: `README.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs and audit trail**

Mark the active TODO done, add one newly brainstormed follow-up TODO item, document the always-visible evidence shortcut in README, and append the mandatory audit line to `PROGRESS.log`.

**Step 2: Run required verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS.

### Task 4: Git Delivery

**Files:**
- Modify: git history only

**Step 1: Commit on feature branch**

Run: `git add ... && git commit -m "feat: add phase 3 summary evidence shortcut"`

**Step 2: Merge and push**

Run: `git switch main && git merge --ff-only feat/auto-phase3-evidence-shortcut && git push origin feat/auto-phase3-evidence-shortcut && git push origin main`
Expected: Succeed in a writable clone, or record the exact blocker and fallback in `PROGRESS.log`.
