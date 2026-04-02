# Event Room Intent Tags Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Surface short tactical tags for unresolved event-room routes so players can classify options faster during a run.

**Architecture:** Tighten regression expectations first, then add one pure tag-mapping helper in `shared/game-core.js`, pipe existing preview/HUD builders through it, and finish with README/TODO/PROGRESS plus a reusable methodology doc.

**Tech Stack:** Node.js, plain JavaScript, Markdown

---

### Task 1: Red Test For Event-Room Tags

**Files:**
- Modify: `scripts/regression-checks.mjs`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write the failing test**

Expect event-room previews and unresolved HUD lines to include short tags like `[续航/净化]` and `[经济/冒险]`.

**Step 2: Run test to verify it fails**

Run: `node scripts/regression-checks.mjs`
Expected: FAIL because previews still show label + numbers only.

### Task 2: Minimal Shared Implementation

**Files:**
- Modify: `shared/game-core.js`
- Test: `scripts/regression-checks.mjs`

**Step 1: Write minimal implementation**

Add one helper that maps route effects to 1-2 tactical tags, then reuse it in `buildRunEventRoomChoicePreview` and unresolved HUD route lines.

**Step 2: Run test to verify it passes**

Run: `node scripts/regression-checks.mjs`
Expected: PASS.

### Task 3: Documentation And Heartbeat Trail

**Files:**
- Modify: `README.md`
- Modify: `TODO.md`
- Modify: `PROGRESS.log`
- Create: `docs/methodology/arpg-event-room-decision-framework.md`
- Create: `docs/plans/2026-04-02-event-room-intent-tags-design.md`
- Create: `docs/plans/2026-04-02-event-room-intent-tags-plan.md`

**Step 1: Update docs**

Document the new intent-tag language, record the completed TODO, and promote one follow-up that adds context-sensitive weighting.

**Step 2: Run required verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
Expected: PASS.
