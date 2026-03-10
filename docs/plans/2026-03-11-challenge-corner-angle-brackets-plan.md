# Challenge Corner-Angle Brackets Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend the documented run-challenge decorator contract to the next corner-angle + bracket-family mixed wrappers while keeping one adjacent follow-up queued.

**Architecture:** Reuse the existing recursive decorator stripping in `shared/game-core.js`, drive the work through regression assertions first, and then sync `README.md`, `game.js`, `TODO.md`, and `PROGRESS.log`. Only touch shared runtime logic if the new tests expose a real parser gap.

**Tech Stack:** JavaScript, Phaser 3, Node CLI regression checks

---

### Task 1: Rebuild the active queue

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-03-11-challenge-corner-angle-brackets-design.md`
- Create: `docs/plans/2026-03-11-challenge-corner-angle-brackets-plan.md`

**Step 1: Prioritize the next three items**

Keep `corner-angle/square` first, `corner-angle/white tortoise-shell bracket` second, and `corner-angle/white square bracket` third.

**Step 2: Record the scope**

Document the selected approach so the next heartbeat can continue the same lane without re-deriving it.

### Task 2: Drive the red-green cycle

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Modify: `README.md`
- Modify: `game.js`
- Modify: `shared/game-core.js` (only if the new assertions expose a runtime gap)

**Step 1: Write the failing test**

Add regression assertions for:
- `〈【挑战】〉` / `【〈本局挑战〉】`
- `〈〘挑战〙〉` / `〘〈本局挑战〉〙`
- README/help-overlay mentions for both mixed-wrapper pairs

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL on the new documented-contract assertions until README/help copy is updated.

**Step 3: Write minimal implementation**

Update README/help-overlay strings and only patch `shared/game-core.js` if either wrapper pair is not already handled by the recursive decorator stripping helper.

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
