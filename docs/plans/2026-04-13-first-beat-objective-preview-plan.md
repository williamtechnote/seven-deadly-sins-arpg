# First-Beat Objective Preview Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move the routed encounter's first-beat objective into shrine-side previews so players can plan the first tactical action before room entry.

**Architecture:** Reuse the existing shared encounter-profile-to-objective mapping in `shared/game-core.js`, expose a compact preview formatter for shrine-side surfaces, and wire that formatter into both unresolved choice lines and resolved route summaries. Keep portal hover unchanged because it does not know the future route.

**Tech Stack:** Vanilla JS, Phaser 3, shared gameplay helpers, custom Node regression script

---

### Task 1: Lock the desired preview contract in failing regressions

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add shared-helper expectations**

Add assertions for a new helper that turns routed encounter profiles into:

- `下间缓冲 · 先稳前排`
- `下间高压 · 先拆夹角`
- `下间淘金 · 先盯后排`

and returns an empty string for unknown or missing profiles.

**Step 2: Update shrine-preview expectations**

Change existing choice/resolved preview assertions so routed encounter previews expect the new compact objective forecast instead of `下间缓冲 / 下间高压 / 下间淘金` alone.

**Step 3: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because the helper and updated preview wiring do not exist yet.

### Task 2: Implement the shared formatter and preview wiring

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Add the formatter**

Create a shared formatter that combines the existing preview label with the existing objective cue mapping.

**Step 2: Wire shrine-side surfaces**

Use the new formatter in:

- `formatRunEventRoomChoiceEncounterPreview`
- resolved route-summary construction for selected choices

Keep room-entry cue helpers and portal helpers unchanged.

**Step 3: Run regression to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS for the new helper and updated shrine-preview contract.

### Task 3: Sync docs and backlog

**Files:**
- Modify: `TODO.md`
- Modify: `README.md`
- Modify: `game.js`
- Modify: `docs/methodology/arpg-precommit-objective-forecast.md`

**Step 1: Promote the active TODO**

Record the concrete first-beat objective preview item as active, then mark it complete after implementation. Leave one narrower follow-up about whether wider surfaces should also restore staging anchors like `三敌齐压 / 双低压 / 双赏金`.

**Step 2: Update player-facing copy**

Document that shrine previews and resolved summaries now show `下间X · 首拍目标`, while room entry still repeats the objective as a one-shot cue.

**Step 3: Run full verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS

### Task 4: Integrate and audit

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Commit**

Run:

```bash
git add TODO.md README.md game.js shared/game-core.js scripts/regression-checks.mjs docs/methodology/arpg-precommit-objective-forecast.md docs/plans/2026-04-13-first-beat-objective-preview-design.md docs/plans/2026-04-13-first-beat-objective-preview-plan.md PROGRESS.log
git commit -m "feat: add first-beat objective previews"
```

**Step 2: Merge and push**

Run:

```bash
git switch main
git merge --ff-only feat/auto-first-beat-objective-preview
git push github feat/auto-first-beat-objective-preview
git push github main
```
