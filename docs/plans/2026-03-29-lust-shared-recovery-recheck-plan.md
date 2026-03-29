# Lust Shared Recovery Recheck Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reprioritize the active Lust phase-3 pacing work into a concrete shared-recovery extension, then implement that narrow timing pass with regression coverage.

**Architecture:** Keep the change data-driven. Update `TODO.md` first so the active item is actionable, raise the regression expectation for Lust phase-3 shared `majorSpecial` recovery, then bump the value in `data.js` and sync `README.md` / `PROGRESS.log`.

**Tech Stack:** Plain JavaScript, Phaser runtime data tables, Node regression checks, Markdown docs.

---

### Task 1: Prioritize the backlog into an actionable item

**Files:**
- Modify: `TODO.md`

**Step 1: Rewrite the active item**

Replace the observation-only active TODO with a concrete shared-recovery pass.

**Step 2: Leave a single follow-up**

Keep one next observation item for a possible `illusion` recovery revisit if spacing is still too dense.

### Task 2: Lock the stronger shared-recovery contract

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Raise the expected Lust phase-3 `sharedAttackRecoveryMs.majorSpecial` value and tighten the README wording assertion.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the shared-recovery contract.

### Task 3: Write the minimal implementation

**Files:**
- Modify: `data.js`
- Modify: `README.md`

**Step 1: Raise shared recovery**

Increase Lust phase-3 `sharedAttackRecoveryMs.majorSpecial` one small step.

**Step 2: Sync docs**

Update the Phase 3 README paragraph so it states the shared `majorSpecial` recovery was stretched again after the longer `reverseControl` recovery pass.

**Step 3: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new shared-recovery expectation.

### Task 4: Close the implemented item and audit the run

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Mark the concrete shared-recovery item complete**

Record the completion timestamp and leave the follow-up observation active.

**Step 2: Append the audit line**

Log the implemented item, exact verification command result, and merge/push outcome or blocker.
