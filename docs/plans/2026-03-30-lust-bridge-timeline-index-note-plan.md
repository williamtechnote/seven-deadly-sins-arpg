# Lust Bridge Timeline Index Note Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Inline a compact bridgeTimeline index note into each drifting Lust phase 3 cadence checklist row so artifact review can identify the relevant bridge span without reopening `cadence-review.json`.

**Architecture:** Tighten the markdown report fixture first so the drift-only mini checklist requires a bridgeTimeline span note. Then add one small formatter in `scripts/e2e-report.mjs` that reads the checkpoint bridge indices already exported by `buildBossAttackCadenceReviewChecklist` and appends a compact span summary only for drift rows.

**Tech Stack:** JavaScript, Node.js

---

### Task 1: Add the failing regression expectation

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Expand the cadence report fixture so the drifting checkpoint includes bridge span metadata:
- `bridgeStartIndex`
- `bridgeEndIndex`
- `bridgeTimeline`

Require the drift-only mini checklist to include a `bridgeTimeline index: ...` short note.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the updated drift-only mini checklist assertion.

### Task 2: Implement the formatter change

**Files:**
- Modify: `scripts/e2e-report.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write minimal implementation**

Add one helper that formats bridge span metadata into a compact short note:
- span form when both start/end indices exist
- single-point form when only one index is usable
- no output when metadata is incomplete

Append that note to each drift-only mini checklist row after the alias short note.

**Step 2: Re-run verification**

Run: `node scripts/regression-checks.mjs`
Expected: PASS.

### Task 3: Sync backlog and docs

**Files:**
- Modify: `TODO.md`
- Modify: `README.md`
- Modify: `PROGRESS.log`

**Step 1: Update TODO**

Mark item 一百一十四 complete and promote the next follow-up item as Active.

**Step 2: Update README**

Document that the drift-only mini checklist now shows the bridgeTimeline index short note in addition to the recovery, drift, review-checkpoint, and alias notes.

**Step 3: Append the audit line**

Log the heartbeat cycle with task, branch, checks, merge status, and fallback details if git sandbox limits still interfere with local branch or merge operations.
