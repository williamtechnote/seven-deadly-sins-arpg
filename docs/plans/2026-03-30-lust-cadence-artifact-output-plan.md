# Lust Cadence Artifact Output Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Emit reusable Playwright cadence review artifacts for Lust phase 3 so live pacing review gets checkpoint text, telegraph screenshot, and shared-recovery snapshot automatically.

**Architecture:** Add one pure artifact-bundle builder in `shared/game-core.js`, cover it in `scripts/regression-checks.mjs`, then feed that bundle into the existing Playwright evidence helper so the E2E spec writes and attaches the new files without duplicating formatting logic.

**Tech Stack:** JavaScript, Node.js, Phaser 3, Playwright

---

### Task 1: Add the failing regression test

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add a regression check for `buildBossAttackCadenceArtifactBundle` that expects:
- readable checkpoint text lines
- telegraph snapshot metadata
- shared recovery snapshot metadata

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because `buildBossAttackCadenceArtifactBundle` does not exist yet.

### Task 2: Implement the minimal artifact bundle

**Files:**
- Modify: `shared/game-core.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write minimal implementation**

Add `buildBossAttackCadenceArtifactBundle(options)` that composes:
- existing cadence review checklist
- plain-text checkpoint lines
- telegraph snapshot summary
- shared recovery snapshot summary

**Step 2: Run regression checks**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new artifact-bundle test.

### Task 3: Wire Playwright evidence output

**Files:**
- Modify: `tests/e2e/helpers/game-driver.js`
- Modify: `tests/e2e/lust-phase3-cadence.spec.js`
- Modify: `README.md`

**Step 1: Update the E2E helper**

Teach `dumpEvidence` to optionally write cadence review files and attach them to `testInfo`.

**Step 2: Use the helper in the cadence spec**

Pass the live cadence bundle, plus a dedicated telegraph screenshot request, into `dumpEvidence`.

**Step 3: Update docs**

Document the new artifact files in `README.md`.

### Task 4: Verify and close the heartbeat cycle

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Run required verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`

**Step 2: Update backlog and audit**

Mark item 一百零二 complete, append the next active follow-up, and log the mandatory heartbeat audit line in `PROGRESS.log`.
