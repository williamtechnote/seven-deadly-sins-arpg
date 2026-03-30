# Lust Phase 3 Drift Evidence Index Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add direct evidence anchors to the phase-3 drift summary header so report readers can jump from the summary to the Lust cadence artifacts without scanning the full checklist.

**Architecture:** Keep the change inside `scripts/e2e-report.mjs` by extending the existing phase-3 summary builder to append the shared cadence artifact links when drift exists. Lock the output in `scripts/regression-checks.mjs`, then sync `README.md`, `TODO.md`, and `PROGRESS.log`.

**Tech Stack:** JavaScript, Node.js

---

### Task 1: Add the failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Require the markdown phase-3 summary line to include:
- the drift checkpoint names
- direct `[review] [recovery] [telegraph]` links on the summary line when drift exists

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the current summary line does not expose direct evidence anchors.

### Task 2: Implement the summary evidence index

**Files:**
- Modify: `scripts/e2e-report.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write minimal implementation**

Extend the phase-3 summary builder so that when drift checkpoints exist it appends the shared cadence evidence anchors:
- `[review]`
- `[recovery]`
- `[telegraph]`

**Step 2: Run regression checks**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new summary-link assertion and existing cadence assertions.

### Task 3: Sync docs and heartbeat logs

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs**

Document that the phase-3 markdown summary now provides direct evidence anchors for drift cases.

**Step 2: Close the heartbeat cycle**

Mark the active TODO complete, promote one next active follow-up, and append the audit line with the local branch creation blocker plus any merge/push fallback that was needed.
