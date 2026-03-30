# Phase 3 Drift Mini Recovery Note Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Inline `回切校验` and recovery snapshot short notes into phase-3 drift-only mini checklist rows so reviewers can validate drift context without reopening the full checkpoint list.

**Architecture:** Keep `scripts/e2e-report.mjs` as the single renderer for cadence markdown. Reuse the existing checkpoint/recovery helper logic to build richer drift row payloads rather than duplicating drift parsing in a second place.

**Tech Stack:** Node.js, plain JavaScript, markdown report generation, assertion-based regression checks.

---

### Task 1: Lock the expected markdown with a failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Tighten the existing drift-only mini checklist assertion so it requires:
- the drifting checkpoint line,
- the inlined recovery snapshot short note,
- the inlined `回切校验: drift ...` note,
- the direct `[checkpoints]` anchor.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL in the e2e report markdown assertion because the mini checklist row does not yet contain the extra notes.

### Task 2: Implement the minimal report formatter change

**Files:**
- Modify: `scripts/e2e-report.mjs`

**Step 1: Write minimal implementation**

Refactor drift collection to keep enough checkpoint context for mini checklist rendering, then update `buildCadenceDriftMiniChecklistLines` to append:
- `recovery 快照: ...`
- `回切校验: drift ...`
- `-> [checkpoints](...)`

Only drifting rows should be rendered in this section.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS with the richer mini checklist output.

### Task 3: Sync docs and TODO heartbeat metadata

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`

**Step 1: Update docs**

Document that the drift-only mini checklist now carries the recovery snapshot short note and `回切校验` summary inline.

**Step 2: Update TODO**

Mark heartbeat item one hundred ten complete and add the next follow-up item as the new active TODO.

### Task 4: Full verification and delivery

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run required verification**

Run exactly:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

Expected: PASS

**Step 2: Commit and delivery**

Attempt:

```bash
git switch -c feat/auto-phase3-drift-mini-recovery-notes
git add TODO.md PROGRESS.log README.md scripts/e2e-report.mjs scripts/regression-checks.mjs docs/plans/2026-03-30-phase3-drift-mini-recovery-note-design.md docs/plans/2026-03-30-phase3-drift-mini-recovery-note-plan.md
git commit -m "feat: enrich phase3 drift mini checklist"
git checkout main
git merge --ff-only feat/auto-phase3-drift-mini-recovery-notes
git push origin main
```

If local branch checkout or merge is blocked by sandboxed `.git` locks, use the existing repo fallback:
- commit on the current writable branch,
- push `HEAD` to `feat/auto-phase3-drift-mini-recovery-notes`,
- verify `origin/main` is an ancestor of `HEAD`,
- push `HEAD` to `main`,
- keep all feature branches.
