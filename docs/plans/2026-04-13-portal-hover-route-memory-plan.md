# Portal Hover Route Memory Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reuse the persisted last-run recap at portal focus time so the next door choice happens beside a compact `选门参考` reminder instead of a separate memory scan.

**Architecture:** Add a shared portal-focus formatter in `shared/game-core.js`, let `HubScene` detect the nearest in-range portal and render a fixed-position summary card from that helper, then lock helper output, runtime wiring, and README copy with regression checks.

**Tech Stack:** Vanilla JavaScript, Phaser 3, repo regression checks

---

### Task 1: Queue the heartbeat item and docs

**Files:**
- Modify: `TODO.md`
- Create: `docs/plans/2026-04-13-portal-hover-route-memory-design.md`
- Create: `docs/plans/2026-04-13-portal-hover-route-memory-plan.md`

**Step 1: Promote the heartbeat TODO**

Add an active item focused on portal-decision route memory.

**Step 2: Keep the follow-up narrow**

Point the next item at a later run-history evaluation instead of committing to it now.

### Task 2: Write the failing regression checks

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add shared-helper expectations**

Verify the portal-focus helper keeps:

- a visible target/route/source card when all fields exist
- a readable two-line fallback when only target plus one last-run anchor exist
- a hidden result when no target or no meaningful recap exists

**Step 2: Add runtime-source assertions**

Verify `HubScene`:

- imports the shared helper
- tracks a focused portal from the current hub portals
- renders and updates a dedicated `选门参考` panel only when the helper is visible

**Step 3: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`

Expected: FAIL because the portal-focus helper/runtime panel do not exist yet.

### Task 3: Implement the shared helper and hub panel

**Files:**
- Modify: `shared/game-core.js`
- Modify: `game.js`

**Step 1: Add the shared formatter**

Implement a helper that turns `lastRunSummary + targetLabel` into a compact `选门参考` payload with stable fallbacks.

**Step 2: Import and initialize the helper in `HubScene`**

Create fixed-position text objects for the panel and keep them hidden by default.

**Step 3: Track portal focus**

Pick the nearest portal within a short radius during `HubScene.update` and rebuild the helper output from the focused portal label.

**Step 4: Render the decision card**

Show the panel only while a meaningful portal-focus summary exists.

**Step 5: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`

Expected: PASS

### Task 4: Sync README and heartbeat bookkeeping

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`

**Step 1: Mark the item complete**

Move the portal-focus item into `Completed` with timestamp and seed the next evaluation item.

**Step 2: Update the README**

Document that approaching a portal now shows a compact route-memory decision card.

**Step 3: Append the audit line**

Record task, branch, exact checks, merge status, and any push blocker/fallback.

### Task 5: Verify, commit, merge, push

**Files:**
- Modify: repo git state only after verification

**Step 1: Use the required repo flow**

Use the prepared temp branch `feat/auto-portal-hover-route-memory` for commit/merge work.

**Step 2: Run the required verification command**

Run exactly:

```bash
node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
```

**Step 3: Commit and merge only after verification**

Commit on `feat/auto-portal-hover-route-memory`, merge into `main`, attempt to push `main`, keep the feature branch, and record any blocker precisely in `PROGRESS.log`.
