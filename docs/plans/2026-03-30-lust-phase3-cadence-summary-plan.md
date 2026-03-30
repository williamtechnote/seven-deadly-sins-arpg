# Lust Phase 3 Cadence Summary Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a phase-3 summary header to the markdown E2E cadence review so reviewers can see `match/drift` totals and drifting checkpoints before reading individual lines.

**Architecture:** Keep the change inside `scripts/e2e-report.mjs` by deriving summary metadata from the same checkpoint/recovery inputs already used to render each line. Lock the format in `scripts/regression-checks.mjs`, then sync `README.md`, `TODO.md`, and `PROGRESS.log`.

**Tech Stack:** JavaScript, Node.js

---

### Task 1: Add the failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Require the markdown report to include a summary header under `Phase 3 录屏复盘清单` with:
- `match/drift` totals
- the drifting checkpoint label list

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the current report only renders per-checkpoint lines.

### Task 2: Implement the summary header

**Files:**
- Modify: `scripts/e2e-report.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write minimal implementation**

Add a small summary builder that:
- inspects checkpoint expected-return labels versus `shared-recovery-snapshot.json`
- counts `match` and `drift`
- emits a markdown line naming drift checkpoints when present

**Step 2: Run regression checks**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new summary assertions and existing cadence output assertions.

### Task 3: Sync docs and heartbeat logs

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs**

Document that the report now surfaces a summary header with `match/drift` totals and drift checkpoint names.

**Step 2: Close the heartbeat cycle**

Mark the active TODO complete, promote one next active follow-up, and append the audit line with git blocker details if local branch operations remain sandbox-blocked.
