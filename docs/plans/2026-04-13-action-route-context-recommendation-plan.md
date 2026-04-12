# Action-Route Context Recommendation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let the action-oriented blessing shrines surface high-confidence choice-panel recommendations from the player's live combat bottlenecks before the route is selected.

**Architecture:** Extend the shared event-room recommendation helper with conservative action-context scoring driven by cooldown, stamina, and readiness state. Keep `game.js` responsible only for passing the live action preview state into shared helpers during panel open and settlement so the stored recommendation receipt stays aligned with the pre-choice footer.

**Tech Stack:** Plain JavaScript, shared gameplay helpers in `shared/game-core.js`, Phaser scene wiring in `game.js`, CLI regression checks in `scripts/regression-checks.mjs`.

---

### Task 1: Record the heartbeat scope

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-04-13-action-route-context-recommendation-design.md`
- Create: `docs/plans/2026-04-13-action-route-context-recommendation-plan.md`

**Step 1: Reprioritize TODO**

- move the landed action-route encounter-anchor slice into `Completed`
- promote the new action-route recommendation item to `Active`
- queue the post-choice echo follow-up behind it

**Step 2: Save the design and plan docs**

- document the live-action signals the recommendation helper may trust
- lock the recommendation reasons that should be considered high confidence

### Task 2: Write the failing regression coverage

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Add red assertions**

Cover:

- `战技圣坛` recommending `连斩修习 / 游步修习` from attack-vs-dodge bottlenecks
- `镇压 / 战势 / 连携 / 反击` recommendations from high-confidence control, stamina, or cooldown bottlenecks
- resolution persisting one of the new action-context recommendation reasons when the selected route earned it
- README / help overlay mentioning that action-route recommendations now use live combat state

**Step 2: Verify RED**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new action-route recommendation assertions.

### Task 3: Implement the shared recommendation scoring

**Files:**
- Modify: `shared/game-core.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Add combat-state helpers**

- normalize the relevant action-preview inputs
- derive conservative “time until ready” or “stamina-starved” signals without parsing HUD strings

**Step 2: Extend recommendation decision rules**

- add action-route cases for `combatDisciplineShrine`, `controlRoutingShrine`, `combatFlowShrine`, `comboLinkShrine`, and `counterattackShrine`
- keep the existing static-context recommendation cases unchanged

**Step 3: Verify GREEN**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new recommendation assertions.

### Task 4: Thread runtime preview state and docs

**Files:**
- Modify: `game.js`
- Modify: `README.md`
- Test: `scripts/regression-checks.mjs`

**Step 1: Pass the live action state into shared helpers**

- include cooldown, stamina, regen, and action-cost state when opening the choice panel
- pass the same fields during settlement so the stored recommendation receipt matches the pre-choice footer

**Step 2: Update README and help overlay**

- document that action-route recommendations now respond to live combat bottlenecks before selection

**Step 3: Re-run regression checks**

Run: `node scripts/regression-checks.mjs`
Expected: PASS with docs/help regex coverage still green.

### Task 5: Verify, audit, and ship with git fallback

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run the required verification command**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS.

**Step 2: Attempt the requested git flow**

- use `feat/auto-action-route-recommendations`
- if the live repo still blocks `pull` and local branch creation, mirror the verified changes into a temp clone, commit there, fast-forward merge into its `main`, and attempt pushes
- always append the exact blocker/fallback details to `PROGRESS.log`
