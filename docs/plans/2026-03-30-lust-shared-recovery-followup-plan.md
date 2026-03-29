# Lust Shared Recovery Follow-Up Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend Lust phase-3 shared major-special recovery again so the next `reverseControl` / `illusion` / `mirageDance` cycle leaves a clearer breathing window after the longer `mirageDance` recovery pass.

**Architecture:** Reuse the existing phase-level `sharedAttackRecoveryMs.majorSpecial` pacing hook in `data.js` rather than inventing a new selector rule. Lock the behavior with regression checks in `scripts/regression-checks.mjs` and reflect the tuning clearly in `README.md` and `TODO.md`.

**Tech Stack:** Phaser 3 runtime, plain JavaScript, Node CLI regression checks

---

### Task 1: Lock the new pacing contract in tests

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

- Update the Lust shared-recovery regression to expect the new `majorSpecial` recovery value.
- Update the README regex check to expect wording for the new post-`mirageDance` shared-recovery follow-up.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new shared-recovery contract and/or README wording.

**Step 3: Write minimal implementation**

- Raise `BOSSES.lust.phases[2].sharedAttackRecoveryMs.majorSpecial` in `data.js`.
- Update the Lust pacing paragraph in `README.md`.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

### Task 2: Close the heartbeat cycle

**Files:**
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update task tracking**

- Mark item fifty-two complete.
- Add the next observation item as the only active TODO.

**Step 2: Run full verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

**Step 3: Commit**

```bash
git add TODO.md PROGRESS.log README.md data.js scripts/regression-checks.mjs docs/plans/2026-03-30-lust-shared-recovery-followup-design.md docs/plans/2026-03-30-lust-shared-recovery-followup-plan.md
git commit -m "feat: extend lust shared recovery follow-up"
```
