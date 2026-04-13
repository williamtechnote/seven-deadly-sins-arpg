# Action-Route Boss Posture Extension Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let Boss posture break ties inside the remaining action-route shrines, then preserve those reasons through routed encounter feedback.

**Architecture:** Extend the shared Boss-recommendation reason map in `shared/game-core.js`, add failing regression coverage in `scripts/regression-checks.mjs`, reuse the existing routed encounter feedback ladder for the new reasons, and sync TODO/README/methodology docs so the contract stays explicit.

**Tech Stack:** Vanilla JavaScript, shared game-core helpers, Node regression script, Markdown docs

---

### Task 1: Record the heartbeat scope

**Files:**
- Modify: `TODO.md`
- Create: `docs/methodology/arpg-boss-posture-recommendation-contract.md`
- Create: `docs/plans/2026-04-13-action-route-boss-posture-extension-design.md`
- Create: `docs/plans/2026-04-13-action-route-boss-posture-extension-plan.md`

**Step 1: Reprioritize TODO**

Promote the finer-grained Boss-posture extension into the heartbeat record, then leave one broader follow-up in `Next Up`.

**Step 2: Save the supporting docs**

Document when Boss posture is allowed to override silence and how it must survive into routed encounter feedback.

### Task 2: Write the failing regression slice

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add footer assertions**

Lock that the shared recommendation helper can return:

- `镇步修习 · 目标Boss更宜控场`
- `借势修习 · 目标Boss更宜借势`
- `催锋修习 · 目标Boss更宜连段`
- `追猎修习 · 目标Boss更宜追猎`
- `调息修习 · 目标Boss更宜回体`

when no stronger live-state reason is already present.

**Step 2: Add routed encounter assertions**

Lock that the same reasons still resolve to the existing combat-facing echoes.

**Step 3: Run the RED check**

Run: `node scripts/regression-checks.mjs`

Expected: FAIL because the shared helper does not yet understand the new Boss-posture reasons.

### Task 3: Implement the shared logic

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Extend the Boss-posture reason map**

Add compact shared reason constants for control / momentum / combo / hunt alongside the existing sustain / measured-dodge / chase reasons.

**Step 2: Add narrow shrine-specific tiebreakers**

Only return the new Boss-posture recommendation when the current shrine has no stronger live-state reason.

**Step 3: Reuse the existing routed encounter echoes**

Map the new Boss-posture reasons back onto the already-established action-route encounter echoes.

**Step 4: Run the GREEN check**

Run: `node scripts/regression-checks.mjs`

Expected: PASS

### Task 4: Sync repo docs

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`

**Step 1: Update README**

Document the new Boss-aware action-route footer examples and their routed encounter echoes.

**Step 2: Mark the TODO complete**

Move the heartbeat item into `Completed` with the cycle timestamp and keep the next broader follow-up visible.

### Task 5: Verify and deliver the heartbeat

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run the exact required verification command**

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

**Step 2: Attempt the required git flow**

Create `feat/auto-action-route-boss-posture-extension`, commit after verification, merge into `main`, attempt to push `main`, keep the feature branch, and record blockers/fallbacks precisely in `PROGRESS.log`.
