# Encounter Staging Receipt Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a shared encounter staging receipt for resolved event rooms so players can read the next combat contract before entering room 3.

**Architecture:** Extend the shared run-event encounter helpers with one staging formatter that reuses existing encounter-profile and recommendation-echo logic. Wire that formatter into resolved HUD lines and settlement feedback, then lock the contract with regression checks and a short README note.

**Tech Stack:** JavaScript, Phaser 3, shared game helpers, regex-based regression checks

---

### Task 1: Add the new planning/doc context

**Files:**
- Create: `docs/methodology/arpg-payoff-staging-ladder.md`
- Create: `docs/plans/2026-04-13-encounter-staging-receipt-design.md`
- Create: `docs/plans/2026-04-13-encounter-staging-receipt-plan.md`
- Modify: `TODO.md`

**Step 1: Document the staging ladder**

Write a concise methodology note that explains decision -> receipt -> staging -> trigger -> recap.

**Step 2: Reprioritize TODO**

Add a new active item for encounter staging receipts and move the previous active item to `Next Up`.

### Task 2: Write the failing tests

**Files:**
- Modify: `scripts/regression-checks.mjs`

**Step 1: Add helper expectations**

Add direct assertions for a shared staging helper that returns `遭遇: ...` for known routed room types and empty string for unknown ones.

**Step 2: Update resolved HUD expectations**

Change resolved HUD-line tests so known routed room types emit a dedicated `遭遇:` line before compact settlement text.

**Step 3: Update scene wiring expectations**

Change the settlement-feedback regex expectation to require the new shared staging helper instead of a raw `encounterProfile.previewLabel`.

### Task 3: Implement the shared helper

**Files:**
- Modify: `shared/game-core.js`

**Step 1: Add `buildRunEventEncounterStagingReceipt`**

Reuse the existing encounter label, tactical suffix, and recommendation echo contract.

**Step 2: Thread it into HUD summaries**

Expose a dedicated staging line for resolved known room types while preserving current fallbacks for unknown types.

### Task 4: Implement runtime wiring and docs

**Files:**
- Modify: `game.js`
- Modify: `README.md`

**Step 1: Use the staging helper in settlement feedback**

Append a `遭遇:` line when the shared helper returns one.

**Step 2: Update README**

Explain that resolved event-room HUD / settlement now carry the compact staged encounter receipt before room-3 entry.

### Task 5: Verify and integrate

**Files:**
- Modify: `PROGRESS.log`

**Step 1: Run verification**

Run: `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`

**Step 2: Commit and merge**

Commit the feature branch, merge it into `main`, push `main`, and append the required audit line.
