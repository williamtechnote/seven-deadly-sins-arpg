# 连斩修习命中兑现提示 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a lightweight but visible hit-payoff cue when `连斩修习` turns reduced normal-attack cooldown into a genuinely faster next attack hit.

**Architecture:** Reuse the existing `连斩就绪` readiness edge to arm a short-lived faster-than-base eligibility window in `Player`, tag only the immediate next normal attack from that window, then consume the tag on enemy/boss hit paths to emit a dedicated `连斩` hit cue.

**Tech Stack:** Phaser 3, plain JavaScript, Node regression script

---

### Task 1: Lock the faster-hit contract with a failing regression

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Add source assertions for:

- `连斩就绪` readiness edge also arming a hit-payoff eligibility window
- normal-attack spawn path tagging only the immediate next attack with that payoff window
- enemy and boss hit handling consuming the tag to show a dedicated `连斩` cue
- README/help overlay documenting the hit-payoff moment

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the missing hit-payoff hook/docs

### Task 2: Implement the runtime cue

**Files:**
- Modify: `game.js`

**Step 1: Write minimal implementation**

- track the base ready time for normal attacks
- arm/claim/consume a one-shot `连斩` hit-payoff window
- tag the next normal attack hitbox with the payoff metadata
- show a light `连斩` floating text plus pulse only when that hit truly lands before the baseline window closes

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

### Task 3: Update docs and heartbeat tracking

**Files:**
- Modify: `README.md`
- Modify: `docs/gameplay-run-variety-principles.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Update docs**

Document that `连斩修习` now pays off at both the early-ready HUD edge and the actual earlier hit moment.

**Step 2: Run required verification**

Run exactly:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

**Step 3: Commit**

Use a focused feature commit on `feat/auto-discipline-hit-payoff-cue`.
