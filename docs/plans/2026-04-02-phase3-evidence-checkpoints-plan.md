# Phase 3 Evidence Checkpoints Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add the checkpoint artifact to the no-drift Lust phase 3 cadence summary so all four review attachments are reachable from the first screen.

**Architecture:** Tighten the regression expectation first, then extend the shared cadence-summary evidence helper in `scripts/e2e-report.mjs` and reuse that helper for the drift checklist without duplicating links. Finish by updating README/TODO/PROGRESS so the heartbeat trail stays auditable.

**Tech Stack:** Node.js, plain JavaScript, markdown docs

---

### Task 1: Red Test For No-Drift Evidence Links

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Expect the no-drift `Phase 3 汇总` fixture to include `[checkpoints](artifacts/e2e/lust-phase3-cadence-review/phase3-checkpoints.txt)` in the dedicated `evidence` short line.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the summary currently omits the checkpoint link.

### Task 2: Minimal Evidence-Link Update

**Files:**
- Modify: `scripts/e2e-report.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write minimal implementation**

Add the checkpoint link to `buildCadenceSummaryEvidenceLinks`, then let `buildCadenceChecklistEvidenceLinks` reuse that result directly so the checklist keeps one copy of each anchor.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS.

### Task 3: Heartbeat Metadata

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`
- Create: `docs/plans/2026-04-02-phase3-evidence-checkpoints-design.md`
- Create: `docs/plans/2026-04-02-phase3-evidence-checkpoints-plan.md`

**Step 1: Update docs**

Document the full `[review] [checkpoints] [recovery] [telegraph]` shortcut set in README, mark the current TODO complete, and add one newly brainstormed follow-up item.

**Step 2: Run required verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS.

### Task 4: Git Delivery

**Files:**
- Modify: git history only

**Step 1: Commit on feature branch**

Run: `git add ... && git commit -m "feat: add phase 3 checkpoint evidence shortcut"`

**Step 2: Merge and push**

Run: `git checkout main && git merge --ff-only feat/auto-phase3-evidence-checkpoints && git push origin feat/auto-phase3-evidence-checkpoints && git push origin main`
Expected: Succeed in the writable clone, or record the exact blocker and fallback in `PROGRESS.log`.
