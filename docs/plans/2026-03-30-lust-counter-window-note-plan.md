# Lust Counter Window Note Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a `counterWindowMs` short note to each drifting Lust phase 3 cadence-review checklist row so review can stay inside the markdown report.

**Architecture:** Reuse the existing cadence artifact bundle and e2e markdown report path. Preserve the current checkpoint/recovery logic, add one display helper for `counterWindowMs`, and lock the report string with regression checks plus README/TODO updates.

**Tech Stack:** JavaScript, shared `GameCore`, Node CLI report generation, repo-local regression script

---

### Task 1: Lock the missing note with a failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Extend the phase-3 e2e report assertion so the drift-only mini checklist requires `counterWindowMs: \`1700ms\`` beside the existing `telegraphDurationMs` note.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL in the phase-3 cadence report assertion because the report does not render the new note yet.

### Task 2: Implement the note in the cadence report path

**Files:**
- Modify: `scripts/e2e-report.mjs`

**Step 1: Write minimal implementation**

Add a helper that formats `counterWindowMs` from `telegraphSnapshot`, then include it in each drift-only mini checklist row next to the existing telegraph duration note.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the updated cadence report assertion.

### Task 3: Sync backlog and docs

**Files:**
- Modify: `TODO.md`
- Modify: `README.md`

**Step 1: Refresh backlog/doc copy**

Mark item 117 complete, keep item 118 active, and document the new `counterWindowMs` short note in the README cadence-review section.

**Step 2: Verify final repo checks**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

### Task 4: Commit and integrate

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Record audit line**

Append the mandatory heartbeat audit entry with task, branch, tests, and merge fallback status.

**Step 2: Commit**

Run:

```bash
git add TODO.md README.md scripts/e2e-report.mjs scripts/regression-checks.mjs docs/plans/2026-03-30-lust-counter-window-note-design.md docs/plans/2026-03-30-lust-counter-window-note-plan.md PROGRESS.log
git commit -m "feat: add lust counter window drift note"
```
