# Challenge Corner-Angle Mixed Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Lock the next two corner-angle mixed challenge decorator pairs into the documented regression contract while leaving one adjacent follow-up active.

**Architecture:** Reuse the existing recursive decorator stripping in `shared/game-core.js`, add failing regression assertions for the current `［〈挑战〉］` item and the new `〈［挑战］〉` follow-up, then sync `README.md`, `game.js`, and `TODO.md`. Only change runtime code if the new assertions expose a real parser gap.

**Tech Stack:** JavaScript, Phaser 3, Node CLI regression checks

---

### Task 1: Rebuild the active queue

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-11-challenge-corner-angle-mixed-design.md`
- Create: `docs/plans/2026-03-11-challenge-corner-angle-mixed-plan.md`

**Step 1: Prioritize the three adjacent items**

Keep `［〈挑战〉］` first, `〈［挑战］〉` second, and `〈[挑战]〉` third.

**Step 2: Record the scope**

Save the design and implementation notes so the next heartbeat can continue the corner-angle lane without re-deriving it.

### Task 2: Drive the red-green cycle

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `README.md`
- Modify: `game.js`
- Modify: `shared/game-core.js` (only if the new tests prove it is necessary)

**Step 1: Write the failing test**

Add regression assertions for:
- `［〈挑战〉］` / `〈［本局挑战］〉`
- `〈［挑战］〉` / `［〈本局挑战〉］`
- README/help overlay mentions for both mixed-wrapper pairs

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new contract assertions while existing runtime support likely already passes.

**Step 3: Write minimal implementation**

Update README/help overlay strings and only patch `shared/game-core.js` if the helper misses either wrapper pair.

**Step 4: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS

### Task 3: Verify and ship

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run required verification**

Run:
- `node --check game.js`
- `node --check data.js`
- `node --check shared/game-core.js`
- `node scripts/regression-checks.mjs`

**Step 2: Update the audit trail**

Append the mandatory heartbeat line with tasks, branch handling, tests, merge status, push status, and blocker details.
