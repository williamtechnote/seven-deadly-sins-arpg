# Action-Route Recommendation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend high-confidence event-room recommendations into live action-state routes so the choice panel can recommend action blessings before selection and persist those reasons into routed room-3 echoes.

**Architecture:** Reuse the current choice-panel preview snapshot, but add action cooldown / stamina inputs from `game.js`. Keep the recommendation rules, preview notes, and encounter-echo upgrades in `shared/game-core.js` so the repo still has one deterministic contract for pre-choice, post-choice, and room-3 feedback.

**Tech Stack:** Phaser 3 runtime, shared JS helpers, Node regression checks

---

### Task 1: Write the failing regression cases

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add assertions for:

- `战技圣坛` recommending `连斩修习 · 普攻正卡冷却`
- `战技圣坛` recommending `游步修习 · 闪避正差体`
- `连携圣坛` recommending `催锋修习 · 特攻正卡冷却`
- `战势圣坛` recommending `借势修习 · 可接闪特爆发`
- `反击圣坛` recommending `追猎修习 · 可接闪后追击`
- entry / clear / source cue helpers upgrading from baseline anchor to the new recommendation-specific echo when those persisted reasons exist

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL in the new recommendation / encounter-echo assertions because the shared helper does not understand action-state recommendations yet.

### Task 2: Implement the shared recommendation logic

**Files:**
- Modify: `shared/game-core.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write minimal implementation**

Add shared helpers that:

- derive action bottleneck / combo-ready context from cooldown + stamina snapshot
- append matching action-state notes to relevant choice previews
- emit conservative recommendation decisions for the first-wave action-route pairs
- translate persisted action-route reasons into route-specific encounter echoes / source cues

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new helper assertions.

### Task 3: Wire the new preview snapshot through the scene

**Files:**
- Modify: `game.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write minimal implementation**

Extend `_openRunEventChoicePanel()` preview state with the action cooldown / stamina data the shared helper needs. Keep ordering and rendering unchanged aside from the new notes/footer content.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the runtime source-hook assertions.

### Task 4: Sync docs and heartbeat tracking

**Files:**
- Modify: `TODO.md`
- Modify: `README.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs**

Document that action-state recommendations can now elevate first-wave action blessings before selection and persist into room-3 encounter echoes.

**Step 2: Run full heartbeat verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

### Task 5: Commit and integrate

**Files:**
- Commit the modified feature files above

**Step 1: Commit on the feature branch**

```bash
git add TODO.md PROGRESS.log README.md docs/plans/2026-04-13-action-route-recommendation-design.md docs/plans/2026-04-13-action-route-recommendation-plan.md game.js shared/game-core.js scripts/regression-checks.mjs
git commit -m "feat: add action route recommendations"
```

**Step 2: Merge to main and push**

- fast-forward `main` from the verified feature branch
- push `feat/auto-action-route-recommendation`
- push `main`
- keep the feature branch intact
